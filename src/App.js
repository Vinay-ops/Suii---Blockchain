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
  const [packageId, setPackageId] = useState('0x8a4d4f...d32880');
  const [moduleName, setModuleName] = useState('loyalty_card');
  const [functionName, setFunctionName] = useState('mint_loyalty');

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

  // Image upload states
  const [imgError, setImgError] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  // Add advanced toggle state
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Theme state
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(theme === 'light' ? 'light-mode' : 'dark-mode');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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

  // Handle image upload
  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setMintForm({ ...mintForm, imageUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
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
        target: `${packageId}::${moduleName}::${functionName}`,
        arguments: [
          tx.pure.address(mintForm.customerId),
          tx.pure.string(mintForm.imageUrl),
          tx.pure.string(mintForm.name),
          tx.pure.string(mintForm.description)
        ]
      });
      const result = await signAndExecute({ transaction: tx });
      setMintForm({ customerId: '', imageUrl: '', name: '', description: '' });
      setUploadedImage(null);
      setModal({ open: true, type: 'success', message: 'Minting succeeded!', txUrl: result?.digest ? `https://suiexplorer.com/txblock/${result.digest}?network=testnet` : '' });
    } catch (error) {
      setModal({ open: true, type: 'error', message: `Minting failed: ${error.message}`, txUrl: '' });
      console.error('Error minting loyalty card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Theme Toggle Button - OUTSIDE container */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-logo">
            <div style={{ 
              width: 36, 
              height: 36, 
              background: 'linear-gradient(135deg, #6a82fb, #fc5c7d)', 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              S
            </div>
            <div>
              <div>Sui NFT Studio</div>
              <div style={{ fontSize: '0.8em', color: '#aaa', fontWeight: 'normal' }}>Professional NFT Creation Platform</div>
            </div>
          </div>
          <div className="header-wallet">
            <ConnectButton />
          </div>
        </header>

        {/* Create NFT Card */}
        <div className="card">
          <h2 className="card-title">Create NFT</h2>
          <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Mint your unique digital collectible on Sui</p>

          <div className="card-section">
            <label>Package ID</label>
            <input
              type="text"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              placeholder="Enter Package ID"
            />
          </div>

          <div className="card-section">
            <label>Wallet Address</label>
            <input
              type="text"
              name="customerId"
              value={mintForm.customerId}
              onChange={handleMintChange}
              placeholder="Enter Customer Sui Address"
            />
          </div>

          <div className="card-section">
            <label>
              NFT Name
              <span title="The name of your NFT" style={{ marginLeft: 4, cursor: 'help', color: '#888' }}>ⓘ</span>
            </label>
            <input
              type="text"
              name="name"
              value={mintForm.name}
              onChange={handleMintChange}
              placeholder="Enter NFT name"
            />
          </div>

          <div className="card-section">
            <label>Description</label>
            <textarea
              name="description"
              value={mintForm.description}
              onChange={handleMintChange}
              placeholder="Describe your NFT"
              rows="3"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="card-section">
            <label>NFT Image</label>
            <div 
              className={`upload-area ${dragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
              style={{ marginBottom: '1rem' }}
            >
              <div style={{ fontSize: '1.2em', marginBottom: '0.5rem' }}>☁️</div>
              <div>Click to upload image or drag & drop</div>
              <div style={{ fontSize: '0.9em', marginTop: '0.5rem', color: '#888' }}>
                Supports .JPG, .PNG, .GIF up to 10MB. Will be stored on IPFS.
              </div>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />
            </div>
            <div style={{ textAlign: 'center', margin: '1rem 0', color: '#888' }}>OR USE URL</div>
            <input
              type="text"
              name="imageUrl"
              value={mintForm.imageUrl}
              onChange={(e) => {
                handleMintChange(e);
                setImgError(false);
                setUploadedImage(null);
              }}
              placeholder="https://example.com/image.jpg"
            />
            <p style={{ fontSize: '0.9em', color: '#888' }}>
              Direct link to your image (.JPG, .PNG, .GIF)
            </p>
          </div>

          {/* Live NFT Preview */}
          {(mintForm.imageUrl || mintForm.name || mintForm.description) && (
            <div style={{ margin: '1.5rem 0', padding: 16, border: '1px solid #333', borderRadius: 10, background: 'rgba(255,255,255,0.05)', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#6a82fb' }}>NFT Preview</div>
              {mintForm.imageUrl && !imgError && (
                <img
                  src={mintForm.imageUrl}
                  alt="NFT Preview"
                  style={{ maxWidth: '300px', maxHeight: '180px', border: '1px solid #444', borderRadius: '8px', marginBottom: 8 }}
                  onError={() => setImgError(true)}
                />
              )}
              {imgError && (
                <div style={{ color: '#ff6f61', margin: '10px 0' }}>
                  Could not load image. Please check the URL.
                </div>
              )}
              <div style={{ fontSize: '1.1em', fontWeight: 500, margin: '6px 0', color: '#fff' }}>
                {mintForm.name || <span style={{ color: '#666' }}>[NFT Name]</span>}
              </div>
              <div style={{ fontSize: '0.98em', color: '#aaa' }}>
                {mintForm.description || <span style={{ color: '#666' }}>[NFT Description]</span>}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={mintLoyalty} 
              disabled={
                loading || 
                !mintForm.customerId.trim() || 
                !mintForm.imageUrl.trim() ||
                !mintForm.name.trim() ||
                !mintForm.description.trim() ||
                !packageId.trim()
              }
              style={{ flex: 1, minWidth: 180 }}
              type="button"
            >
              {loading ? 'Minting...' : 'Mint NFT'}
            </button>
            <button 
              style={{ 
                minWidth: 120, 
                background: 'rgba(255,255,255,0.1)', 
                color: '#aaa',
                flex: '0 0 auto'
              }}
              type="button"
            >
              Preview
            </button>
          </div>

          {/* Loader Animation */}
          {loading && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <div className="loader"></div>
            </div>
          )}
        </div>

        {/* Your Collection Card */}
        <div className="card">
          <h2 className="card-title">Your Collection</h2>
          <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>NFTs you've minted on Sui Network</p>
          
          {!currentAccount ? (
            <div className="collection-card">
              <div style={{ fontSize: '2em', marginBottom: '1rem' }}>🔗</div>
              <div style={{ marginBottom: '0.5rem' }}>Connect Your Wallet</div>
              <div style={{ fontSize: '0.9em', color: '#888', textAlign: 'center' }}>
                Connect your wallet to view and manage your NFT collection
              </div>
            </div>
          ) : (
            <div>
              {recentTxs.length === 0 ? (
                <div className="collection-card">
                  <div style={{ fontSize: '2em', marginBottom: '1rem' }}>🎨</div>
                  <div>No NFTs Minted Yet</div>
                  <div style={{ fontSize: '0.9em', color: '#888', marginTop: '0.5rem' }}>
                    Start by creating your first NFT above
                  </div>
                </div>
              ) : (
                <div className="collection-gallery">
                  {recentTxs.map((tx, i) => (
                    <div key={i} className="nft-card">
                      <div style={{ 
                        width: '100%', 
                        height: '110px', 
                        background: 'linear-gradient(135deg, #6a82fb, #fc5c7d)', 
                        borderRadius: 8, 
                        marginBottom: '0.7em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2em'
                      }}>
                        🖼️
                      </div>
                      <div className="nft-title">NFT #{i + 1}</div>
                      <div className="nft-desc">Transaction: {tx.slice(0, 8)}...</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="footer">
          <div>Powered by Sui Network</div>
          <div style={{ marginTop: '0.3rem' }}>
            Created by <a href="https://github.com/malirab-01" target="_blank" rel="noopener noreferrer">@malirab-01</a>
          </div>
        </footer>

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
    </>
  );
};

export default LoyaltyCardPage;
