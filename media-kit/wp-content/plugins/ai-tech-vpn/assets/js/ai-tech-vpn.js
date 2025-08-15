// AI Tech VPN WordPress Plugin - Main JS
(function() {
    'use strict';
    
    // Wait for DOM and React to load
    document.addEventListener('DOMContentLoaded', function() {
        initializeAITechVPN();
        initializeAITechPlans();
    });
    
    function initializeAITechVPN() {
        const container = document.getElementById('ai-tech-vpn-app');
        if (!container) return;
        
        const showPlans = container.getAttribute('data-show-plans') === 'true';
        const showConfigs = container.getAttribute('data-show-configs') === 'true';
        const theme = container.getAttribute('data-theme') || 'dark';
        
        // Create React component
        const AITechVPNApp = React.createElement(AITechVPNComponent, {
            showPlans: showPlans,
            showConfigs: showConfigs,
            theme: theme,
            apiUrl: aiTechVpn.apiUrl,
            contractAddress: aiTechVpn.contractAddress
        });
        
        ReactDOM.render(AITechVPNApp, container);
    }
    
    function initializeAITechPlans() {
        const container = document.getElementById('ai-tech-plans-app');
        if (!container) return;
        
        const layout = container.getAttribute('data-layout') || 'grid';
        const theme = container.getAttribute('data-theme') || 'dark';
        
        // Create React component
        const AITechPlansApp = React.createElement(AITechPlansComponent, {
            layout: layout,
            theme: theme,
            apiUrl: aiTechVpn.apiUrl,
            contractAddress: aiTechVpn.contractAddress
        });
        
        ReactDOM.render(AITechPlansApp, container);
    }
    
    // Main VPN Component
    function AITechVPNComponent(props) {
        const [walletConnected, setWalletConnected] = React.useState(false);
        const [currentPage, setCurrentPage] = React.useState('plans');
        const [userPlans, setUserPlans] = React.useState([]);
        
        React.useEffect(() => {
            // Initialize Web3 connection
            initializeWeb3();
        }, []);
        
        const initializeWeb3 = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // Request account access
                    const accounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    
                    if (accounts.length > 0) {
                        setWalletConnected(true);
                        loadUserPlans(accounts[0]);
                    }
                } catch (error) {
                    console.error('Failed to connect wallet:', error);
                }
            }
        };
        
        const loadUserPlans = async (address) => {
            try {
                const response = await fetch(aiTechVpn.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'ai_tech_proxy',
                        nonce: aiTechVpn.nonce,
                        endpoint: '/v1/user/plans',
                        method: 'GET',
                        data: JSON.stringify({ address: address })
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    const data = JSON.parse(result.data);
                    setUserPlans(data.plans || []);
                }
            } catch (error) {
                console.error('Failed to load user plans:', error);
            }
        };
        
        const connectWallet = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setWalletConnected(true);
                } catch (error) {
                    console.error('Failed to connect wallet:', error);
                }
            } else {
                alert('Please install MetaMask or another Web3 wallet');
            }
        };
        
        return React.createElement('div', {
            className: `ai-tech-vpn-container theme-${props.theme}`
        }, [
            // Header
            React.createElement('div', {
                key: 'header',
                className: 'ai-tech-header'
            }, [
                React.createElement('h1', { key: 'title' }, 'AI Tech VPN'),
                !walletConnected ? 
                    React.createElement('button', {
                        key: 'connect-btn',
                        onClick: connectWallet,
                        className: 'connect-wallet-btn'
                    }, 'Connect Wallet') :
                    React.createElement('div', {
                        key: 'connected',
                        className: 'wallet-connected'
                    }, '✓ Wallet Connected')
            ]),
            
            // Navigation
            React.createElement('div', {
                key: 'nav',
                className: 'ai-tech-nav'
            }, [
                props.showPlans && React.createElement('button', {
                    key: 'plans-tab',
                    onClick: () => setCurrentPage('plans'),
                    className: currentPage === 'plans' ? 'active' : ''
                }, 'Plans'),
                props.showConfigs && userPlans.length > 0 && React.createElement('button', {
                    key: 'configs-tab',
                    onClick: () => setCurrentPage('configs'),
                    className: currentPage === 'configs' ? 'active' : ''
                }, 'VPN Configs')
            ]),
            
            // Content
            React.createElement('div', {
                key: 'content',
                className: 'ai-tech-content'
            }, 
                currentPage === 'plans' ? 
                    React.createElement(PlansComponent, { 
                        walletConnected: walletConnected,
                        userPlans: userPlans,
                        onPlanPurchased: () => loadUserPlans()
                    }) :
                    React.createElement(ConfigsComponent, {
                        userPlans: userPlans
                    })
            )
        ]);
    }
    
    // Plans Component
    function PlansComponent(props) {
        const [plans, setPlans] = React.useState([]);
        const [loading, setLoading] = React.useState(true);
        
        React.useEffect(() => {
            loadPlans();
        }, []);
        
        const loadPlans = async () => {
            try {
                // Load plans from contract
                const response = await fetch(aiTechVpn.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'ai_tech_proxy',
                        nonce: aiTechVpn.nonce,
                        endpoint: '/v1/plans',
                        method: 'GET'
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    const data = JSON.parse(result.data);
                    setPlans(data.plans || []);
                }
            } catch (error) {
                console.error('Failed to load plans:', error);
            } finally {
                setLoading(false);
            }
        };
        
        if (loading) {
            return React.createElement('div', { className: 'loading' }, 'Loading plans...');
        }
        
        return React.createElement('div', {
            className: 'plans-grid'
        }, 
            plans.map(plan => 
                React.createElement(PlanCard, {
                    key: plan.id,
                    plan: plan,
                    walletConnected: props.walletConnected,
                    onPurchase: props.onPlanPurchased
                })
            )
        );
    }
    
    // Plan Card Component
    function PlanCard(props) {
        const [purchasing, setPurchasing] = React.useState(false);
        
        const purchasePlan = async () => {
            if (!props.walletConnected) {
                alert('Please connect your wallet first');
                return;
            }
            
            setPurchasing(true);
            try {
                // Web3 transaction logic here
                console.log('Purchasing plan:', props.plan.id);
                // After successful transaction, call onPurchase
                props.onPurchase();
            } catch (error) {
                console.error('Failed to purchase plan:', error);
            } finally {
                setPurchasing(false);
            }
        };
        
        return React.createElement('div', {
            className: 'plan-card'
        }, [
            React.createElement('h3', { key: 'title' }, props.plan.title),
            React.createElement('div', { key: 'price' }, `${props.plan.token_price} BNB`),
            React.createElement('div', { key: 'usd-price' }, `$${props.plan.usd_price}`),
            React.createElement('ul', { key: 'features' },
                props.plan.features.map((feature, index) =>
                    React.createElement('li', { key: index }, feature)
                )
            ),
            React.createElement('button', {
                key: 'buy-btn',
                onClick: purchasePlan,
                disabled: purchasing,
                className: 'buy-plan-btn'
            }, purchasing ? 'Processing...' : 'Buy Plan')
        ]);
    }
    
    // Configs Component
    function ConfigsComponent(props) {
        const [configs, setConfigs] = React.useState([]);
        
        React.useEffect(() => {
            loadConfigs();
        }, [props.userPlans]);
        
        const loadConfigs = async () => {
            if (props.userPlans.length === 0) return;
            
            try {
                const response = await fetch(aiTechVpn.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'ai_tech_proxy',
                        nonce: aiTechVpn.nonce,
                        endpoint: '/v1/configs',
                        method: 'GET'
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    const data = JSON.parse(result.data);
                    setConfigs(data.configs || []);
                }
            } catch (error) {
                console.error('Failed to load configs:', error);
            }
        };
        
        return React.createElement('div', {
            className: 'configs-container'
        }, [
            React.createElement('h2', { key: 'title' }, 'VPN Configurations'),
            React.createElement('div', { key: 'configs' },
                configs.map(config =>
                    React.createElement('div', {
                        key: config.id,
                        className: 'config-item'
                    }, [
                        React.createElement('h4', { key: 'name' }, config.name),
                        React.createElement('button', {
                            key: 'download',
                            onClick: () => downloadConfig(config)
                        }, 'Download Config')
                    ])
                )
            )
        ]);
    }
    
    // Standalone Plans Component for shortcode
    function AITechPlansComponent(props) {
        return React.createElement('div', {
            className: `ai-tech-plans-standalone theme-${props.theme} layout-${props.layout}`
        },
            React.createElement(PlansComponent, {
                walletConnected: false,
                userPlans: [],
                onPlanPurchased: () => {}
            })
        );
    }
    
    // Utility functions
    function downloadConfig(config) {
        const blob = new Blob([config.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.name}.conf`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Global exposure for React components
    window.AITechVPNComponent = AITechVPNComponent;
    window.AITechPlansComponent = AITechPlansComponent;
    
})(); 