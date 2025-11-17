<div align="center">

<img src="./public/syuzhet.png" alt="Syuzhet Logo" width="240" />

# Syuzhet

**Express your intuition, predict the ending, make money along the way**

*A speculative foresight economy where intuition becomes a liquid asset and imagination accrues yield.*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![BNB Chain](https://img.shields.io/badge/Blockchain-BNB%20Chain-yellow)](https://www.bnbchain.org)
[![Arc Testnet](https://img.shields.io/badge/Blockchain-Arc%20Testnet-blue)](https://docs.arc.network)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)

---

</div>

## 🌟 What is Syuzhet?

Syuzhet operates at a high-leverage intersection of **finance**, **narrative psychology**, **decentralized infrastructure**, and **human creativity**, transforming predictions into on-chain markets powered by narrative liquidity.

Each prediction becomes a **dynamic, yield-bearing asset** whose value emerges from belief, participation, and evolving discourse—a new medium for trading intuition, where conviction and creativity parallelizes accuracy as traders figure out whether to **long, short or hedge** these prediction assets.

> **Be the Michael Saylor of the Predictions Forecasting Markets.**

<img src="./public/Saylor.png" alt="Michael Saylor" width="120" />

---

## 🎥 Demo Video

<div align="center">

[![Syuzhet Demo](https://img.youtube.com/vi/ZtOLHJhOkx0/0.jpg)](https://www.youtube.com/watch?v=ZtOLHJhOkx0)

**[Watch on YouTube](https://www.youtube.com/watch?v=ZtOLHJhOkx0)**

</div>

---

## 📄 Documentation PDF

<div align="center">

### 📖 Syuzhet Documentation

<a href="./public/Syuzhet.pdf" target="_blank">
  <img src="./public/syuzhet.png" alt="Syuzhet Documentation PDF" width="200" style="border: 2px solid #84cc16; border-radius: 12px; padding: 10px; cursor: pointer;" />
</a>

<br/><br/>

**[📥 Download PDF](./public/Syuzhet.pdf)** | **[👁️ View in Browser](./public/Syuzhet.pdf)**

</div>

---

## 🔄 End-to-End Flow

Syuzhet provides a complete flow from idea to on-chain asset:

1. **Enter Idea & Corpus** → User inputs messy intuition, research notes, URLs, and file uploads (PDF, TXT, MD)
2. **AI Generates Thesis** → OpenAI GPT-4o-mini transforms input into structured prediction thesis with probability and parameters
3. **Review & Edit** → User reviews and adjusts the AI-generated prediction
4. **Select Chain** → Choose your blockchain network (BNB Chain Testnet, BNB Chain Mainnet, or Arc Testnet) via the chain selector
5. **Mint On-Chain** → User mints the prediction as a market on the selected chain (USDC-based) or in demo mode
6. **Narrative Updates** → User can post narrative updates with new evidence, updating probability over time

**Key Technologies:**
- **Multi-Chain Support**: Deploy on BNB Chain (Mainnet/Testnet) or Arc Testnet with automatic decimal handling
- **BNB Chain Featured**: Default chain is BNB Chain Testnet with 18-decimal USDC support
- **Chain Toggle UI**: Easy network switching via header chain selector with localStorage persistence
- **OpenAI GPT-4o-mini**: Powers the AI orchestration layer for prediction generation and narrative updates
- **Smart Contracts**: Minimal PredictionMarket contract for market creation and update tracking
- **Server-Side Wallet**: Rust-based wallet server for seamless transactions across all supported chains
- **Demo Mode**: Works without contract deployment for easy testing

---

## 🚀 Quick Start

### Next.js Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Compile smart contracts
npm run compile

# Deploy to Arc Testnet (or use chain-specific commands below)
npm run deploy
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

**Note**: The app defaults to BNB Chain Testnet. Use the chain selector in the header to switch networks.

### Streamlit Application

We also provide a Streamlit version for easy deployment:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set OpenAI API key
export OPENAI_API_KEY="sk-proj-your-key-here"

# Run Streamlit app
streamlit run streamlit_app.py
```

---

## 🌐 Multi-Chain Support

Syuzhet supports multiple blockchain networks with **BNB Chain featured prominently**:

- **🌐 BNB Chain Testnet** (Chain ID: 97) - **DEFAULT** - USDC with 18 decimals ⭐
- **🌐 BNB Chain Mainnet** (Chain ID: 56) - USDC with 18 decimals
- **🔷 Arc Testnet** (Chain ID: 1243) - USDC with 6 decimals

**Chain Toggle**: Use the chain selector in the header to switch between networks. Your selection is saved in localStorage.

### Setting Default Chain

**BNB Chain Testnet is now the default chain.** You can override this by:

1. **Using the Chain Selector UI**: Click the chain selector in the header to switch networks
2. **Environment Variable**: Set `NEXT_PUBLIC_DEFAULT_CHAIN_ID` in your `.env` file:

```env
# BNB Chain Testnet (default - featured prominently)
NEXT_PUBLIC_DEFAULT_CHAIN_ID=97

# BNB Chain Mainnet
NEXT_PUBLIC_DEFAULT_CHAIN_ID=56

# Arc Testnet
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1243
```

### Deploy on BNB Chain (Featured)

#### BNB Chain Testnet (Recommended for Development)

```bash
# 1. Compile contracts
npm run compile

# 2. Deploy to BNB Chain Testnet
npx hardhat run scripts/deploy-arc.ts --network bnbTestnet
```

**Prerequisites:**
1. **Funded wallet**: Get testnet BNB from [BNB Chain Faucet](https://testnet.bnbchain.org/faucet-smart)
2. **Environment variables**: Set `PRIVATE_KEY` and `BNB_TESTNET_RPC_URL` in your `.env` file

After deployment, add to `.env`:
- `NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_BNB_TESTNET=<deployed_address>`
- `NEXT_PUBLIC_USDC_CONTRACT_BNB_TESTNET=0x64544969ed7EBf5f083679233325356EbE738930` (official testnet USDC)

#### BNB Chain Mainnet

```bash
# Deploy to BNB Chain Mainnet
npx hardhat run scripts/deploy-arc.ts --network bnbMainnet
```

After deployment, add to `.env`:
- `NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_BNB=<deployed_address>`
- `NEXT_PUBLIC_USDC_CONTRACT_BNB=0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` (official USDC)

### Deploy on Arc Testnet

The deployment process follows the [official Arc deployment tutorial](https://docs.arc.network/arc/tutorials/deploy-on-arc).

#### Prerequisites

1. **Funded wallet**: Get testnet USDC from [Circle Faucet](https://faucet.circle.com) (select Arc Testnet)
2. **Environment variables**: Set `PRIVATE_KEY` and `ARC_RPC_URL` in your `.env` file

#### Deployment Steps

```bash
# 1. Compile contracts
npm run compile

# 2. Deploy to Arc Testnet
npm run deploy
```

The `npm run deploy` command uses the `arcTestnet` network by default. After deployment:

1. Copy the deployed contract addresses from the console output
2. Add them to your `.env` file:
   - `NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_ARC=<deployed_address>`
   - `NEXT_PUBLIC_USDC_CONTRACT_ARC=<usdc_address>`

### 💰 USDC Decimals

**Important**: USDC uses different decimals on different chains:
- **Arc Testnet**: 6 decimals
- **BNB Chain**: 18 decimals

The application automatically handles this difference. See the [Arc Contract Addresses documentation](https://docs.arc.network/arc/references/contract-addresses#usdc) for Arc details.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Streamlit |
| **Blockchain** | BNB Chain (Mainnet & Testnet), Arc Testnet - EVM-compatible, Hardhat |
| **Wallet** | Dynamic Labs, Server-side Rust wallet, Circle Wallets (scaffolded) |
| **AI** | OpenAI GPT-4o-mini for prediction generation |
| **Smart Contracts** | Solidity, OpenZeppelin |
| **Token** | USDC (18 decimals on BNB Chain, 6 decimals on Arc) - Automatic decimal handling |
| **Backend** | Rust (Axum) for wallet server, Next.js API routes |
| **File Processing** | PDF parsing, directory picker API |

---

## ✨ Recent Features

### 🌐 Multi-Chain Support (NEW!)
- **BNB Chain Integration**: Full support for BNB Chain Mainnet and Testnet with 18-decimal USDC
- **Chain Toggle UI**: Prominent chain selector in header with BNB Chain featured (yellow/orange gradient)
- **BNB Chain Default**: BNB Chain Testnet is now the default network
- **Automatic Decimal Handling**: Seamless switching between 6-decimal (Arc) and 18-decimal (BNB Chain) USDC
- **Chain-Aware Contracts**: All contract interactions automatically use chain-specific addresses and RPC URLs
- **Persistent Selection**: Chain preference saved in localStorage across sessions

### 🎯 Enhanced Prediction Creation
- **Multi-source input**: Upload PDFs, TXT, MD files or paste text
- **URL research**: Add multiple research URLs
- **Market sentiment**: Configure market sentiment for better AI context
- **Directory picker**: Select local directories for bulk file processing

### 💼 Wallet Integration
- **Server-side wallet**: Rust-based wallet server for seamless transactions across all chains
- **Persistent connection**: Wallet connection persists via localStorage
- **Demo mode**: Works without wallet connection for testing
- **Auto-connect**: Wallet automatically connects on button click
- **Multi-chain support**: Works on BNB Chain (Mainnet/Testnet) and Arc Testnet

### 🚀 Deployment Options
- **Multi-chain deployment**: Deploy to BNB Chain or Arc Testnet with chain-specific configurations
- **Streamlit Cloud**: Python-based alternative deployment
- **Demo mode**: Works without contract deployment (generates mock markets)

### 🔧 Developer Experience
- **Chain-aware utilities**: All USDC and contract functions automatically handle chain differences
- **React Hooks compliance**: Fixed all Rules of Hooks violations
- **Error handling**: Graceful fallbacks for missing contracts/keys
- **Type safety**: Full TypeScript coverage with chain type definitions
- **ESLint**: Clean code with proper linting

---

## ⚙️ Environment Setup

Create a `.env` file based on `.env.example`:

```env
# Dynamic Labs
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Default Chain (97 = BNB Chain Testnet [DEFAULT], 56 = BNB Chain Mainnet, 1243 = Arc Testnet)
NEXT_PUBLIC_DEFAULT_CHAIN_ID=97

# Arc Testnet
ARC_RPC_URL=https://rpc-testnet.arc.network
NEXT_PUBLIC_USDC_CONTRACT_ARC=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_ARC=

# BNB Chain Mainnet
BNB_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_USDC_CONTRACT_BNB=0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_BNB=

# BNB Chain Testnet
BNB_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_USDC_CONTRACT_BNB_TESTNET=0x64544969ed7EBf5f083679233325356EbE738930
NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_BNB_TESTNET=

# Private key for deployment (NEVER commit this)
PRIVATE_KEY=your_private_key
```

---

## 📁 Project Structure

```
syuzhet/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── markets/      # Market creation endpoint
│   │   ├── predictions/  # AI prediction generation
│   │   ├── process-files/ # File processing (PDF, TXT, MD)
│   │   └── wallet/       # Wallet connection endpoint
│   ├── create/           # Prediction creation page
│   ├── markets/          # Market detail pages
│   └── ...
├── components/            # React components
│   ├── providers/       # Wallet providers (Dynamic, Circle scaffolded)
│   ├── ChainSelector.tsx    # Chain toggle UI (BNB Chain featured)
│   ├── PredictionWizard.tsx  # Multi-step prediction creation
│   ├── WalletConnection.tsx  # Wallet connection UI (chain-aware)
│   └── ...
├── contracts/             # Solidity smart contracts
│   ├── PredictionMarket.sol
│   └── MockUSDC.sol
├── lib/                   # Utilities and services
│   ├── ai/               # OpenAI orchestration
│   ├── chainConfig.ts    # Multi-chain configuration (BNB Chain, Arc)
│   ├── arcConfig.ts      # Arc Testnet configuration (legacy)
│   ├── usdc.ts           # USDC utilities (chain-aware: 6 or 18 decimals)
│   ├── contracts.ts     # Contract helpers (chain-aware)
│   ├── corpus/           # File/directory reading
│   └── wallets/          # Wallet integrations
├── wallet-server/         # Rust wallet server
│   ├── src/
│   │   ├── main.rs       # Axum HTTP server
│   │   ├── wallet.rs     # Wallet service
│   │   └── config.rs     # Configuration
│   └── Cargo.toml
├── scripts/               # Deployment scripts
│   ├── deploy-arc.ts     # Arc Testnet deployment
│   └── deploy.ts         # Local deployment
├── streamlit_app.py      # Streamlit application
├── requirements.txt       # Python dependencies
├── .mcp/                  # Raindrop MCP manifest
└── public/                # Static assets
```

---

## 📚 Documentation

### Blockchain Networks
- [BNB Chain Documentation](https://docs.bnbchain.org)
- [BNB Chain Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [Arc Deployment Tutorial](https://docs.arc.network/arc/tutorials/deploy-on-arc)
- [USDC on Arc](https://docs.arc.network/arc/references/contract-addresses#usdc)
- [USDC on BNB Chain](https://bscscan.com/token/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d)

---

## 🎮 Demo Mode

Syuzhet includes a **demo mode** that allows you to test the full flow without deploying contracts:

- ✅ Works without `PREDICTION_MARKET_ADDRESS` configured
- ✅ Works without `PRIVATE_KEY` configured
- ✅ Generates mock market IDs and transaction hashes
- ✅ Full UI/UX experience for testing

Simply run `npm run dev` and start creating predictions! The app will automatically use demo mode when contracts aren't deployed.

---

## 📄 License

MIT

---

<div align="center">

**Built with ⚡ on BNB Chain & Arc Testnet**

*Rewriting the script, predicting the ending*

[![BNB Chain](https://img.shields.io/badge/Powered%20by-BNB%20Chain-yellow)](https://www.bnbchain.org) [![Arc](https://img.shields.io/badge/Powered%20by-Arc-blue)](https://docs.arc.network)

</div>
