import React, { useState, useEffect } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount,
  useSuiClientQuery
} from '@mysten/dapp-kit';
import './App.css';

const LoyaltyCardPage = () => {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [packageId, setPackageId] = useState('');

  // Modal states
  const [modal, setModal] = useState({ open: false, type: '', message: '', txUrl: '' });

  // Wallet info
  const [balance, setBalance] = useState(null);
  const [recentTxs, setRecentTxs] = useState([]);

  // Form states
  const [mintForm, setMintForm] = useState({
    customerId: '',
    imageUrl: '',
    name: '',
    description: ''
  });

  // Image preview state
  const [imgError, setImgError] = useState(false);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  // Show confetti when success modal opens
  useEffect(() => {
    if (modal.open && modal.type === 'success') {
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 1800);
      return () => clearTimeout(timeout);
    }
  }, [modal]);

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleMintChange = (e) => {
    setMintForm({ ...mintForm, [e.target.name]: e.target.value });
  };

  // Fetch wallet balance and recent transactions
  useEffect(() => {
    async function fetchWalletInfo() {
      if (!currentAccount) {
        setBalance(null);
        setRecentTxs([]);
        return;
      }
      try {
        // SUI balance fetch (using dapp-kit or direct fetch)
        const resp = await fetch(`https://explorer-rpc.testnet.sui.io:443`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getBalance',
            params: [currentAccount.address, null]
          })
        });
        const data = await resp.json();
        setBalance(data.result ? data.result.totalBalance / 1e9 : null);
      } catch {
        setBalance(null);
      }
      try {
        // Recent transactions (last 5)
        const resp = await fetch(`https://explorer-rpc.testnet.sui.io:443`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getTransactionsForAddress',
            params: [currentAccount.address, null, 5]
          })
        });
        const data = await resp.json();
        setRecentTxs(data.result ? data.result.data : []);
      } catch {
        setRecentTxs([]);
      }
    }
    fetchWalletInfo();
  }, [currentAccount]);

  // Action: mint a new Loyalty card
  const mintLoyalty = async () => {
    if (!currentAccount) {
      setModal({ open: true, type: 'error', message: 'Please connect your wallet', txUrl: '' });
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty_card::mint_loyalty`,
        arguments: [
          tx.pure.address(mintForm.customerId),
          tx.pure.string(mintForm.imageUrl),
          tx.pure.string(mintForm.name),
          tx.pure.string(mintForm.description)
        ]
      });
      const result = await signAndExecute({ transaction: tx });
      setMintForm({ customerId: '', imageUrl: '', name: '', description: '' });
      setModal({ open: true, type: 'success', message: 'Minting succeeded!', txUrl: result?.digest ? `https://suiexplorer.com/txblock/${result.digest}?network=testnet` : '' });
    } catch (error) {
      setModal({ open: true, type: 'error', message: `Minting failed: ${error.message}`, txUrl: '' });
      console.error('Error minting loyalty card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Mint Your NFT on SUI</h1>
      <ConnectButton />

      {/* Wallet Info */}
      {currentAccount && (
        <div style={{ margin: '1rem 0', padding: '1rem', background: 'var(--input-bg)', borderRadius: '8px' }}>
          <div><b>Wallet:</b> {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}</div>
          <div><b>Balance:</b> {balance !== null ? `${balance} SUI` : 'Loading...'}</div>
          <div><b>Recent Transactions:</b></div>
          <ul style={{ fontSize: '0.95em', marginLeft: '1em' }}>
            {recentTxs.length === 0 && <li>No recent transactions</li>}
            {recentTxs.map((tx, i) => (
              <li key={i}>
                <a href={`https://suiexplorer.com/txblock/${tx}?network=testnet`} target="_blank" rel="noopener noreferrer">{tx.slice(0, 10)}...</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="package-input">
        <label>Package ID</label>
        <input
          type="text"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          placeholder="Enter Package ID"
        />
      </div>

      {/* Mint Loyalty Card */}
      <section className="form-section">
        <label>
          Wallet Address
          <span title="The Sui address that will own the NFT" style={{ marginLeft: 4, cursor: 'help', color: '#888' }}>ⓘ</span>
        </label>
        <input
          type="text"
          name="customerId"
          value={mintForm.customerId}
          onChange={handleMintChange}
          placeholder="Enter Customer Sui Address"
        />
        <label>
          Image URL
          <span title="Direct link to the image for your NFT. You can also upload to IPFS later." style={{ marginLeft: 4, cursor: 'help', color: '#888' }}>ⓘ</span>
        </label>
        <input
          type="text"
          name="imageUrl"
          value={mintForm.imageUrl}
          onChange={(e) => {
            handleMintChange(e);
            setImgError(false); // Reset error on change
          }}
          placeholder="Enter Image URL"
        />
        <label>
          Name
          <span title="The name of your NFT (e.g., 'Loyalty Card #1')" style={{ marginLeft: 4, cursor: 'help', color: '#888' }}>ⓘ</span>
        </label>
        <input
          type="text"
          name="name"
          value={mintForm.name}
          onChange={handleMintChange}
          placeholder="Enter NFT Name"
        />
        <label>
          Description
          <span title="A short description for your NFT." style={{ marginLeft: 4, cursor: 'help', color: '#888' }}>ⓘ</span>
        </label>
        <input
          type="text"
          name="description"
          value={mintForm.description}
          onChange={handleMintChange}
          placeholder="Enter NFT Description"
        />
        {/* Live NFT Preview */}
        {(mintForm.imageUrl || mintForm.name || mintForm.description) && (
          <div style={{ margin: '18px 0', padding: 16, border: '1px solid #eee', borderRadius: 10, background: '#fafbfc', maxWidth: 340 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>NFT Preview</div>
            {mintForm.imageUrl && !imgError && (
              <img
                src={mintForm.imageUrl}
                alt="NFT Preview"
                style={{ maxWidth: '300px', maxHeight: '180px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: 8 }}
                onError={() => setImgError(true)}
              />
            )}
            {imgError && (
              <div style={{ color: 'red', margin: '10px 0' }}>
                Could not load image. Please check the URL.
              </div>
            )}
            <div style={{ fontSize: '1.1em', fontWeight: 500, margin: '6px 0' }}>{mintForm.name || <span style={{ color: '#bbb' }}>[NFT Name]</span>}</div>
            <div style={{ fontSize: '0.98em', color: '#555' }}>{mintForm.description || <span style={{ color: '#ccc' }}>[NFT Description]</span>}</div>
          </div>
        )}
        <button 
          onClick={mintLoyalty} 
          disabled={
            loading || 
            !mintForm.customerId.trim() || 
            !mintForm.imageUrl.trim() ||
            !mintForm.name.trim() ||
            !mintForm.description.trim()
          }
        >
          {loading ? 'Minting...' : 'Mint your NFT'}
        </button>
        {/* Loader Animation */}
        {loading && (
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <div className="loader" style={{ display: 'inline-block', width: 40, height: 40, border: '4px solid #ccc', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        )}
      </section>

      {/* Modal */}
      {modal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', color: '#222', padding: '2rem', borderRadius: '12px', minWidth: 300, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'modalPop 0.5s' }}>
            <h2 style={{ color: modal.type === 'success' ? 'green' : 'red' }}>{modal.type === 'success' ? 'Success!' : 'Error'}</h2>
            <p>{modal.message}</p>
            {modal.txUrl && (
              <a href={modal.txUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>View on Explorer</a>
            )}
            <br />
            <button style={{ marginTop: 16 }} onClick={() => setModal({ ...modal, open: false })}>Close</button>
            {/* Confetti animation */}
            {showConfetti && (
              <div className="confetti">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="confetti-piece"
                    style={{
                      left: `${Math.random() * 100}%`,
                      background: `linear-gradient(135deg, #ff6f61, #6a82fb, #43cea2, #fc5c7d)`,
                      animationDelay: `${Math.random() * 0.7}s`,
                      transform: `rotate(${Math.random() * 360}deg)`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyCardPage;
