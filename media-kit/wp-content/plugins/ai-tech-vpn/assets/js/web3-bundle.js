
// AI Tech VPN Web3 Bundle
// This file contains Web3 libraries for WordPress plugin

(function() {
    'use strict';
    
    // Ethers.js minimal implementation for contract interactions
    window.AITechWeb3 = {
        // Contract interaction utilities
        async connectWallet() {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed');
            }
            
            try {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                return accounts[0];
            } catch (error) {
                throw new Error('Failed to connect wallet: ' + error.message);
            }
        },
        
        async switchToBSC() {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x38' }], // BSC Mainnet
                });
            } catch (switchError) {
                // If BSC is not added, add it
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x38',
                            chainName: 'BSC Mainnet',
                            nativeCurrency: {
                                name: 'BNB',
                                symbol: 'BNB',
                                decimals: 18,
                            },
                            rpcUrls: ['https://bsc-dataseed.binance.org/'],
                            blockExplorerUrls: ['https://bscscan.com'],
                        }],
                    });
                }
            }
        },
        
        async getContract(contractAddress, abi) {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed');
            }
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            return new ethers.Contract(contractAddress, abi, signer);
        },
        
        async callContract(contractAddress, abi, method, params = []) {
            try {
                const contract = await this.getContract(contractAddress, abi);
                const result = await contract[method](...params);
                return result;
            } catch (error) {
                console.error('Contract call failed:', error);
                throw error;
            }
        },
        
        async sendTransaction(contractAddress, abi, method, params = [], value = '0') {
            try {
                await this.switchToBSC();
                const contract = await this.getContract(contractAddress, abi);
                const tx = await contract[method](...params, {
                    value: ethers.utils.parseEther(value)
                });
                return tx;
            } catch (error) {
                console.error('Transaction failed:', error);
                throw error;
            }
        },
        
        // Simple ABI for plan purchases
        planContractABI: [
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "planId",
                        "type": "uint256"
                    }
                ],
                "name": "buyPlan",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getPlanList",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "id",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "price",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "range",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "uri",
                                "type": "string"
                            }
                        ],
                        "internalType": "struct VpnPlans.PlanData[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ],
        
        // Utility functions
        formatBNB(weiAmount) {
            return ethers.utils.formatEther(weiAmount);
        },
        
        parseBNB(bnbAmount) {
            return ethers.utils.parseEther(bnbAmount.toString());
        },
        
        async getBalance(address) {
            if (typeof window.ethereum === 'undefined') {
                return '0';
            }
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const balance = await provider.getBalance(address);
            return this.formatBNB(balance);
        },
        
        // Plan purchase helper
        async purchasePlan(contractAddress, planId, priceInBNB) {
            try {
                const tx = await this.sendTransaction(
                    contractAddress,
                    this.planContractABI,
                    'buyPlan',
                    [planId],
                    priceInBNB
                );
                
                console.log('Transaction sent:', tx.hash);
                const receipt = await tx.wait();
                console.log('Transaction confirmed:', receipt);
                
                return {
                    success: true,
                    txHash: tx.hash,
                    receipt: receipt
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },
        
        // Get plans from contract
        async getPlansFromContract(contractAddress) {
            try {
                const plans = await this.callContract(
                    contractAddress,
                    this.planContractABI,
                    'getPlanList'
                );
                
                return plans.map(plan => ({
                    id: plan.id.toString(),
                    price: this.formatBNB(plan.price),
                    range: plan.range.toString(),
                    uri: plan.uri
                }));
            } catch (error) {
                console.error('Failed to get plans from contract:', error);
                return [];
            }
        }
    };
    
    // Event listeners for wallet connection changes
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', function (accounts) {
            window.dispatchEvent(new CustomEvent('walletAccountChanged', {
                detail: { accounts }
            }));
        });
        
        window.ethereum.on('chainChanged', function (chainId) {
            window.dispatchEvent(new CustomEvent('walletChainChanged', {
                detail: { chainId }
            }));
        });
    }
    
    console.log('AI Tech Web3 Bundle loaded successfully');
})();
