// Event handlers for provider events
const onAccountsChanged = (accounts) => {
  if (accounts.length === 0) {
    // User disconnected their wallet
    window.globalWalletSigner = null;
    localStorage.removeItem("walletType");
    const event = new CustomEvent("walletStateChanged", {
      detail: { connected: false },
    });
    window.dispatchEvent(event);
  } else {
    // Update the current account
    if (window.globalWalletSigner) {
      window.globalWalletSigner.address = accounts[0];
      const event = new CustomEvent("walletStateChanged", {
        detail: {
          connected: true,
          signer: window.globalWalletSigner,
        },
      });
      window.dispatchEvent(event);
    }
  }
};

const onChainChanged = (chainId) => {
  if (window.globalWalletSigner) {
    const event = new CustomEvent("walletStateChanged", {
      detail: {
        connected: true,
        signer: window.globalWalletSigner,
        chainId: chainId,
      },
    });
    window.dispatchEvent(event);
  }
};

const onDisconnect = (error) => {
  window.globalWalletSigner = null;
  const event = new CustomEvent("walletStateChanged", {
    detail: { connected: false },
  });
  window.dispatchEvent(event);
};

// Subscribe to provider events
const subscribeToProviderEvents = (provider) => {
  if (!provider) return;

  // Remove existing listeners if any
  provider.removeListener("accountsChanged", onAccountsChanged);
  provider.removeListener("chainChanged", onChainChanged);
  provider.removeListener("disconnect", onDisconnect);

  // Add new listeners
  provider.on("accountsChanged", onAccountsChanged);
  provider.on("chainChanged", onChainChanged);
  provider.on("disconnect", onDisconnect);
};

// Check if MetaMask is installed
const isMetaMaskInstalled = () => {
  return (
    window.ethereum &&
    (window.ethereum.isMetaMask ||
      window.ethereum.providers?.some((p) => p.isMetaMask))
  );
};

// Check if Binance Wallet is installed
const isBinanceWalletInstalled = () => {
  return (
    window.BinanceChain ||
    (window.ethereum &&
      window.ethereum.providers?.some((p) => p.isBinanceWallet))
  );
};

// Check if Trust Wallet is installed
const isTrustWalletInstalled = () => {
  const isInstalled =
    window.ethereum &&
    (window.ethereum.isTrust ||
      window.ethereum.providers?.some((p) => p.isTrust) ||
      window.ethereum.isTrustWallet);

  return isInstalled;
};

// Check if Coinbase Wallet is installed
const isCoinbaseWalletInstalled = () => {
  const isInstalled =
    window.ethereum &&
    (window.ethereum.isCoinbaseWallet ||
      window.ethereum.providers?.some((p) => p.isCoinbaseWallet) ||
      window.ethereum.isCoinbase);

  return isInstalled;
};

// Get the correct provider for MetaMask
const getMetaMaskProvider = () => {
  if (window.ethereum?.providers) {
    const providers = window.ethereum.providers;

    // First try to find MetaMask specifically
    const metaMaskProvider = providers.find(
      (p) => p.isMetaMask && !p.isTrust && !p.isCoinbaseWallet
    );

    if (metaMaskProvider) return metaMaskProvider;

    // Fallback to any MetaMask provider if specific one not found
    const fallbackProvider = providers.find((p) => p.isMetaMask);

    return fallbackProvider;
  }

  const provider = window.ethereum?.isMetaMask ? window.ethereum : null;

  return provider;
};

// Get the correct provider for Trust Wallet
const getTrustWalletProvider = () => {
  if (window.ethereum?.providers) {
    return window.ethereum.providers.find((p) => p.isTrust);
  }
  return window.ethereum;
};

// Update wallet installation status in the modal
const updateWalletInstallationStatus = () => {
  const walletElements = document.querySelectorAll(".web-modal-wallet-link");

  walletElements.forEach((element, index) => {
    if (index === 0) return;

    if (!element) return;

    const badgeContainer = element.querySelector(".web-modal-badge");
    if (!badgeContainer) return;

    const walletType = element.dataset.wallet;
    let isInstalled = false;

    switch (walletType) {
      case "metamask":
        isInstalled = isMetaMaskInstalled();
        break;
      case "binance":
        isInstalled = isBinanceWalletInstalled();
        break;
      case "trust":
        isInstalled = isTrustWalletInstalled();
        break;
      case "coinbase":
        isInstalled = isCoinbaseWalletInstalled();
        break;
    }

    const badgeSpan = badgeContainer.querySelector("span");
    if (isInstalled) {
      badgeContainer.classList.add("purple");
      badgeContainer.innerHTML = `<div class="checkmark-icon"></div> <span>Installed</span>`;
    } else {
      badgeContainer.classList.remove("purple");
      badgeSpan.textContent = "Not Installed";
    }
  });
};

const connectReownConnect = async (isInit = false) => {
  try {
    if (!window.globalWalletSigner) {
      if (isInit) {
        window.walletConnect.connect();
      }

      // Set up subscribers
      window.walletConnect.onConnect((account, provider) => {
        if (account && provider) {
          const web3Provider = new window.ethers.providers.Web3Provider(
            provider,
            "any"
          );
          window.globalWalletSigner = {
            address: account,
            provider: web3Provider,
            type: "reown",
          };

          localStorage.setItem("walletType", "reown");

          const event = new CustomEvent("walletConnected", {
            detail: window.globalWalletSigner,
          });
          window.dispatchEvent(event);
        }
      });

      window.walletConnect.onDisconnect(() => {
        window.globalWalletSigner = null;
        localStorage.removeItem("walletType");
        const event = new CustomEvent("walletStateChanged", {
          detail: { connected: false },
        });
        window.dispatchEvent(event);
      });

      return;
    }

    const provider = window.walletConnect.provider;

    let accounts = [];
    try {
      accounts = await provider.request({ method: "eth_accounts" });
    } catch (err) {
      console.error("Error checking wallet connection:", err);
      throw err;
    }

    if (!accounts || accounts.length === 0) {
      try {
        accounts = await provider.request({ method: "eth_requestAccounts" });
      } catch (err) {
        console.error("Wallet connection rejected:", err);
        throw new Error("Wallet connection rejected");
      }
    }

    if (accounts.length > 0) {
      const web3Provider = new window.ethers.providers.Web3Provider(
        provider,
        "any"
      );
      window.globalWalletSigner = {
        address: accounts[0],
        provider: web3Provider,
        type: "reown",
      };

      // Store wallet type in localStorage
      localStorage.setItem("walletType", "reown");

      // Subscribe to provider events
      subscribeToProviderEvents(provider);

      const event = new CustomEvent("walletConnected", {
        detail: window.globalWalletSigner,
      });
      window.dispatchEvent(event);

      return window.globalWalletSigner;
    }
  } catch (error) {
    console.error("Reown Connect error:", error);
    throw error;
  }
};

// MetaMask Connector
const connectMetaMask = async () => {
  try {
    const isInstalled = isMetaMaskInstalled();

    if (!isInstalled) {
      window.open("https://metamask.io/download/", "_blank");
      throw new Error("MetaMask not installed");
    }

    const provider = getMetaMaskProvider();

    let accounts = [];
    try {
      accounts = await provider.request({ method: "eth_accounts" });
    } catch (err) {
      console.error("Error checking wallet connection:", err);
      throw err;
    }

    if (!accounts || accounts.length === 0) {
      try {
        accounts = await provider.request({ method: "eth_requestAccounts" });
      } catch (err) {
        console.error("Wallet connection rejected:", err);
        throw new Error("Wallet connection rejected");
      }
    }

    if (accounts.length > 0) {
      const web3Provider = new window.ethers.providers.Web3Provider(
        provider,
        "any"
      );
      window.globalWalletSigner = {
        address: accounts[0],
        provider: web3Provider,
        type: "metamask",
      };

      // Store wallet type in localStorage
      localStorage.setItem("walletType", "metamask");

      // Subscribe to provider events
      subscribeToProviderEvents(provider);

      const event = new CustomEvent("walletConnected", {
        detail: window.globalWalletSigner,
      });
      window.dispatchEvent(event);

      return window.globalWalletSigner;
    }
  } catch (error) {
    console.error("MetaMask connection error:", error);
    throw error;
  }
};

const connectTrustWallet = async () => {
  try {
    const provider = getTrustWalletProvider();

    if (!provider) throw new Error("Trust Wallet provider not found");

    subscribeToProviderEvents(provider);

    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0)
      throw new Error("No accounts returned");

    const web3Provider = new ethers.providers.Web3Provider(provider, "any");
    window.globalWalletSigner = {
      address: accounts[0],
      provider: web3Provider,
      type: "trust",
    };

    localStorage.setItem("walletType", "trust");

    window.dispatchEvent(
      new CustomEvent("walletConnected", {
        detail: window.globalWalletSigner,
      })
    );

    return window.globalWalletSigner;
  } catch (err) {
    console.error("Trust Wallet connection error:", err);
    throw err;
  }
};

// Coinbase Wallet Connector
const connectCoinbaseWallet = async () => {
  try {
    if (!isCoinbaseWalletInstalled()) {
      window.open("https://wallet.coinbase.com/", "_blank");
      throw new Error("Coinbase Wallet not installed");
    }

    let accounts = [];
    try {
      accounts = await window.ethereum.request({ method: "eth_accounts" });
    } catch (err) {
      throw err;
    }

    if (!accounts || accounts.length === 0) {
      try {
        accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      } catch (err) {
        throw new Error("Wallet connection rejected");
      }
    }

    if (accounts.length > 0) {
      const web3Provider = new window.ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      window.globalWalletSigner = {
        address: accounts[0],
        provider: web3Provider,
        type: "coinbase",
      };

      // Store wallet type in localStorage
      localStorage.setItem("walletType", "coinbase");

      const event = new CustomEvent("walletConnected", {
        detail: window.globalWalletSigner,
      });
      window.dispatchEvent(event);

      return window.globalWalletSigner;
    }
  } catch (error) {
    throw error;
  }
};

// Function to restore wallet connection
const restoreWalletConnection = async () => {
  const walletType = localStorage.getItem("walletType");
  if (!walletType) return;

  try {
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
        signer = await connectReownConnect(false);
        break;
    }

    if (signer) {
      const event = new CustomEvent("walletStateChanged", {
        detail: {
          connected: true,
          signer: signer,
        },
      });
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.error("Error restoring wallet connection:", error);
    localStorage.removeItem("walletType");
  }
};

// Initialize wallet connection handlers
const initializeWalletConnectors = () => {
  // Initial status update
  updateWalletInstallationStatus();

  // Update status when ethereum provider changes
  if (window.ethereum) {
    window.ethereum.on("chainChanged", () => {
      updateWalletInstallationStatus();
    });
    window.ethereum.on("accountsChanged", () => {
      updateWalletInstallationStatus();
    });
  }

  // Try to restore wallet connection
  restoreWalletConnection();
};

// Export functions and initialize
export {
  updateWalletInstallationStatus,
  initializeWalletConnectors,
  connectMetaMask,
  connectTrustWallet,
  connectCoinbaseWallet,
  connectReownConnect,
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  updateWalletInstallationStatus();
  initializeWalletConnectors();
});
