# Wallet Connection & USDC Integration Guide

## Overview

This guide explains how to connect your wallet to Syuzhet and use USDC on Arc Testnet to create prediction markets. The system supports both Dynamic Labs (current) and Circle Wallets (account abstraction) for wallet management.

## Prerequisites

1. **Arc Testnet Wallet**: You need a wallet with Arc Testnet configured
2. **USDC on Arc**: Get testnet USDC from [Circle Faucet](https://faucet.circle.com) (select Arc Testnet)
3. **Environment Variables**: Configure `.env` file` with proper addresses

## Environment Variables Setup

Create or update your `.env` file with:

```env
# Dynamic Labs (optional - for wallet connection)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# OpenAI (for prediction generation)
OPENAI_API_KEY=your_openai_api_key

# Arc Testnet RPC
ARC_RPC_URL=https://rpc-testnet.arc.network
NEXT_PUBLIC_ARC_RPC_URL=https://rpc-testnet.arc.network

# Private key for deployment/server operations (NEVER commit)
PRIVATE_KEY=your_private_key_for_deployment

# USDC on Arc Testnet (6 decimals)
# Official address from: https://docs.arc.network/arc/references/contract-addresses#usdc
NEXT_PUBLIC_USDC_CONTRACT=0x0aaa246300e261c6801b8c62397090deb47310ba

# Prediction Market Contract (set after deployment)
NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=your_deployed_contract_address

# Circle Wallets (Account Abstraction)
CIRCLE_WALLET_API_KEY=your_circle_api_key
CIRCLE_WALLET_BASE_URL=https://api.circle.com/v1/w3s
```

## Arc Testnet USDC Setup

### Getting Testnet USDC

1. Visit [Circle Faucet](https://faucet.circle.com)
2. Select **Arc Testnet** from the network dropdown
3. Enter your wallet address: `0x0aaa246300e261c6801b8c62397090deb47310ba`
4. Request testnet USDC (you'll need this for creating markets)

### USDC Characteristics on Arc

- **Decimals**: 6 (not 18 like ETH)
- **Contract Address**: Set in `NEXT_PUBLIC_USDC_CONTRACT`
- **Native Gas**: USDC is used for gas on Arc (not ETH)

## Wallet Connection Flow

### Option 1: Dynamic Labs (Current Implementation)

1. **Set Environment ID**: Add `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` to `.env`
2. **Connect Wallet**: Click "Connect Wallet" in the app
3. **Switch to Arc Testnet**: Dynamic Labs will prompt to switch networks
4. **Approve Connection**: Confirm the wallet connection

### Option 2: Circle Wallets (Account Abstraction - For Hackathon)

Circle Wallets provides account abstraction, allowing:
- **In-app wallet creation** for users without external wallets
- **Gasless transactions** (sponsored by your app)
- **Better UX** for web2 users

**Setup Steps:**

1. **Get Circle API Credentials**:
   - Sign up at [Circle Developer Console](https://developers.circle.com)
   - Create a new app/project
   - Get your `CIRCLE_WALLET_API_KEY` and `CIRCLE_WALLET_BASE_URL`

2. **Configure Environment**:
   ```env
   CIRCLE_WALLET_API_KEY=your_api_key_here
   CIRCLE_WALLET_BASE_URL=https://api.circle.com/v1/w3s
   ```

3. **First-Time User Flow**:
   - User signs in with email/social
   - App calls `createCircleSmartWalletForUser(userId)`
   - Circle creates a smart wallet on Arc Testnet
   - User can fund it with USDC from faucet

## On-Chain Market Creation Flow

### Step-by-Step Process

1. **User Creates Prediction**:
   - Enters idea/research in PredictionWizard
   - AI generates structured prediction thesis
   - User reviews and edits

2. **User Configures Market**:
   - Sets expiry date
   - Sets initial liquidity (USDC amount)
   - Reviews summary

3. **On-Chain Minting**:
   - User clicks "Mint Prediction Asset"
   - App calls `/api/markets/create`
   - Backend performs:
     a. **USDC Approval**: `USDC.approve(PredictionMarket, amount)`
     b. **Market Creation**: `PredictionMarket.createMarket(...)`
   - Returns transaction hash and market ID

4. **Transaction Confirmation**:
   - UI shows "Pending" status
   - Polls for confirmation
   - Updates to "Confirmed" with Arc Explorer link

### API Endpoint: `/api/markets/create`

**Request Body:**
```json
{
  "title": "Human lands on Mars by 2038",
  "thesis": "Based on SpaceX progress and NASA timelines...",
  "expiryTimestamp": 2145916800,
  "initialLiquidityUsdc": 1000,
  "walletAddress": "0x0aaa246300e261c6801b8c62397090deb47310ba"
}
```

**Response:**
```json
{
  "success": true,
  "marketId": 1,
  "txHash": "0x...",
  "explorerUrl": "https://testnet-explorer.arc.network/tx/0x..."
}
```

## Circle Wallets Integration (Account Abstraction)

### For Hackathon Demo

The Circle Wallets integration is scaffolded in `lib/wallets/circleWallet.ts`. To demonstrate:

1. **Create Wallet for User**:
   ```typescript
   const wallet = await createCircleSmartWalletForUser(userId);
   ```

2. **Get Wallet Address**:
   ```typescript
   const address = await getCircleWalletAddress(userId);
   ```

3. **Check Balance**:
   ```typescript
   const balance = await getWalletBalance(address);
   ```

4. **Transfer USDC** (for funding):
   ```typescript
   const txId = await transferUsdc(fromAddress, toAddress, "100.00");
   ```

### Implementation Status

- ✅ **Scaffolded**: Function stubs with TODOs
- ⚠️ **Not Implemented**: Actual Circle API calls
- 📝 **For Hackathon**: Show the flow, use mock responses if needed

## UI Components

### Transaction Status Component

Shows real-time transaction status:
- **Pending**: Transaction submitted, waiting for confirmation
- **Confirmed**: Transaction confirmed, show market ID
- **Failed**: Transaction failed, show error message
- **Explorer Link**: Link to Arc Testnet Explorer

### Wallet Connection Badge

- Shows connected wallet address (truncated)
- Network indicator: "Arc Testnet"
- Balance display: USDC balance

## Testing the Flow

### 1. Local Testing

```bash
# Start local node (if using Hardhat)
npx hardhat node

# Deploy contracts locally
npm run deploy:local

# Start frontend
npm run dev
```

### 2. Arc Testnet Testing

```bash
# Deploy to Arc Testnet
npm run deploy

# Copy contract address to .env
NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=0x...

# Start frontend
npm run dev
```

### 3. Test Transaction Flow

1. Connect wallet (Dynamic Labs or Circle)
2. Ensure wallet has USDC on Arc Testnet
3. Create a prediction via PredictionWizard
4. Click "Mint Prediction Asset"
5. Approve USDC transaction in wallet
6. Confirm market creation transaction
7. View transaction on Arc Explorer

## Troubleshooting

### "Insufficient USDC"

- Get testnet USDC from Circle Faucet
- Check balance: `getWalletBalance(address)`
- Ensure you have enough for gas + liquidity

### "Contract not deployed"

- Run `npm run deploy` to deploy PredictionMarket
- Copy address to `NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT`
- Restart dev server

### "Network mismatch"

- Ensure wallet is connected to Arc Testnet (Chain ID: 1243)
- Check `ARC_RPC_URL` in `.env`
- Verify Dynamic Labs network configuration

### "USDC approval failed"

- Check USDC contract address is correct
- Ensure wallet has USDC balance
- Verify PredictionMarket contract address

## Security Notes

⚠️ **IMPORTANT**:

- **Never commit `.env` file** - it contains private keys
- **Use testnet keys only** - never use mainnet private keys
- **Rotate keys** if accidentally exposed
- **Validate all inputs** before sending to blockchain
- **Use proper error handling** for failed transactions

## Next Steps for Production

1. **Full Circle Wallets Integration**: Implement actual API calls
2. **Transaction Batching**: Batch multiple operations
3. **Gas Optimization**: Optimize contract calls
4. **Error Recovery**: Handle failed transactions gracefully
5. **Rate Limiting**: Prevent spam/abuse
6. **Multi-sig Support**: For high-value markets

## Resources

- [Arc Network Docs](https://docs.arc.network)
- [Circle Wallets API](https://developers.circle.com/w3s/docs)
- [Arc Testnet Explorer](https://testnet-explorer.arc.network)
- [Circle Faucet](https://faucet.circle.com)

