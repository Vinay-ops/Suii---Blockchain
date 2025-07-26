# Suii---Blockchain

### 🔗 [Live App on Vercel](https://suii-blockchain.vercel.app/)

# SUI NFT Minting App

A beautiful, animated React app for minting NFTs on the SUI blockchain. Features wallet connection, live image preview, animated UI, confetti celebration, and robust error handling.

---


## 🚀 Features
- **Connect SUI Wallet** (testnet/mainnet)
- **Mint NFT** with custom image URL and recipient address
- **Live Image Preview** as you type
- **Animated, Colorful UI** (gradient background, animated cards, confetti)
- **Wallet Balance & Recent Transactions**
- **Success/Error Modal** with transaction explorer link
- **Loading Spinner** during minting
- **Input Validation & Error Handling**

---

## 🛠️ Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Vinay-ops/Suii---Blockchain
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the app:**
   ```bash
   npm start
   ```
   The app runs at [http://localhost:3000](http://localhost:3000)

---

## 📝 Usage

1. **Connect your SUI wallet** using the Connect button.
2. **Enter the Package ID** of your deployed Move contract.
3. **Enter the recipient SUI address** (can be your own or another address).
4. **Paste an image URL** (see a live preview below the input).
5. **Click "Mint your NFT"**.
6. **See animated feedback:**
   - Loading spinner during minting
   - Confetti and modal on success
   - Error modal if something goes wrong
7. **View your wallet balance and recent transactions** at the top.

---

## 🎨 Customization
- **UI Colors & Animations:**
  - Edit `src/App.css` for backgrounds, gradients, and animation effects.
- **Contract Details:**
  - Update the Move call in `src/App.js` if your contract/module/function names differ.
- **Network:**
  - Default is SUI testnet. Change in `src/index.js` if needed.

---

## 🧩 Dependencies
- React
- @mysten/sui & @mysten/dapp-kit
- react-router-dom
- @tanstack/react-query

---

## 🐞 Troubleshooting
- **Minting failed: $ is not defined**
  - Fix: Use backticks and `${}` for template literals, not `$``.
- **No wallet balance/transactions?**
  - Make sure your wallet is connected and on the correct network.
- **Contract errors?**
  - Double-check your Package ID and contract function/module names.

---

## 📄 License
MIT
