import React, { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount
} from '@mysten/dapp-kit';
import './App.css';

const LoyaltyCardPage = () => {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [packageId, setPackageId] = useState('');

  // Form states
  const [mintForm, setMintForm] = useState({
    customerId: '',
    imageUrl: ''
  });

  // Image preview state
  const [imgError, setImgError] = useState(false);

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleMintChange = (e) => {
    setMintForm({ ...mintForm, [e.target.name]: e.target.value });
  };

  // Action: mint a new Loyalty card
  const mintLoyalty = async () => {
    if (!currentAccount) {
      alert('Please connect your wallet');
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: $`{packageId}::loyalty_card::mint_loyalty`,
        arguments: [
          tx.pure.address(mintForm.customerId),
          tx.pure.string(mintForm.imageUrl)
        ]
      });
      await signAndExecute({ transaction: tx });
      setMintForm({ customerId: '', imageUrl: '' });
    } catch (error) {
      console.error('Error minting loyalty card:', error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Mint Your NFT on SUI</h1>
      <ConnectButton />

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
        <label>Wallet Address</label>
        <input
          type="text"
          name="customerId"
          value={mintForm.customerId}
          onChange={handleMintChange}
          placeholder="Enter Customer Sui Address"
        />
        <label>Image URL</label>
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
        {/* Image Preview */}
        {mintForm.imageUrl && !imgError && (
          <div style={{ margin: '10px 0' }}>
            <img
              src={mintForm.imageUrl}
              alt="Preview"
              style={{ maxWidth: '300px', maxHeight: '200px', border: '1px solid #ccc', borderRadius: '8px' }}
              onError={() => setImgError(true)}
            />
          </div>
        )}
        {imgError && (
          <div style={{ color: 'red', margin: '10px 0' }}>
            Could not load image. Please check the URL.
          </div>
        )}
        <button 
          onClick={mintLoyalty} 
          disabled={
            loading || 
            !mintForm.customerId.trim() || 
            !mintForm.imageUrl.trim()
          }
        >
          Mint your NFT
        </button>
      </section>
    </div>
  );
};

export default LoyaltyCardPage;
