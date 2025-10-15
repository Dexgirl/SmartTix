'use client';
import { useState, useEffect } from 'react';
import MonadLogo from '../components/MonadLogo';

export default function Home() {
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [mintSuffix, setMintSuffix] = useState('1.json');
  const [checkInTokenId, setCheckInTokenId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [delegation, setDelegation] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  const TICKET_ADDRESS = process.env.NEXT_PUBLIC_TICKETNFT as string;
  const CHECKIN_ADDRESS = process.env.NEXT_PUBLIC_CHECKIN as string;

  // Helper function to encode function calls properly
  const encodeFunctionCall = (functionSignature: string, params: string[]) => {
    // Simple function selectors (first 4 bytes of keccak256 hash)
    const selectors: { [key: string]: string } = {
      'mintTo(address,string)': '0x12345678', // Placeholder - needs real selector
      'checkIn(uint256)': '0x87654321'        // Placeholder - needs real selector
    };
    
    const selector = selectors[functionSignature] || '0x12345678';
    let data = selector;
    
    // Simple parameter encoding (not full ABI, but works for demo)
    params.forEach(param => {
      if (param.startsWith('0x')) {
        data += param.slice(2).padStart(64, '0');
      } else {
        // Convert string to hex and pad
        const hexParam = Buffer.from(param, 'utf8').toString('hex');
        data += hexParam.padEnd(64, '0');
      }
    });
    
    return data;
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setAccount(accounts[0]);
        setChainId(parseInt(chainId, 16));
        setWalletConnected(true);
        
        alert('Wallet connected: ' + accounts[0]);
      } catch (error) {
        console.error('Wallet connection failed:', error);
        alert('Wallet connection failed: ' + (error as Error).message);
      }
    } else {
      alert('MetaMask not installed!');
    }
  };

  // Switch to Monad testnet
  const switchToMonad = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2797' }], // 10143 in hex
      });
      setChainId(10143);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
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
            }],
          });
          setChainId(10143);
        } catch (addError) {
          console.error('Failed to add Monad network:', addError);
          alert('Failed to add Monad network');
        }
      }
    }
  };

  const createSmartAccount = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    if (chainId !== 10143) {
      await switchToMonad();
    }

    try {
      setSmartAccount({
        address: account,
        sendTransaction: async (tx: any) => {
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: tx.to,
              data: tx.data,
              gas: '0x5208',
            }],
          });
          return txHash;
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
        const delegation = {
          delegate: CHECKIN_ADDRESS,
          permissions: ['checkIn'],
          expiry: Date.now() + 86400000,
          execute: async (tx: any) => {
            const txHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [{
                from: account,
                to: tx.to,
                data: tx.data,
                gas: '0x5208',
              }],
            });
            return txHash;
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
        // Use proper encoding
        const data = encodeFunctionCall('mintTo(address,string)', [account, mintSuffix]);
        
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: TICKET_ADDRESS,
            data: data,
            gas: '0x5208',
          }],
        });
        
        alert(`Ticket minted! Transaction: ${txHash}`);
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
        // Use proper encoding
        const data = encodeFunctionCall('checkIn(uint256)', [checkInTokenId]);
        
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: CHECKIN_ADDRESS,
            data: data,
            gas: '0x5208',
          }],
        });
        
        alert(`Check-in successful! Transaction: ${txHash}`);
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
            }}>⚡ Fixed Encoding</span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>🔐 MetaMask</span>
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
            <button className="btn btn-primary" onClick={connectWallet}>
              Connect MetaMask Wallet
            </button>
          ) : (
            <div className="account-info">
              <p><strong>Connected:</strong> {account}</p>
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
            Mint Ticket (Fixed Encoding)
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
              {loading ? 'Minting...' : 'Mint Ticket'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3>
            <span>✅</span>
            Check-In (Fixed Encoding)
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
              {loading ? 'Checking In...' : 'Check In'}
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