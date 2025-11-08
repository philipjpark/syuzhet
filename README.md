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

## 🚀 Quick Start

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
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Blockchain** | Arc Testnet (EVM-compatible), Hardhat |
| **Wallet** | Dynamic Labs (current) + Circle Wallets (scaffolded) |
| **AI** | OpenAI GPT-4 for prediction generation |
| **Smart Contracts** | Solidity, OpenZeppelin |
| **Token** | USDC on Arc (6 decimals) |

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

## 🤖 AI IDE / MCP

This repository is designed to be extended via **Claude Code + Raindrop MCP**. See [RAINDROP.md](./RAINDROP.md) for how to launch an MCP-backed coding session.

With Raindrop MCP, AI agents can help evolve:
- ✨ Arc contract design and optimization
- 📊 Prediction market logic and mechanisms
- 🔗 Onchain interactions and integrations
- 🎨 Full-stack development across the platform

---

## 📁 Project Structure

```
syuzhet/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── providers/         # Wallet providers (Dynamic, Circle scaffolded)
│   └── ...
├── contracts/              # Solidity smart contracts
│   ├── PredictionMarket.sol
│   └── MockUSDC.sol
├── lib/                    # Utilities and services
│   ├── arcConfig.ts       # Arc Testnet configuration
│   ├── usdc.ts            # USDC utilities (6 decimals)
│   ├── wallets/           # Wallet integrations
│   └── ...
├── scripts/                # Deployment scripts
│   ├── deploy-arc.ts      # Arc Testnet deployment
│   └── deploy.ts          # Local deployment
├── .mcp/                   # Raindrop MCP manifest
└── public/                 # Static assets
```

---

## 📚 Documentation

- [Arc Deployment Tutorial](https://docs.arc.network/arc/tutorials/deploy-on-arc)
- [USDC on Arc](https://docs.arc.network/arc/references/contract-addresses#usdc)
- [Raindrop MCP Setup](./RAINDROP.md)

---

## 📄 License

MIT

---

<div align="center">

**Built with ⚡ on Arc Testnet**

*Rewriting the script, predicting the ending*

</div>
