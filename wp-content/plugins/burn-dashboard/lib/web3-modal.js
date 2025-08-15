import {
  updateWalletInstallationStatus,
  connectMetaMask,
  connectTrustWallet,
  connectCoinbaseWallet,
  connectReownConnect,
} from "./connectors.js";

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
    this.burnButton = document.querySelector(".burn-button");
    this.modalBackground = null;
    this.isFirstModal = true;
    this.lastRejectedModal = null;
    this.provider = null;
    this.isSwitchingNetwork = false;
    this.userTriedToOpenBurnModal = false;
    this.hasAnimated = false;

    // Initialize animation state
    if (!window.walletButtonAnimated) {
      window.walletButtonAnimated = {
        connect: false,
        disconnect: false,
      };
    }

    window.addEventListener("load", () => {
      this.initializeWalletButton();
      this.initializeMobileWalletButton();
    });

    this.initializeEventListeners();
    this.updateWalletStatus();
    this.setupNetworkChangeListener();
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
    const mobileMenu = document.querySelector(".mobile-menu-holder ul");
    if (mobileMenu) {
      // Create mobile menu button container if it doesn't exist
      let mobileButtonContainer = mobileMenu.querySelector(
        ".mobile-wallet-button-container"
      );
      mobileButtonContainer.remove();
      return;
      if (!mobileButtonContainer) {
        mobileButtonContainer = document.createElement("li");
        mobileButtonContainer.className = "mobile-wallet-button-container";
        mobileMenu.appendChild(mobileButtonContainer);
      }

      const state = window.globalWalletSigner ? "disconnect" : "connect";

      // Set up the button
      if (window.globalWalletSigner) {
        mobileButtonContainer.innerHTML = `
          <button class="connect-wallet-button ${
            window.walletButtonAnimated[state] ? "animation-complete" : ""
          }">Disconnect</button>
        `;
      } else {
        mobileButtonContainer.innerHTML = `
          <button class="connect-wallet-button ${
            window.walletButtonAnimated[state] ? "animation-complete" : ""
          }">Connect Wallet</button>
        `;
      }

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

  modifyButtonsBlock() {
    const buttonsBlock = document.querySelector(".aitech-vote-container");
    const mobileButtonContainer = document.querySelector(
      ".mobile-wallet-button-container"
    );

    const state = window.globalWalletSigner ? "disconnect" : "connect";

    if (buttonsBlock) {
      // Remove any existing wallet button
      const existingWalletButton = buttonsBlock.querySelector(
        ".connect-wallet-button"
      );
      if (existingWalletButton) {
        existingWalletButton.remove();
      }

      // Create wallet button container if it doesn't exist
      let walletButtonContainer = buttonsBlock.nextElementSibling;
      if (
        !walletButtonContainer ||
        !walletButtonContainer.classList.contains("wallet-button-container")
      ) {
        walletButtonContainer = document.createElement("div");
        walletButtonContainer.className = "wallet-button-container";
        buttonsBlock.parentNode.insertBefore(
          walletButtonContainer,
          buttonsBlock.nextSibling
        );
      }

      // Create the wallet button
      const connectButton = document.createElement("button");
      connectButton.className = `connect-wallet-button ${
        window.walletButtonAnimated[state] ? "animation-complete" : ""
      }`;

      // Check if wallet is connected
      if (window.globalWalletSigner) {
        connectButton.textContent = "Disconnect";
        connectButton.addEventListener("click", () => {
          this.disconnectWallet();
        });
      } else {
        connectButton.textContent = "Connect Wallet";
        connectButton.addEventListener("click", () => {
          this.show();
        });
      }

      // Clear and append the button
      walletButtonContainer.innerHTML = "";
      walletButtonContainer.appendChild(connectButton);

      // Set hasAnimated after the first animation completes
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

    // Update mobile button if it exists
    if (mobileButtonContainer) {
      const mobileButton = mobileButtonContainer.querySelector(
        ".connect-wallet-button"
      );
      if (mobileButton) {
        if (window.globalWalletSigner) {
          mobileButton.textContent = "Disconnect";
          mobileButton.onclick = () => this.disconnectWallet();
        } else {
          mobileButton.textContent = "Connect Wallet";
          mobileButton.onclick = () => this.show();
        }

        if (window.walletButtonAnimated[state]) {
          mobileButton.classList.add("animation-complete");
        }
      }
    }
  }

  async disconnectWallet() {
    try {
      // If using WalletConnect
      if (window.globalWalletSigner?.type === "reown" && window.walletConnect) {
        await window.walletConnect.disconnect();
      }

      // Clear the global wallet signer
      window.globalWalletSigner = null;
      localStorage.removeItem("walletType");

      // Hide any open modals
      this.hide();
      this.hideNetworkModal();
      this.hideBurnModal();

      // Dispatch wallet state changed event
      const event = new CustomEvent("walletStateChanged", {
        detail: {
          connected: false,
          signer: null,
        },
      });
      window.dispatchEvent(event);

      // Update the button
      this.initializeWalletButton();
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
    if (window.ethereum) {
      window.ethereum.on("chainChanged", async (chainId) => {
        // Convert chainId to number if it's in hex
        const newChainId =
          typeof chainId === "string" ? parseInt(chainId, 16) : chainId;

        // Only show network modal if we're not switching to Binance Mainnet (11155111)
        if (newChainId !== 56 && window.globalWalletSigner) {
          try {
            await this.initializeProvider();
            this.handleChainChanged();
          } catch (error) {
            console.error("Error reinitializing provider:", error);
          }
        }
      });

      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length === 0) {
          this.handleWalletDisconnected();
        } else {
          try {
            // Reinitialize provider when account changes
            await this.initializeProvider();

            // Check network after account change
            const provider = new window.ethers.providers.Web3Provider(
              window.ethereum,
              "any"
            );
            const network = await provider.getNetwork();
            const chainId = network.chainId;

            if (chainId !== 56) {
              // Show network modal if wrong network
              this.showNetworkModal();
            } else {
              // Show burn modal if correct network
              const event = new CustomEvent("showBurnModal", {
                detail: {
                  userInitiated: this.userTriedToOpenBurnModal,
                  signer: window.globalWalletSigner,
                },
              });
              window.dispatchEvent(event);
            }
          } catch (error) {
            console.error("Error handling account change:", error);
          }
        }
      });
    }
  }

  handleChainChanged() {
    this.hideBurnModal();

    if (this.lastRejectedModal === "network") {
      this.showNetworkModal();
    }
  }

  handleWalletDisconnected() {
    this.hideBurnModal();
    this.lastRejectedModal = null;

    const walletType = localStorage.getItem("walletType");
    if (walletType === "reown") {
      window.walletConnect.disconnect();
    }

    localStorage.removeItem("walletType");
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
    if (this.modalBackground) {
      this.modalBackground.style.opacity = "0";
      setTimeout(() => {
        if (this.modalBackground && this.modalBackground.parentNode) {
          this.modalBackground.parentNode.removeChild(this.modalBackground);
          this.modalBackground = null;
        }
      }, 300);
    }
  }

  initializeEventListeners() {
    this.closeButton?.addEventListener("click", () => {
      this.hide();
    });

    this.networkCloseButton?.addEventListener("click", () => {
      this.hideNetworkModal();
    });

    this.networkSwitchButton?.addEventListener("click", async () => {
      await this.switchToBinanceNetwork();
    });

    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    this.networkModal?.addEventListener("click", (e) => {
      if (e.target === this.networkModal) {
        this.hideNetworkModal();
      }
    });

    window.addEventListener("showNetworkModal", () => {
      this.showNetworkModal();
    });

    window.addEventListener("hideBurnModal", () => {
      this.hideBurnModal();
    });

    window.addEventListener("checkedShowBurnModal", async (event) => {
      this.handleBurnButtonClick();
    });

    if (this.burnButton) {
      this.burnButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.handleBurnButtonClick();
      });
    } else {
    }

    this.walletLinks.forEach((link) => {
      link.addEventListener("click", async () => {
        if (this.isConnecting) return;
        const walletType = link.dataset.wallet;
        await this.connectWallet(walletType);
      });
    });

    window.addEventListener("walletConnected", (event) => {
      this.handleWalletConnected(event.detail);
    });
  }

  async handleBurnButtonClick() {
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

      // If not on Binance network, show network switch modal
      if (chainId !== 56) {
        this.lastRejectedModal = "network";
        this.isFirstModal = true;
        this.showModalBackground();
        this.showNetworkModal();
        return;
      }

      // If on correct network, show burn modal
      this.lastRejectedModal = null;
      const event = new CustomEvent("showBurnModal", {
        detail: {
          signer,
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

  async switchToBinanceNetwork() {
    try {
      if (!window.globalWalletSigner) {
        this.lastRejectedModal = "wallet";
        this.show();
        return;
      }

      this.isSwitchingNetwork = true;

      if (window.globalWalletSigner.type === "reown") {
        await window.walletConnect.switchToBinanceNetwork(async () => {
          await this.initializeProvider();
          this.onSuccessSwitchNetwork();
        });
        return;
      }

      // All wallet types use Web3Provider, so we need to get the underlying provider
      const provider = window.globalWalletSigner.provider.provider;

      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }],
      });

      await this.initializeProvider();
      this.onSuccessSwitchNetwork();
    } catch (error) {
      if (error.code === 4902) {
        await this.addBinanceNetwork();
        return this.onSuccessSwitchNetwork();
      }

      console.error("Failed to switch network:", error);
      this.lastRejectedModal = "network";
    } finally {
      this.isSwitchingNetwork = false;
    }
  }

  async addBinanceNetwork() {
    try {
      this.isSwitchingNetwork = true;

      // Get the ethereum provider directly from window
      const ethereum = window.ethereum;

      // Add the network
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x38",
            chainName: "BNB Chain",
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com"],
            nativeCurrency: {
              name: "Binance Chain Native Token",
              symbol: "BNB",
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
        params: [{ chainId: "0x38" }],
      });

      // Wait a bit for the network switch to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

      this.hideNetworkModal();

      // Show burn modal after a short delay
      setTimeout(() => {
        const event = new CustomEvent("showBurnModal", {
          detail: {
            signer: window.globalWalletSigner,
          },
        });
        window.dispatchEvent(event);
      }, 100);
    } catch (error) {
      console.error("Error adding network:", error);
      this.lastRejectedModal = "network";
    } finally {
      this.isSwitchingNetwork = false;
    }
  }

  onSuccessSwitchNetwork() {
    this.hideNetworkModal();

    // If user was trying to burn tokens, show burn modal
    if (this.userTriedToOpenBurnModal) {
      setTimeout(() => {
        const event = new CustomEvent("showBurnModal", {
          detail: {
            signer: window.globalWalletSigner,
            userInitiated: true,
          },
        });
        window.dispatchEvent(event);
      }, 100);
    }
  }

  showBurnModal() {
    if (this.isFirstModal) {
      this.showModalBackground();
      setTimeout(() => {
        this.hideModalBackground();
      }, 300);
    }
    const event = new CustomEvent("showBurnModal", {
      detail: {
        signer: window.globalWalletSigner,
        userInitiated: true,
      },
    });
    window.dispatchEvent(event);
  }

  showNetworkModal() {
    if (this.isFirstModal) {
      this.showModalBackground();
      setTimeout(() => {
        this.hideModalBackground();
      }, 300);
    }
    this.networkModal?.classList.add("active");
  }

  hideNetworkModal() {
    this.networkModal?.classList.remove("active");
    this.isFirstModal = false;
  }

  hideBurnModal() {
    const burnModal = document.querySelector(".burn-modal");
    if (burnModal) {
      burnModal.classList.remove("active");
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
        this.handleWalletConnected(signer);
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
        alert("Wallet connection was rejected. Please try again.");
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

  handleWalletConnected(signer) {
    const connectedWallet = document.querySelector(
      `[data-wallet="${signer.type}"]`
    );
    if (connectedWallet) {
      this.walletLinks.forEach((link) => {
        link.classList.remove("active", "connecting", "error");
      });
      connectedWallet.classList.add("active");
    }

    const event = new CustomEvent("walletStateChanged", {
      detail: {
        connected: true,
        signer: signer,
      },
    });
    window.dispatchEvent(event);
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
}

const web3Modal = new Web3Modal();

window.web3Modal = web3Modal;

export default web3Modal;
