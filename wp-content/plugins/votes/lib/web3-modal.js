import {
  updateWalletInstallationStatus,
  connectMetaMask,
  connectTrustWallet,
  connectCoinbaseWallet,
  connectReownConnect,
} from "./connectors.js";

// Import ProposalsUtils from proposals.js
import { ProposalsUtils } from "./proposals.js";
// Import ERC20 contract
import erc20Contract from "../../burn-dashboard/lib/erc20.js";

class Web3Modal {
  constructor() {
    this.modal = document.querySelector(".web-modal-container");
    this.closeButton = document.querySelector(".web-modal-close-button");
    this.walletLinks = document.querySelectorAll(".web-modal-wallet-link");
    this.isConnecting = false;
    this.networkModal = document.querySelector(".network-modal-container");
    this.networkCloseButton = document.querySelector(
      ".network-modal-close-button"
    );
    this.networkSwitchButton = document.querySelector(".network-switch-button");
    this.modalBackground = null;
    this.isFirstModal = true;
    this.lastRejectedModal = null;
    this.provider = null;
    this.isSwitchingNetwork = false;
    this.userTriedToOpenBurnModal = false;
    this.hasAnimated = false;
    this.isAddingNetwork = false;
    this.isTriggeringCreateProposal = false;
    this.balanceUpdateInProgress = false;
    this.lastBalanceUpdate = null;
    this.balanceUpdatePromise = null;
    this.isInitializing = false;
    this.balanceInitialized = false;

    // Initialize animation state
    if (!window.walletButtonAnimated) {
      window.walletButtonAnimated = {
        connect: false,
        disconnect: false,
      };
    }

    // Initialize ethereum event listeners immediately if provider exists
    if (window.ethereum) {
      this.setupNetworkChangeListener();
    } else {
      // If provider doesn't exist yet, wait for it
      window.addEventListener(
        "ethereum#initialized",
        () => {
          this.setupNetworkChangeListener();
        },
        { once: true }
      );
    }

    // Initialize UI immediately
    this.initializeWalletButton();
    this.initializeMobileWalletButton();
    this.modifyButtonsBlock();

    window.addEventListener("load", () => {
      // Re-initialize UI after page load to ensure proper state
      this.initializeWalletButton();
      this.initializeMobileWalletButton();
      this.modifyButtonsBlock();
    });

    this.initializeEventListeners();
    this.updateWalletStatus();
  }

  initializeWalletButton() {
    const button = document.querySelector(".connect-wallet-button");
    if (button) {
      // Remove any existing event listeners
      const newButton = button.cloneNode(true);
      const state = window.globalWalletSigner ? "disconnect" : "connect";

      // Add animation-complete if we've already animated this state
      if (window.walletButtonAnimated[state]) {
        newButton.classList.add("animation-complete");
      }

      button.parentNode.replaceChild(newButton, button);

      // Add click handler based on wallet state
      if (window.globalWalletSigner) {
        newButton.addEventListener("click", () => {
          this.disconnectWallet();
        });
      } else {
        newButton.addEventListener("click", () => {
          this.show();
        });
      }

      // Set hasAnimated after the first animation completes
      if (!window.walletButtonAnimated[state]) {
        newButton.addEventListener(
          "animationend",
          () => {
            window.walletButtonAnimated[state] = true;
            newButton.classList.add("animation-complete");
          },
          { once: true }
        );
      }
    }
  }

  initializeMobileWalletButton() {
    const headerHolder = document.querySelector(
      !window.aitechSingleProposal ? ".aitech-header" : ".proposal-sidebar"
    );
    if (headerHolder) {
      // Create mobile button container if it doesn't exist
      let mobileButtonContainer = headerHolder.querySelector(
        ".mobile-wallet-button-container"
      );
      if (!mobileButtonContainer) {
        mobileButtonContainer = document.createElement("div");
        mobileButtonContainer.className = "mobile-wallet-button-container";
        // Insert as third child (index 2)
        if (headerHolder.children.length >= 0) {
          headerHolder.insertBefore(
            mobileButtonContainer,
            headerHolder.children[0]
          );
        } else {
          headerHolder.appendChild(mobileButtonContainer);
        }
      }

      const state = window.globalWalletSigner ? "disconnect" : "connect";

      // Add click handler
      const button = mobileButtonContainer.querySelector(
        ".connect-wallet-button"
      );
      if (button) {
        if (window.globalWalletSigner) {
          button.addEventListener("click", () => {
            this.disconnectWallet();
          });
        } else {
          button.addEventListener("click", () => {
            this.show();
          });
        }

        // Set hasAnimated after the first animation completes
        if (!window.walletButtonAnimated[state]) {
          button.addEventListener(
            "animationend",
            () => {
              window.walletButtonAnimated[state] = true;
              button.classList.add("animation-complete");
            },
            { once: true }
          );
        }
      }
    }
  }

  async modifyButtonsBlock() {
    const buttonsBlock = document.querySelector(
      !window.aitechSingleProposal
        ? ".aitech-vote-container"
        : ".aitech-container"
    );
    const mobileButtonContainer = document.querySelector(
      ".mobile-wallet-button-container"
    );

    const state = window.globalWalletSigner ? "disconnect" : "connect";

    if (buttonsBlock) {
      // Store the share button if it exists
      const shareButton = buttonsBlock.querySelector(".aitech-share");
      const shareButtonClone = shareButton ? shareButton.cloneNode(true) : null;

      // Remove any existing wallet button or widget
      const existingWalletButton = buttonsBlock.querySelector(
        ".connect-wallet-button"
      );
      if (existingWalletButton) existingWalletButton.remove();
      const existingProfileWidget = buttonsBlock.querySelector(
        ".wallet-profile-widget"
      );
      if (existingProfileWidget) existingProfileWidget.remove();

      // Create wallet button container if it doesn't exist
      let walletButtonContainer = buttonsBlock.querySelector(
        ".wallet-button-container"
      );

      if (window.aitechSingleProposal) {
        const walletOld = window.jQuery(".wallet-button-container");

        if (walletOld) {
          walletOld.remove();
        }

        walletButtonContainer = document.createElement("div");
        walletButtonContainer.className = "wallet-button-container";
        buttonsBlock.insertBefore(
          walletButtonContainer,
          buttonsBlock.firstChild
        );
      } else if (!window.aitechSingleProposal && !walletButtonContainer) {
        walletButtonContainer = document.createElement("div");
        walletButtonContainer.className = "wallet-button-container";
        buttonsBlock.appendChild(walletButtonContainer);
      }

      // Clear the container but preserve the share button
      walletButtonContainer.innerHTML = "";

      // Add back the share button if it existed
      if (shareButtonClone) {
        walletButtonContainer.appendChild(shareButtonClone);
      }

      if (window.globalWalletSigner) {
        // --- Profile Widget ---
        const widget = document.createElement("div");
        widget.className = "wallet-profile-widget";
        widget.style.position = "relative";
        widget.style.display = "inline-block";
        widget.style.cursor = "pointer";
        widget.style.position = "absolute";

        // Only apply fade animation if not already animated
        if (!window.walletButtonAnimated[state]) {
          widget.style.opacity = "0";
          widget.style.transition = "opacity 0.3s ease-in-out";
        }

        // Avatar (placeholder, you can replace with actual avatar logic)
        const avatar = document.createElement("img");
        avatar.src = "/wp-content/plugins/votes/assets/avatar-default.svg";
        avatar.alt = "avatar";
        avatar.style.width = "32px";
        avatar.style.height = "32px";
        avatar.style.borderRadius = "8px";
        avatar.style.objectFit = "cover";
        avatar.style.marginRight = "10px";
        avatar.style.verticalAlign = "middle";

        // Balance element
        const balance = document.createElement("span");
        balance.className = "wallet-profile-balance";
        balance.dataset.state = "initial";

        // Use cached balance if available, otherwise show loading state
        if (this.balanceInitialized && this.lastBalanceUpdate) {
          balance.textContent = this.lastBalanceUpdate;
          balance.dataset.state = "loaded";
        } else if (!window.globalWalletSigner?.address) {
          balance.textContent = "0.00";
          balance.dataset.state = "no-wallet";
        } else {
          balance.textContent = "0.00";
          balance.dataset.state = "loading";
          // Only initialize if we haven't before
          if (!this.balanceInitialized) {
            this.initializeBalance(
              balance,
              window.globalWalletSigner.address
            ).catch((error) => {
              console.error("Failed to initialize balance:", error);
            });
          }
        }
        balance.style.opacity = "1";

        const accountBalance = document.createElement("span");
        accountBalance.className = "wallet-profile-balance-text";
        accountBalance.textContent = "Account balance";

        // Dropdown arrow
        const arrow = document.createElement("span");
        arrow.innerHTML = `<img src="/wp-content/plugins/votes/assets/arrow-down.svg" alt="arrow-down" />`;
        arrow.style.marginLeft = "10px";

        const balanceWrapper = document.createElement("div");
        balanceWrapper.className = "wallet-profile-balance-wrapper";
        balanceWrapper.appendChild(balance);
        balanceWrapper.appendChild(accountBalance);
        balanceWrapper.style.display = "flex";
        balanceWrapper.style.flexDirection = "column";
        balanceWrapper.style.alignItems = "flex-start";

        widget.appendChild(avatar);
        widget.appendChild(balanceWrapper);
        widget.appendChild(arrow);

        // Add widget to DOM first
        walletButtonContainer.appendChild(widget);

        // Dropdown menu
        const dropdown = document.createElement("div");
        dropdown.className = "wallet-profile-dropdown";
        dropdown.style.display = "none";
        dropdown.style.position = "absolute";
        dropdown.style.top = "40px";
        dropdown.style.right = "0";
        dropdown.style.padding = "24px";
        dropdown.style.zIndex = "1000";
        dropdown.style.opacity = "0";
        dropdown.style.transition = "opacity 0.2s ease-in-out";
        dropdown.style.visibility = "hidden";

        // My Profile option
        const profileOption = document.createElement("a");
        profileOption.href = `/profile/${window.globalWalletSigner.address}`;
        profileOption.innerHTML = `<img src="/wp-content/plugins/votes/assets/my-profile.svg" alt="my-profile" /> My Profile`;
        profileOption.style.display = "flex";
        profileOption.style.alignItems = "center";
        profileOption.style.gap = "12px";
        profileOption.style.padding = "12px 16px";
        profileOption.style.color = "#fff";
        profileOption.style.textDecoration = "none";
        profileOption.style.cursor = "pointer";

        // Disconnect option
        const disconnectOption = document.createElement("div");
        disconnectOption.innerHTML = `<img src="/wp-content/plugins/votes/assets/logout.svg" alt="logout" /> Disconnect`;
        disconnectOption.style.display = "flex";
        disconnectOption.style.alignItems = "center";
        disconnectOption.style.gap = "12px";
        disconnectOption.style.padding = "12px 16px";
        disconnectOption.style.color = "#fff";
        disconnectOption.style.cursor = "pointer";
        disconnectOption.addEventListener("click", (e) => {
          e.preventDefault();
          this.disconnectWallet();
          dropdown.style.visibility = "hidden";
          dropdown.style.opacity = "0";
        });

        dropdown.appendChild(profileOption);
        dropdown.appendChild(disconnectOption);
        widget.appendChild(dropdown);

        // Toggle dropdown on click
        widget.addEventListener("click", (e) => {
          e.stopPropagation();
          if (dropdown.style.display === "block") {
            dropdown.style.visibility = "hidden";
            dropdown.style.opacity = "0";
            setTimeout(() => {
              dropdown.style.display = "none";
            }, 200);
          } else {
            dropdown.style.display = "block";
            // Trigger reflow
            dropdown.offsetHeight;
            dropdown.style.visibility = "visible";
            dropdown.style.opacity = "1";
          }
        });

        // Hide dropdown when clicking outside
        document.addEventListener("click", (e) => {
          if (!widget.contains(e.target)) {
            dropdown.style.visibility = "hidden";
            dropdown.style.opacity = "0";
            setTimeout(() => {
              dropdown.style.display = "none";
            }, 200);
          }
        });

        // Only trigger fade-in animation if not already animated
        if (!window.walletButtonAnimated[state]) {
          requestAnimationFrame(() => {
            widget.style.opacity = "1";
            // Set animation complete after transition
            setTimeout(() => {
              window.walletButtonAnimated[state] = true;
            }, 300);
          });
        }
      } else {
        // --- Connect Button ---
        const connectButton = document.createElement("button");
        connectButton.className = `connect-wallet-button ${
          window.walletButtonAnimated[state] ? "animation-complete" : ""
        }`;
        connectButton.textContent = "Connect Wallet";

        // Only apply fade animation if not already animated
        if (!window.walletButtonAnimated[state]) {
          connectButton.style.opacity = "0";
          connectButton.style.transition = "opacity 0.3s ease-in-out";
        }

        connectButton.addEventListener("click", () => {
          this.show();
        });
        walletButtonContainer.appendChild(connectButton);

        // Only trigger fade-in animation if not already animated
        if (!window.walletButtonAnimated[state]) {
          requestAnimationFrame(() => {
            connectButton.style.opacity = "1";
            // Set animation complete after transition
            setTimeout(() => {
              window.walletButtonAnimated[state] = true;
            }, 300);
          });
        }

        if (!window.walletButtonAnimated[state]) {
          connectButton.addEventListener(
            "animationend",
            () => {
              window.walletButtonAnimated[state] = true;
              connectButton.classList.add("animation-complete");
            },
            { once: true }
          );
        }
      }
    }

    // Update mobile button if it exists
    if (mobileButtonContainer) {
      const headerHolder = document.querySelector(
        !window.aitechSingleProposal ? ".aitech-header" : ".proposal-sidebar"
      );

      // Store the share button if it exists
      const shareButton = headerHolder.querySelector(".aitech-share");
      const shareButtonClone = shareButton ? shareButton.cloneNode(true) : null;

      // Remove any existing wallet button or widget
      const existingWalletButton = headerHolder.querySelector(
        ".connect-wallet-button"
      );
      if (existingWalletButton) existingWalletButton.remove();
      const existingProfileWidget = headerHolder.querySelector(
        ".wallet-profile-widget"
      );
      if (existingProfileWidget) existingProfileWidget.remove();

      // Create wallet button container if it doesn't exist
      let walletButtonContainer = headerHolder.querySelector(
        ".mobile-wallet-button-container"
      );

      if (window.aitechSingleProposal) {
        const walletOld = window.jQuery(".mobile-wallet-button-container");
        if (walletOld) {
          walletOld.remove();
        }

        walletButtonContainer = document.createElement("div");
        walletButtonContainer.className = "mobile-wallet-button-container";
        headerHolder.insertBefore(
          walletButtonContainer,
          headerHolder.firstChild
        );
      } else if (!window.aitechSingleProposal && !walletButtonContainer) {
        walletButtonContainer = document.createElement("div");
        walletButtonContainer.className = "mobile-wallet-button-container";
        headerHolder.appendChild(walletButtonContainer);
      }

      // Clear the container but preserve the share button
      walletButtonContainer.innerHTML = "";

      // Add back the share button if it existed
      if (shareButtonClone) {
        walletButtonContainer.appendChild(shareButtonClone);
      }

      if (window.globalWalletSigner) {
        // --- Profile Widget ---
        const widget = document.createElement("div");
        widget.className = "wallet-profile-widget";
        widget.style.position = "relative";
        widget.style.display = "inline-block";
        widget.style.cursor = "pointer";
        widget.style.position = "relative";
        widget.style.left = "0";
        widget.style.justifyContent = "flex-end";
        widget.style.padding = "0px";

        // Only apply fade animation if not already animated
        if (!window.walletButtonAnimated[state]) {
          widget.style.opacity = "0";
          widget.style.transition = "opacity 0.3s ease-in-out";
        }

        // Avatar (placeholder, you can replace with actual avatar logic)
        const avatar = document.createElement("img");
        avatar.src = "/wp-content/plugins/votes/assets/avatar-default.svg";
        avatar.alt = "avatar";
        avatar.style.width = "32px";
        avatar.style.height = "32px";
        avatar.style.borderRadius = "8px";
        avatar.style.objectFit = "cover";
        avatar.style.marginRight = "10px";
        avatar.style.verticalAlign = "middle";

        // Balance element
        const balance = document.createElement("span");
        balance.className = "wallet-profile-balance";
        balance.dataset.state = "initial";

        // Use cached balance if available, otherwise show loading state
        if (this.balanceInitialized && this.lastBalanceUpdate) {
          balance.textContent = this.lastBalanceUpdate;
          balance.dataset.state = "loaded";
        } else if (!window.globalWalletSigner?.address) {
          balance.textContent = "0.00";
          balance.dataset.state = "no-wallet";
        } else {
          balance.textContent = "0.00";
          balance.dataset.state = "loading";
          // Only initialize if we haven't before
          if (!this.balanceInitialized) {
            this.initializeBalance(
              balance,
              window.globalWalletSigner.address
            ).catch((error) => {
              console.error("Failed to initialize balance:", error);
            });
          }
        }
        balance.style.opacity = "1";

        const accountBalance = document.createElement("span");
        accountBalance.className = "wallet-profile-balance-text";
        accountBalance.textContent = "Account balance";

        // Dropdown arrow
        const arrow = document.createElement("span");
        arrow.innerHTML = `<img src="/wp-content/plugins/votes/assets/arrow-down.svg" alt="arrow-down" />`;
        arrow.style.marginLeft = "10px";

        const balanceWrapper = document.createElement("div");
        balanceWrapper.className = "wallet-profile-balance-wrapper";
        balanceWrapper.appendChild(balance);
        balanceWrapper.appendChild(accountBalance);
        balanceWrapper.style.display = "flex";
        balanceWrapper.style.flexDirection = "column";
        balanceWrapper.style.alignItems = "flex-start";

        widget.appendChild(avatar);
        widget.appendChild(balanceWrapper);
        widget.appendChild(arrow);

        // Add widget to DOM first
        walletButtonContainer.appendChild(widget);

        // Dropdown menu
        const dropdown = document.createElement("div");
        dropdown.className = "wallet-profile-dropdown";
        dropdown.style.display = "none";
        dropdown.style.position = "absolute";
        dropdown.style.top = "40px";
        dropdown.style.right = "0";
        dropdown.style.padding = "24px";
        dropdown.style.zIndex = "1000";
        dropdown.style.opacity = "0";
        dropdown.style.transition = "opacity 0.2s ease-in-out";
        dropdown.style.visibility = "hidden";

        // My Profile option
        const profileOption = document.createElement("a");
        profileOption.href = `/profile/${window.globalWalletSigner.address}`;
        profileOption.innerHTML = `<img src="/wp-content/plugins/votes/assets/my-profile.svg" alt="my-profile" /> My Profile`;
        profileOption.style.display = "flex";
        profileOption.style.alignItems = "center";
        profileOption.style.gap = "12px";
        profileOption.style.padding = "12px 16px";
        profileOption.style.color = "#fff";
        profileOption.style.textDecoration = "none";
        profileOption.style.cursor = "pointer";

        // Disconnect option
        const disconnectOption = document.createElement("div");
        disconnectOption.innerHTML = `<img src="/wp-content/plugins/votes/assets/logout.svg" alt="logout" /> Disconnect`;
        disconnectOption.style.display = "flex";
        disconnectOption.style.alignItems = "center";
        disconnectOption.style.gap = "12px";
        disconnectOption.style.padding = "12px 16px";
        disconnectOption.style.color = "#fff";
        disconnectOption.style.cursor = "pointer";
        disconnectOption.addEventListener("click", (e) => {
          e.preventDefault();
          this.disconnectWallet();
          dropdown.style.visibility = "hidden";
          dropdown.style.opacity = "0";
        });

        dropdown.appendChild(profileOption);
        dropdown.appendChild(disconnectOption);
        widget.appendChild(dropdown);

        // Toggle dropdown on click
        widget.addEventListener("click", (e) => {
          e.stopPropagation();
          if (dropdown.style.display === "block") {
            dropdown.style.visibility = "hidden";
            dropdown.style.opacity = "0";
            setTimeout(() => {
              dropdown.style.display = "none";
            }, 200);
          } else {
            dropdown.style.display = "block";
            // Trigger reflow
            dropdown.offsetHeight;
            dropdown.style.visibility = "visible";
            dropdown.style.opacity = "1";
          }
        });

        // Hide dropdown when clicking outside
        document.addEventListener("click", (e) => {
          if (!widget.contains(e.target)) {
            dropdown.style.visibility = "hidden";
            dropdown.style.opacity = "0";
            setTimeout(() => {
              dropdown.style.display = "none";
            }, 200);
          }
        });

        // Only trigger fade-in animation if not already animated
        if (!window.walletButtonAnimated[state]) {
          requestAnimationFrame(() => {
            widget.style.opacity = "1";
            // Set animation complete after transition
            setTimeout(() => {
              window.walletButtonAnimated[state] = true;
            }, 300);
          });
        }
      } else {
        // --- Connect Button ---
        const connectButton = document.createElement("button");
        connectButton.className = `connect-wallet-button ${
          window.walletButtonAnimated[state] ? "animation-complete" : ""
        }`;
        connectButton.textContent = "Connect Wallet";

        // Only apply fade animation if not already animated
        if (!window.walletButtonAnimated[state]) {
          connectButton.style.opacity = "0";
          connectButton.style.transition = "opacity 0.3s ease-in-out";
        }

        connectButton.addEventListener("click", () => {
          this.show();
        });
        walletButtonContainer.appendChild(connectButton);

        // Only trigger fade-in animation if not already animated
        if (!window.walletButtonAnimated[state]) {
          requestAnimationFrame(() => {
            connectButton.style.opacity = "1";
            // Set animation complete after transition
            setTimeout(() => {
              window.walletButtonAnimated[state] = true;
            }, 300);
          });
        }

        if (!window.walletButtonAnimated[state]) {
          connectButton.addEventListener(
            "animationend",
            () => {
              window.walletButtonAnimated[state] = true;
              connectButton.classList.add("animation-complete");
            },
            { once: true }
          );
        }
      }
    }
  }

  async disconnectWallet() {
    try {
      const walletType = localStorage.getItem("walletType");
      if (walletType === "reown") {
        window.walletConnect.disconnect();
      }

      const termsAccepted = localStorage.getItem("aitech_terms_accepted");

      // Clear the global wallet signer
      window.globalWalletSigner = null;
      localStorage.clear();

      if (termsAccepted) {
        localStorage.setItem("aitech_terms_accepted", termsAccepted);
      }

      // Reset balance update state
      this.balanceUpdatePromise = null;
      this.lastBalanceUpdate = null;
      this.balanceInitialized = false;

      // Update all balance elements to show default state
      const balanceElements = document.querySelectorAll(
        ".wallet-profile-balance"
      );
      balanceElements.forEach((balanceElement) => {
        balanceElement.textContent = "0.00";
        balanceElement.style.opacity = "1";
        balanceElement.dataset.state = "no-wallet";
        delete balanceElement.dataset.lastBalance;
        delete balanceElement.dataset.hasBalance;
      });

      // Hide any open modals
      this.hide();
      this.hideNetworkModal();

      // Update the UI to show connect button
      this.modifyButtonsBlock();
      this.initializeWalletButton();
      this.initializeMobileWalletButton();

      // Dispatch wallet state changed event
      const event = new CustomEvent("walletStateChanged", {
        detail: {
          connected: false,
          signer: null,
        },
      });
      window.dispatchEvent(event);

      // If we're on a single proposal page, reset vote selection
      // Remove selected and selected-even class from all choices
      window.jQuery(".voting-choice").removeClass("selected selected-even");

      // Remove all active borders
      window.jQuery(".result-option-active-border").each(function () {
        const inner = window.jQuery(this).children(".voting-choice");
        if (inner.length) {
          window.jQuery(this).replaceWith(inner);
        }
      });

      // Reset vote button state
      window.jQuery(".vote-btn").prop("disabled", true).addClass("disabled");

      // Disable quadratic voting buttons
      window
        .jQuery(".vote-plus, .vote-minus")
        .prop("disabled", true)
        .addClass("disabled");

      // Reset state's selected vote option
      if (window.aitechSingleProposal?.state) {
        window.aitechSingleProposal.state.selectedVoteOption = null;
        // Clear quadratic votes when wallet disconnects
        if (window.aitechSingleProposal.state.quadraticVotes) {
          window.aitechSingleProposal.state.quadraticVotes = {};
          window.aitechSingleProposal.state.updateQuadraticVotesUI();
        }
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }

  async initializeProvider() {
    try {
      // If we already have a globalWalletSigner, use its provider
      if (window.globalWalletSigner && window.globalWalletSigner.provider) {
        const provider = window.globalWalletSigner.provider;
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        return { provider, signer: window.globalWalletSigner, address };
      }

      // For other wallets, initialize from window.ethereum
      if (!window.ethereum) {
        throw new Error("No ethereum provider found");
      }

      const provider = new window.ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      window.globalWalletSigner = {
        address: address,
        provider: provider,
        type: "metamask",
      };

      this.provider = provider;

      return { provider, signer: window.globalWalletSigner, address };
    } catch (error) {
      console.error("Error initializing provider:", error);
      throw error;
    }
  }

  setupNetworkChangeListener() {
    if (!window.ethereum) {
      return;
    }

    // Remove any existing listeners first
    window.ethereum.removeAllListeners("chainChanged");
    window.ethereum.removeAllListeners("accountsChanged");

    window.ethereum.on("chainChanged", async (chainId) => {
      this.hideModalBackground();
      this.hideNetworkModal();

      // Convert chainId to number if it's in hex
      const newChainId =
        typeof chainId === "string" ? parseInt(chainId, 16) : chainId;

      try {
        await this.initializeProvider();
        // Only update balance if we have a signer and haven't initialized before
        if (window.globalWalletSigner?.address && !this.balanceInitialized) {
          const balanceElements = document.querySelectorAll(
            ".wallet-profile-balance"
          );
          if (balanceElements.length > 0) {
            const balance = await this.initializeBalance(
              balanceElements[0],
              window.globalWalletSigner.address
            );
            // Update other balance elements with the same value
            for (let i = 1; i < balanceElements.length; i++) {
              balanceElements[i].textContent = balance;
              balanceElements[i].style.opacity = "1";
              balanceElements[i].dataset.state = "loaded";
            }
          }
        }
        // Only handle network change if user was trying to create proposal
        if (this.userTriedToOpenBurnModal) {
          if (
            newChainId === 1 &&
            !this.isAddingNetwork &&
            !this.isSwitchingNetwork
          ) {
            // Small delay to ensure network switch is complete
            setTimeout(() => {
              this.triggerCreateProposal();
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error reinitializing provider:", error);
      }
    });

    window.ethereum.on("accountsChanged", async (accounts) => {
      if (accounts.length === 0) {
        this.handleWalletDisconnected();
      } else {
        try {
          await this.initializeProvider();
          const provider = new window.ethers.providers.Web3Provider(
            window.ethereum,
            "any"
          );
          const network = await provider.getNetwork();
          const chainId = network.chainId;

          // Only reset balance state if we're actually changing accounts
          if (window.globalWalletSigner?.address !== accounts[0]) {
            this.balanceInitialized = false;
            this.lastBalanceUpdate = null;
          }

          // Update UI and ensure balance is updated
          await this.modifyButtonsBlock();

          // Only handle network state if user was trying to create proposal
          if (this.userTriedToOpenBurnModal) {
            if (chainId === 1) {
              setTimeout(() => {
                this.triggerCreateProposal();
              }, 500);
            } else {
              this.lastRejectedModal = "network";
              this.isFirstModal = true;
              this.showModalBackground();
              this.showNetworkModal();
            }
          }
        } catch (error) {
          console.error("Error handling account change:", error);
        }
      }
    });
  }

  handleChainChanged() {
    if (this.lastRejectedModal === "network") {
      this.showNetworkModal();
    }
  }

  handleWalletDisconnected() {
    this.lastRejectedModal = null;
    window.globalWalletSigner = null;

    // If we're on a single proposal page, reset vote selection
    // Remove selected and selected-even class from all choices
    window.jQuery(".voting-choice").removeClass("selected selected-even");

    // Remove all active borders
    window.jQuery(".result-option-active-border").each(function () {
      const inner = window.jQuery(this).children(".voting-choice");
      if (inner.length) {
        window.jQuery(this).replaceWith(inner);
      }
    });

    // Reset vote button state
    window.jQuery(".vote-btn").prop("disabled", true).addClass("disabled");

    // Disable quadratic voting buttons
    window
      .jQuery(".vote-plus, .vote-minus")
      .prop("disabled", true)
      .addClass("disabled");

    // Reset state's selected vote option
    if (window.aitechSingleProposal?.state) {
      window.aitechSingleProposal.state.selectedVoteOption = null;
      // Clear quadratic votes when wallet disconnects
      if (window.aitechSingleProposal.state.quadraticVotes) {
        window.aitechSingleProposal.state.quadraticVotes = {};
        window.aitechSingleProposal.state.updateQuadraticVotesUI();
      }
    }

    // Update UI (this will now handle balance update internally)
    this.modifyButtonsBlock();
  }

  createModalBackground() {
    if (!this.modalBackground) {
      this.modalBackground = document.createElement("div");
      this.modalBackground.className = "modal-background";
      this.modalBackground.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.2);
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(this.modalBackground);
    }
    return this.modalBackground;
  }

  showModalBackground() {
    const background = this.createModalBackground();
    requestAnimationFrame(() => {
      background.style.opacity = "1";
    });
  }

  hideModalBackground() {
    const modalBackground =
      this.modalBackground || document.querySelector(".modal-background");

    if (modalBackground) {
      modalBackground.style.opacity = "0";
      setTimeout(() => {
        if (modalBackground && modalBackground.parentNode) {
          modalBackground.parentNode.removeChild(modalBackground);
          this.modalBackground = null;
        }
      }, 300);
    }
  }

  initializeEventListeners() {
    // Remove any existing event listeners first
    this.cleanupEventListeners();

    // Store bound event handlers for cleanup
    this.boundHandlers = {
      closeModal: () => this.hide(),
      closeNetworkModal: () => this.hideNetworkModal(),
      switchNetwork: async () => await this.switchToEthereumNetwork(),
      modalClick: (e) => {
        if (e.target === this.modal) {
          this.hide();
        }
      },
      networkModalClick: (e) => {
        if (e.target === this.networkModal) {
          this.hideNetworkModal();
        }
      },
      walletClick: async (e) => {
        if (this.isConnecting) return;
        const walletType = e.currentTarget.dataset.wallet;
        await this.connectWallet(walletType);
      },
    };

    // Add event listeners with bound handlers
    if (this.closeButton) {
      this.closeButton.addEventListener("click", this.boundHandlers.closeModal);
    }

    if (this.networkCloseButton) {
      this.networkCloseButton.addEventListener(
        "click",
        this.boundHandlers.closeNetworkModal
      );
    }

    if (this.networkSwitchButton) {
      this.networkSwitchButton.addEventListener(
        "click",
        this.boundHandlers.switchNetwork
      );
    }

    if (this.modal) {
      this.modal.addEventListener("click", this.boundHandlers.modalClick);
    }

    if (this.networkModal) {
      this.networkModal.addEventListener(
        "click",
        this.boundHandlers.networkModalClick
      );
    }

    // Add wallet click handlers - only if we have wallet links
    if (this.walletLinks && this.walletLinks.length > 0) {
      this.walletLinks.forEach((link) => {
        if (link && link.parentNode) {
          try {
            // Create a new link with the same attributes
            const newLink = link.cloneNode(true);
            // Copy all attributes
            Array.from(link.attributes).forEach((attr) => {
              newLink.setAttribute(attr.name, attr.value);
            });
            // Replace the old link with the new one
            link.parentNode.replaceChild(newLink, link);
            // Add new click handler
            newLink.addEventListener("click", this.boundHandlers.walletClick);
          } catch (error) {
            console.warn("Error replacing wallet link:", error);
            // Fallback: just add the event listener to the existing link
            link.addEventListener("click", this.boundHandlers.walletClick);
          }
        }
      });
    }

    // Add global event listeners
    window.addEventListener("showNetworkModal", () => {
      this.showNetworkModal();
    });

    window.addEventListener("walletConnected", (event) => {
      this.handleWalletConnected(event.detail);
    });
  }

  cleanupEventListeners() {
    // Remove all event listeners using bound handlers
    if (this.boundHandlers) {
      if (this.closeButton) {
        this.closeButton.removeEventListener(
          "click",
          this.boundHandlers.closeModal
        );
      }
      if (this.networkCloseButton) {
        this.networkCloseButton.removeEventListener(
          "click",
          this.boundHandlers.closeNetworkModal
        );
      }
      if (this.networkSwitchButton) {
        this.networkSwitchButton.removeEventListener(
          "click",
          this.boundHandlers.switchNetwork
        );
      }
      if (this.modal) {
        this.modal.removeEventListener("click", this.boundHandlers.modalClick);
      }
      if (this.networkModal) {
        this.networkModal.removeEventListener(
          "click",
          this.boundHandlers.networkModalClick
        );
      }

      // Remove wallet click handlers
      if (this.walletLinks) {
        this.walletLinks.forEach((link) => {
          if (link) {
            link.removeEventListener("click", this.boundHandlers.walletClick);
          }
        });
      }

      // Remove global event listeners
      window.removeEventListener("showNetworkModal", () => {
        this.showNetworkModal();
      });
      window.removeEventListener("walletConnected", (event) => {
        this.handleWalletConnected(event.detail);
      });
    }
  }

  async handleActionClick(action) {
    this.userTriedToOpenBurnModal = true;

    // If no wallet is connected, show wallet connect modal
    if (!window.globalWalletSigner) {
      this.lastRejectedModal = "wallet";
      this.isFirstModal = true;
      this.showModalBackground();
      this.show();
      return;
    }

    try {
      // Initialize provider and check network
      const { provider, signer, address } = await this.initializeProvider();
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      // If not on Ethereum network, show network switch modal
      if (chainId !== 1) {
        this.lastRejectedModal = "network";
        this.isFirstModal = true;
        this.showModalBackground();
        this.showNetworkModal();
        return;
      }

      // If on correct network, trigger create proposal
      this.lastRejectedModal = null;
      const event = new CustomEvent("createProposal", {
        detail: {
          signer: window.globalWalletSigner,
          userInitiated: true,
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error checking network:", error);
      this.lastRejectedModal = "wallet";
      this.isFirstModal = true;
      this.showModalBackground();
      this.show();
    }
  }

  async switchToEthereumNetwork() {
    try {
      if (!window.globalWalletSigner) {
        this.lastRejectedModal = "wallet";
        this.show();
        return;
      }

      // Prevent multiple simultaneous network switch attempts
      if (this.isSwitchingNetwork || this.isAddingNetwork) {
        return;
      }

      this.isSwitchingNetwork = true;

      if (window.globalWalletSigner.type === "reown") {
        await window.walletConnect.switchToEthereumNetwork(async () => {
          await this.initializeProvider();
          this.onSuccessSwitchNetwork();
        });
        return;
      }

      // All wallet types use Web3Provider, so we need to get the underlying provider
      const provider = window.globalWalletSigner.provider.provider;

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }],
        });

        await this.initializeProvider();
        this.onSuccessSwitchNetwork();
      } catch (switchError) {
        if (switchError.code === 4902) {
          // Only proceed with adding network if we're not already adding it
          if (!this.isAddingNetwork) {
            await this.addEthereumMainnet();
          }
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error("Failed to switch network:", error);
      this.lastRejectedModal = "network";
    } finally {
      this.isSwitchingNetwork = false;
    }
  }

  async addEthereumMainnet() {
    // Prevent multiple simultaneous network addition attempts
    if (this.isAddingNetwork) {
      return;
    }

    try {
      this.isAddingNetwork = true;
      this.isSwitchingNetwork = true;

      // Get the ethereum provider directly from window
      const ethereum = window.ethereum;

      // Add the network
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x1",
            chainName: "Ethereum",
            rpcUrls: ["https://0xrpc.io/eth"],
            blockExplorerUrls: ["https://etherscan.io"],
            nativeCurrency: {
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
            },
          },
        ],
      });

      // Wait a bit for the network to be fully added
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Switch to the newly added network
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      });

      this.hideModalBackground();
      this.hideNetworkModal();

      // Create new provider and signer
      const newProvider = new window.ethers.providers.Web3Provider(
        ethereum,
        "any"
      );
      const signer = await newProvider.getSigner();
      const address = await signer.getAddress();

      // Update global signer with new provider
      window.globalWalletSigner = {
        address: address,
        provider: newProvider,
        type: "metamask",
      };

      // Let the chain change listener handle the create proposal
    } catch (error) {
      console.error("Error adding network:", error);
      this.lastRejectedModal = "network";
    } finally {
      // Set a longer delay before resetting the flags to ensure chain change listener
      // has time to process the network change
      setTimeout(() => {
        this.isAddingNetwork = false;
        this.isSwitchingNetwork = false;
      }, 2000);
    }
  }

  onSuccessSwitchNetwork() {
    this.hideNetworkModal();
    this.hideModalBackground();

    // If user was trying to create proposal, trigger the event
    if (this.userTriedToOpenBurnModal) {
      this.triggerCreateProposal();
    }
  }

  showNetworkModal() {
    if (this.isFirstModal) {
      this.showModalBackground();
    }
    if (this.networkModal) {
      this.networkModal.style.display = "flex";
      // Trigger reflow
      this.networkModal.offsetHeight;
      this.networkModal.classList.add("active");
    } else {
      console.error("Network modal element not found");
    }
  }

  hideNetworkModal() {
    if (this.networkModal) {
      this.networkModal.classList.remove("active");
      setTimeout(() => {
        if (this.networkModal) {
          this.networkModal.style.display = "none";
          this.hideModalBackground();
        }
      }, 300);
    }
    this.isFirstModal = false;
  }

  async connectWallet(walletType) {
    if (this.isConnecting) return;

    try {
      this.isConnecting = true;
      const walletLink = document.querySelector(
        `[data-wallet="${walletType}"]`
      );
      walletLink?.classList.add("connecting");

      let signer;
      switch (walletType) {
        case "metamask":
          signer = await connectMetaMask();
          break;
        case "trust":
          signer = await connectTrustWallet();
          break;
        case "coinbase":
          signer = await connectCoinbaseWallet();
          break;
        case "reown":
          signer = await connectReownConnect(true);
          this.hide();
          break;
        default:
          throw new Error("Unsupported wallet type");
      }

      if (signer) {
        // Initialize provider and set global signer
        const { provider } = await this.initializeProvider();
        window.globalWalletSigner = signer;

        // Handle wallet connection
        await this.handleWalletConnected(signer);
        this.hide();
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      const walletLink = document.querySelector(
        `[data-wallet="${walletType}"]`
      );
      walletLink?.classList.add("error");
      setTimeout(() => {
        walletLink?.classList.remove("error");
      }, 2000);

      if (error.message.includes("not installed")) {
        return;
      } else if (error.message.includes("rejected")) {
        // Don't show alert for user rejection
        return;
      } else {
        alert("Error connecting to wallet: " + error.message);
      }
    } finally {
      this.isConnecting = false;
      const walletLink = document.querySelector(
        `[data-wallet="${walletType}"]`
      );
      walletLink?.classList.remove("connecting");
    }
  }

  async handleWalletConnected(signer) {
    const connectedWallet = document.querySelector(
      `[data-wallet="${signer.type}"]`
    );
    if (connectedWallet) {
      this.walletLinks.forEach((link) => {
        link.classList.remove("active", "connecting", "error");
      });
      connectedWallet.classList.add("active");
    }

    // Reset balance update state
    this.balanceUpdatePromise = null;
    this.lastBalanceUpdate = null;
    this.balanceInitialized = false;

    // Update global wallet signer
    window.globalWalletSigner = signer;

    // Update UI and ensure balance is updated
    await this.modifyButtonsBlock();

    // Only do initial balance update if we haven't initialized before
    if (signer?.address) {
      const balanceElements = document.querySelectorAll(
        ".wallet-profile-balance"
      );
      try {
        // Only initialize the first balance element, others will use the cached value
        if (balanceElements.length > 0) {
          const balance = await this.initializeBalance(
            balanceElements[0],
            signer.address
          );

          // Update other balance elements with the same value
          for (let i = 1; i < balanceElements.length; i++) {
            balanceElements[i].textContent = balance;
            balanceElements[i].style.opacity = "1";
            balanceElements[i].dataset.state = "loaded";
          }
        }
      } catch (error) {
        console.error(
          "Error during initial balance update after connection:",
          error
        );
      }
    } else {
    }

    // Check network after connection but don't show modal
    try {
      const provider = new window.ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      // Initialize vote status if we're on a single proposal page and API is available
      if (
        window.aitechSingleProposal?.state?.proposalId &&
        window.SingleProposalAPI?.initializeVoteStatus
      ) {
        try {
          await window.SingleProposalAPI.initializeVoteStatus(
            window.aitechSingleProposal.state.proposalId
          );
        } catch (error) {
          console.warn("Could not initialize vote status:", error);
        }
      }

      // Dispatch wallet connected event with network info
      const event = new CustomEvent("walletStateChanged", {
        detail: {
          connected: true,
          signer: signer,
          chainId: chainId,
          wasVoteAttempt:
            this.lastRejectedModal === "wallet" && window.isSingleProposalPage,
        },
      });
      window.dispatchEvent(event);

      const voteEvent = new CustomEvent("walletConnectedForVote", {
        detail: {
          signer: signer,
          chainId: chainId,
        },
      });
      window.dispatchEvent(voteEvent);
    } catch (error) {
      console.error("Error checking network after connection:", error);
    }
  }

  show() {
    if (this.isFirstModal) {
      this.showModalBackground();
    }
    if (this.modal) {
      this.modal.style.display = "flex";
      // Trigger reflow
      this.modal.offsetHeight;
      this.modal.classList.add("active");
    }
    this.updateWalletStatus();
  }

  hide() {
    if (this.modal) {
      this.modal.classList.remove("active");
      setTimeout(() => {
        if (this.modal) {
          this.modal.style.display = "none";
        }
      }, 300);
    }
    this.hideModalBackground();
    this.isFirstModal = false;
  }

  updateWalletStatus() {
    updateWalletInstallationStatus();
  }

  triggerCreateProposal() {
    if (this.isTriggeringCreateProposal) {
      return;
    }

    if (!this.userTriedToOpenBurnModal) {
      return;
    }

    try {
      this.isTriggeringCreateProposal = true;
      const event = new CustomEvent("createProposal", {
        detail: {
          signer: window.globalWalletSigner,
          userInitiated: true,
        },
      });
      window.dispatchEvent(event);
    } finally {
      // Reset the flag after a short delay to prevent any race conditions
      setTimeout(() => {
        this.isTriggeringCreateProposal = false;
        this.userTriedToOpenBurnModal = false;
      }, 100);
    }
  }

  // Add new method to handle initial balance update
  async initializeBalance(balanceElement, address) {
    // If balance is already initialized, just update the display
    if (this.balanceInitialized && this.lastBalanceUpdate) {
      balanceElement.textContent = this.lastBalanceUpdate;
      balanceElement.style.opacity = "1";
      balanceElement.dataset.state = "loaded";
      return this.lastBalanceUpdate;
    }

    // Prevent concurrent initialization
    if (this.isInitializing) {
      // Wait for the current initialization to complete
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      // After waiting, use the updated balance if available
      if (this.lastBalanceUpdate) {
        balanceElement.textContent = this.lastBalanceUpdate;
        balanceElement.style.opacity = "1";
        balanceElement.dataset.state = "loaded";
        return this.lastBalanceUpdate;
      }
    }

    this.isInitializing = true;

    try {
      // Set initial state
      balanceElement.textContent = "0.00";
      balanceElement.style.opacity = "0.7";
      balanceElement.dataset.state = "loading";

      // Wait for contract to be ready
      await erc20Contract.waitForReady();

      // Get balance
      const balanceValue = await erc20Contract.getBalance(address);

      if (balanceValue === undefined || balanceValue === null) {
        throw new Error("Invalid balance value received");
      }

      const numericBalance = parseFloat(balanceValue);

      if (isNaN(numericBalance)) {
        throw new Error("Failed to parse balance value");
      }

      // Format the balance
      const formattedBalance = numericBalance.toFixed(2);

      // Update the balance with a smooth transition
      balanceElement.style.transition = "opacity 0.3s ease-in-out";
      balanceElement.style.opacity = "0";

      // Wait for fade out
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Update the balance
      balanceElement.textContent = formattedBalance;
      balanceElement.dataset.state = "loaded";
      balanceElement.dataset.lastBalance = formattedBalance;

      // Fade back in
      balanceElement.style.opacity = "1";

      // Update global state
      this.lastBalanceUpdate = formattedBalance;
      this.balanceInitialized = true;

      return formattedBalance;
    } catch (error) {
      console.error("Error during balance initialization:", error);
      balanceElement.textContent = "0.00";
      balanceElement.style.opacity = "1";
      balanceElement.dataset.state = "error";
      this.balanceInitialized = false;
      this.lastBalanceUpdate = null;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  // Modify updateWalletBalance to only handle subsequent updates
  async updateWalletBalance(balanceElement, address) {
    // If we're still initializing, don't start a new update
    if (this.isInitializing) {
      return;
    }

    // If we already have an update in progress, return that promise
    if (this.balanceUpdatePromise) {
      return this.balanceUpdatePromise;
    }

    // If we haven't done the initial update yet, do that instead
    if (!this.lastBalanceUpdate) {
      return this.initializeBalance(balanceElement, address);
    }

    // Create a new update promise for subsequent updates
    this.balanceUpdatePromise = (async () => {
      try {
        // ... rest of the update logic ...
      } finally {
        this.balanceUpdatePromise = null;
      }
    })();

    return this.balanceUpdatePromise;
  }
}

const web3Modal = new Web3Modal();

window.web3Modal = web3Modal;

export default web3Modal;
