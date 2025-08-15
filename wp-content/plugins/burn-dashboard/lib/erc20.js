const ERC20_ABI = [
  "function burn(uint256 amount) public",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
];

const CONTRACT_ADDRESS = "0x2D060Ef4d6BF7f9e5edDe373Ab735513c0e4F944";
const REQUIRED_CHAIN_ID = 56; // Binance Mainnet

class ERC20Contract {
  constructor() {
    this.contract = null;
    this.provider = null;
    this.isReady = false;
    this.readOnlyContract = null;
    this.initPromise = this.initialize();
  }

  async initialize() {

    try {
      // Wait for ethers to be available
      while (!window.ethers) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const readOnlyProvider = new window.ethers.providers.JsonRpcProvider(
        "https://bsc-dataseed.binance.org/"
      );

      this.readOnlyContract = new window.ethers.Contract(
        CONTRACT_ADDRESS,
        ERC20_ABI,
        readOnlyProvider
      );

    } catch (error) {
      console.error("Error initializing Readonly ERC20Contract:", error);
      throw error;
    }

    try {
      
      if (!window.ethereum) {
        throw new Error("Please connect your wallet first");
      }

      // Initialize provider and contract
      this.provider = new window.ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      
      this.contract = new window.ethers.Contract(
        CONTRACT_ADDRESS,
        ERC20_ABI,
        this.provider
      );

      this.isReady = true;
      return true;
    } catch (error) {
      console.error("Error initializing ERC20Contract:", error);
      throw error;
    }
  }

  async waitForReady() {
    await this.initPromise;
    if (!this.isReady) {
      throw new Error("Contract initialization failed");
    }
  }

  async checkNetwork() {
    if (!window.globalWalletSigner) {
      // Show wallet connection modal
      window.dispatchEvent(new CustomEvent("showWalletModal"));
      throw new Error("Please connect your wallet first");
    }

    const network = await window.globalWalletSigner.provider.getNetwork();

    if (network.chainId !== REQUIRED_CHAIN_ID) {
      // Show network switch modal
      window.dispatchEvent(new CustomEvent("showNetworkModal"));
      throw new Error("Please switch your network to Binance Smart Chain.");
    }
  }

  async burn(amount) {
    await this.waitForReady();
    await this.checkNetwork();

    const signer = await window.globalWalletSigner.provider.getSigner();

    try {
      // Create contract instance with signer for write functions
      const contractWithSigner = new window.ethers.Contract(
        CONTRACT_ADDRESS,
        ERC20_ABI,
        signer
      );

      // Convert amount to wei (assuming 18 decimals)
      const amountInWei = window.ethers.utils.parseUnits(amount.toString(), 18);

      // Send burn transaction
      const tx = await contractWithSigner.burn(amountInWei);

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error("Error burning tokens:", error);
      throw error;
    }
  }

  async getTotalSupply() {
    try {
      const totalSupply = await this.readOnlyContract.totalSupply();
      return window.ethers.utils.formatUnits(totalSupply, 18);
    } catch (error) {
      console.error("Error getting total supply:", error);
      throw error;
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.readOnlyContract.balanceOf(address);
      return window.ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const erc20Contract = new ERC20Contract();
export default erc20Contract;
