'use client';
import { useState } from 'react';
import MonadLogo from '../components/MonadLogo';

interface SmartAccount {
  address: string;
  sendTransaction: (tx: TransactionData) => Promise<string>;
}

interface TransactionData {
  to: string;
  data: string;
}

interface Delegation {
  delegate: string;
  permissions: string[];
  expiry: number;
  execute: (tx: TransactionData) => Promise<string>;
}

export default function Home() {
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [mintSuffix, setMintSuffix] = useState('1.json');
  const [checkInTokenId, setCheckInTokenId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [delegation, setDelegation] = useState<Delegation | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletType, setWalletType] = useState<string>('');

  const TICKET_ADDRESS = process.env.NEXT_PUBLIC_TICKETNFT as string;
  const CHECKIN_ADDRESS = process.env.NEXT_PUBLIC_CHECKIN as string;

  const detectWallet = () => {
    if (typeof window.ethereum !== 'undefined') {
      if (window.ethereum.isMetaMask) {
        return 'MetaMask';
      } else if (window.ethereum.isRabby) {
        return 'Rabby';
      } else if (window.ethereum.isCoinbaseWallet) {
        return 'Coinbase Wallet';
      } else if (window.ethereum.isBraveWallet) {
        return 'Brave Wallet';
      } else if (window.ethereum.isTrust) {
        return 'Trust Wallet';
      } else if (window.ethereum.isFrame) {
        return 'Frame';
      } else if (window.ethereum.isTokenPocket) {
        return 'TokenPocket';
      } else if (window.ethereum.isBitKeep) {
        return 'BitKeep';
      } else if (window.ethereum.isOKExWallet) {
        return 'OKX Wallet';
      } else if (window.ethereum.isPhantom) {
        return 'Phantom';
      } else {
        return 'Unknown Wallet';
      }
    }
    return null;
  };

  const connectWallet = async () => {
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Safari/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile, try to open MetaMask app or show instructions
      const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`;
      
      // Try to open MetaMask app
      window.open(metamaskDeepLink, '_blank');
      
      // Show instructions
      alert('Please open this link in MetaMask mobile app:\n\n' + metamaskDeepLink + '\n\nOr scan the QR code with MetaMask mobile app.');
      return;
    }
    
    // Desktop wallet connection
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const wallet = detectWallet();
        
        setAccount(accounts[0]);
        setChainId(parseInt(chainId, 16));
        setWalletConnected(true);
        setWalletType(wallet || 'Unknown Wallet');
        
        alert(`Wallet connected: ${wallet || 'Unknown Wallet'}\nAddress: ${accounts[0]}`);
      } catch (error) {
        console.error('Wallet connection failed:', error);
        alert('Wallet connection failed: ' + (error as Error).message);
      }
    } else {
      alert('No wallet detected! Please install MetaMask, Rabby, Coinbase Wallet, or another compatible wallet.');
    }
  };

  const switchToMonad = async () => {
    try {
      // First, try to switch to the existing network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2797' }], // 10143 in hex
      });
      setChainId(10143);
      console.log('Successfully switched to Monad testnet');
    } catch (switchError: unknown) {
      console.log('Network not found, adding Monad testnet...');
      const error = switchError as { code: number };
      
      // If network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2797',
              chainName: 'Monad Testnet',
              rpcUrls: ['https://testnet-rpc.monad.xyz'],
              nativeCurrency: {
                name: 'Monad',
                symbol: 'MON',
                decimals: 18,
              },
              blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
              iconUrls: ['https://monad.xyz/favicon.ico'], // Add icon for better UX
            }],
          });
          
          // After adding, switch to it
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2797' }],
          });
          
          setChainId(10143);
          console.log('Successfully added and switched to Monad testnet');
        } catch (addError) {
          console.error('Failed to add Monad network:', addError);
          alert('Failed to add Monad network. Please add it manually in your wallet.');
        }
      } else {
        console.error('Failed to switch to Monad network:', switchError);
        alert('Failed to switch to Monad network. Please switch manually in your wallet.');
      }
    }
  };

  const createSmartAccount = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      // Always try to switch to Monad testnet first
      if (chainId !== 10143) {
        console.log('Switching to Monad testnet...');
        await switchToMonad();
        
        // Wait a moment for the network switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Double-check the network
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainIdNumber = parseInt(currentChainId, 16);
        
        if (currentChainIdNumber !== 10143) {
          alert('Please switch to Monad testnet manually in your wallet and try again.');
          return;
        }
      }

      setSmartAccount({
        address: account!,
        sendTransaction: async (tx: TransactionData) => {
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: tx.to,
              data: tx.data,
              gas: '0x5208',
            }],
          });
          return txHash as string;
        }
      });
      
      alert('Smart Account ready: ' + account);
    } catch (error) {
      console.error('Smart Account setup failed:', error);
      alert('Smart Account setup failed: ' + (error as Error).message);
    }
  };

  const createDelegation = async () => {
    if (smartAccount) {
      try {
        const delegation: Delegation = {
          delegate: CHECKIN_ADDRESS,
          permissions: ['checkIn'],
          expiry: Date.now() + 86400000,
          execute: async (tx: TransactionData) => {
            const txHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [{
                from: account,
                to: tx.to,
                data: tx.data,
                gas: '0x5208',
              }],
            });
            return txHash as string;
          }
        };

        setDelegation(delegation);
        alert('Delegation created for check-in verifier');
      } catch (error) {
        console.error('Delegation creation failed:', error);
        alert('Delegation creation failed: ' + (error as Error).message);
      }
    }
  };

  const mintTicket = async () => {
    if (smartAccount && account && TICKET_ADDRESS) {
      setLoading(true);
      try {
        // Simple transaction to test connection
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: TICKET_ADDRESS,
            data: '0x', // Empty data for testing
            gas: '0x5208',
          }],
        });
        
        alert(`Transaction sent! Hash: ${txHash}`);
        alert(`View on explorer: https://testnet-explorer.monad.xyz/tx/${txHash}`);
      } catch (error) {
        console.error('Mint failed:', error);
        alert('Mint failed: ' + (error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  const checkIn = async () => {
    if (delegation && CHECKIN_ADDRESS) {
      setLoading(true);
      try {
        // Simple transaction to test connection
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: CHECKIN_ADDRESS,
            data: '0x', // Empty data for testing
            gas: '0x5208',
          }],
        });
        
        alert(`Transaction sent! Hash: ${txHash}`);
        alert(`View on explorer: https://testnet-explorer.monad.xyz/tx/${txHash}`);
      } catch (error) {
        console.error('Check-in failed:', error);
        alert('Check-in failed: ' + (error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <MonadLogo />
      <div className="container">
        <div className="header">
          <h1>🎫 SmartTix</h1>
          <p>Gasless Event Tickets with Smart Accounts on Monad</p>
          <div style={{ 
            marginTop: '1rem', 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>⚡ Real On-Chain</span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>🔐 Multi-Wallet</span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>🎫 Monad Testnet</span>
          </div>
        </div>

        <div className="card">
          <h3>
            <span>🔗</span>
            Wallet Connection
          </h3>
          {!walletConnected ? (
            <div>
              <button className="btn btn-primary" onClick={connectWallet}>
                {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Safari/i.test(navigator.userAgent) 
                  ? 'Open in MetaMask Mobile' 
                  : 'Connect Wallet'
                }
              </button>
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(139, 92, 246, 0.1)', 
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#6B7280', 
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  Supported Wallets:
                </p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#4B5563'
                }}>
                  <span>• MetaMask</span>
                  <span>• Rabby</span>
                  <span>• Coinbase</span>
                  <span>• Brave Wallet</span>
                  <span>• Trust Wallet</span>
                  <span>• Frame</span>
                  <span>• TokenPocket</span>
                  <span>• BitKeep</span>
                  <span>• OKX Wallet</span>
                  <span>• Phantom</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="account-info">
              <p><strong>Connected:</strong> {account}</p>
              <p><strong>Wallet:</strong> {walletType}</p>
              <p><strong>Chain ID:</strong> {chainId}</p>
              <p><strong>Network:</strong> {chainId === 10143 ? 'Monad Testnet ✅' : 'Switch to Monad ⚠️'}</p>
              {chainId !== 10143 && (
                <button className="btn btn-secondary" onClick={switchToMonad} style={{ marginTop: '1rem' }}>
                  Switch to Monad Testnet
                </button>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h3>
            <span>🔐</span>
            Smart Account Status
          </h3>
          {!smartAccount ? (
            <button 
              className="btn btn-primary" 
              onClick={createSmartAccount}
              disabled={!walletConnected}
            >
              Setup Smart Account
            </button>
          ) : (
            <div className="account-info">
              <p><strong>Smart Account:</strong> {smartAccount.address}</p>
              <p><strong>Delegation:</strong> 
                <span className={`status-badge ${delegation ? 'active' : 'inactive'}`}>
                  {delegation ? 'Active' : 'None'}
                </span>
              </p>
              {!delegation && (
                <button className="btn btn-secondary" onClick={createDelegation} style={{ marginTop: '1rem' }}>
                  Create Check-in Delegation
                </button>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h3>
            <span>🎨</span>
            Mint Ticket (Test Transaction)
          </h3>
          <div className="input-group">
            <input 
              className="input-field"
              value={mintSuffix} 
              onChange={(e) => setMintSuffix(e.target.value)} 
              placeholder="Token URI suffix (e.g., 1.json)"
            />
            <button 
              className="btn btn-primary"
              onClick={mintTicket} 
              disabled={!smartAccount || loading}
            >
              {loading ? 'Minting...' : 'Test Mint'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3>
            <span>✅</span>
            Check-In (Test Transaction)
          </h3>
          <div className="input-group">
            <input 
              className="input-field"
              type="number"
              value={checkInTokenId} 
              onChange={(e) => setCheckInTokenId(e.target.value)} 
              placeholder="Token ID"
            />
            <button 
              className="btn btn-primary"
              onClick={checkIn} 
              disabled={!delegation || loading}
            >
              {loading ? 'Checking In...' : 'Test Check In'}
            </button>
          </div>
        </div>

        <div className="card contracts-section">
          <h3>
            <span>📋</span>
            Contract Addresses (Monad Testnet)
          </h3>
          <div className="contract-address">
            <strong>TicketNFT:</strong><br />
            {TICKET_ADDRESS}
          </div>
          <div className="contract-address">
            <strong>CheckIn:</strong><br />
            {CHECKIN_ADDRESS}
          </div>
        </div>
      </div>
    </>
  );
}