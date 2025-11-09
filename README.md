<div align="center">

<img src="./public/syuzhet.png" alt="Syuzhet Logo" width="240" />

# Syuzhet

**Express your intuition, predict the ending, make money along the way**

*A speculative foresight economy where intuition becomes a liquid asset and imagination accrues yield.*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
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
4. **Mint On-Chain** → User mints the prediction as a market on Arc Testnet (USDC-based) or in demo mode
5. **Narrative Updates** → User can post narrative updates with new evidence, updating probability over time

**Key Technologies:**
- **Arc Testnet + USDC**: All on-chain settlement uses USDC on Arc (6 decimals)
- **OpenAI GPT-4o-mini**: Powers the AI orchestration layer for prediction generation and narrative updates
- **Smart Contracts**: Minimal PredictionMarket contract for market creation and update tracking
- **Server-Side Wallet**: Rust-based wallet server for seamless transactions
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

# Deploy to Arc Testnet
npm run deploy
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

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

## 🌐 Deploy on Arc

Syuzhet is designed to deploy on **Arc Testnet**. The deployment process follows the [official Arc deployment tutorial](https://docs.arc.network/arc/tutorials/deploy-on-arc).

### Prerequisites

1. **Funded wallet**: Get testnet USDC from [Circle Faucet](https://faucet.circle.com) (select Arc Testnet)
2. **Environment variables**: Set `PRIVATE_KEY` and `ARC_RPC_URL` in your `.env` file

### Deployment Steps

```bash
# 1. Compile contracts
npm run compile

# 2. Deploy to Arc Testnet
npm run deploy
```

The `npm run deploy` command uses the `arcTestnet` network by default. After deployment:

1. Copy the deployed contract addresses from the console output
2. Add them to your `.env` file:
   - `NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=<deployed_address>`
   - `NEXT_PUBLIC_USDC_CONTRACT=<usdc_address>`

### 💰 USDC on Arc

Syuzhet uses **USDC on Arc** for all onchain settlement. USDC on Arc uses **6 decimals** (not 18). The official Arc Testnet USDC address is configured in `.env.example`. See the [Arc Contract Addresses documentation](https://docs.arc.network/arc/references/contract-addresses#usdc) for details.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Streamlit |
| **Blockchain** | Arc Testnet (EVM-compatible), Hardhat |
| **Wallet** | Dynamic Labs, Server-side Rust wallet, Circle Wallets (scaffolded) |
| **AI** | OpenAI GPT-4o-mini for prediction generation |
| **Smart Contracts** | Solidity, OpenZeppelin |
| **Token** | USDC on Arc (6 decimals) |
| **Backend** | Rust (Axum) for wallet server, Next.js API routes |
| **File Processing** | PDF parsing, directory picker API |

---

## ✨ Recent Features

### 🎯 Enhanced Prediction Creation
- **Multi-source input**: Upload PDFs, TXT, MD files or paste text
- **URL research**: Add multiple research URLs
- **Market sentiment**: Configure market sentiment for better AI context
- **Directory picker**: Select local directories for bulk file processing

### 💼 Wallet Integration
- **Server-side wallet**: Rust-based wallet server for seamless transactions
- **Persistent connection**: Wallet connection persists via localStorage
- **Demo mode**: Works without wallet connection for testing
- **Auto-connect**: Wallet automatically connects on button click

### 🚀 Deployment Options
- **Vercel**: Free deployment with environment variables
- **Streamlit Cloud**: Python-based alternative deployment
- **Demo mode**: Works without contract deployment (generates mock markets)

### 🔧 Developer Experience
- **React Hooks compliance**: Fixed all Rules of Hooks violations
- **Error handling**: Graceful fallbacks for missing contracts/keys
- **Type safety**: Full TypeScript coverage
- **ESLint**: Clean code with proper linting

---

## ⚙️ Environment Setup

Create a `.env` file based on `.env.example`:

```env
# Dynamic Labs
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Arc Testnet
ARC_RPC_URL=https://rpc-testnet.arc.network
PRIVATE_KEY=your_private_key

# Contract Addresses (after deployment)
NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=
NEXT_PUBLIC_USDC_CONTRACT=
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
│   ├── PredictionWizard.tsx  # Multi-step prediction creation
│   ├── WalletConnection.tsx  # Wallet connection UI
│   └── ...
├── contracts/             # Solidity smart contracts
│   ├── PredictionMarket.sol
│   └── MockUSDC.sol
├── lib/                   # Utilities and services
│   ├── ai/               # OpenAI orchestration
│   ├── arcConfig.ts      # Arc Testnet configuration
│   ├── usdc.ts           # USDC utilities (6 decimals)
│   ├── contracts.ts      # Contract helpers
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

- [Arc Deployment Tutorial](https://docs.arc.network/arc/tutorials/deploy-on-arc)
- [USDC on Arc](https://docs.arc.network/arc/references/contract-addresses#usdc)

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

**Built with ⚡ on Arc Testnet**

*Rewriting the script, predicting the ending*

</div>
