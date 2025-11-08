# Wallet Connection Guide

## Overview

Your wallet is now connected! The app will automatically display your wallet address and USDC balance in the header.

## Your Wallet Details

- **Address**: `0x0aaa246300e261c6801b8c62397090deb47310ba`
- **Network**: Arc Testnet (Chain ID: 1243)
- **Balance**: 20 USDC (testnet tokens)

## How It Works

The app uses a **server-side wallet connection** that:
1. Reads your `PRIVATE_KEY` from `.env` (server-side only, never exposed to frontend)
2. Derives the wallet address
3. Displays it in the header with USDC balance
4. Uses this wallet for on-chain transactions (market creation)

## What You'll See

In the header, you'll see:
- **Arc Testnet** badge
- **USDC Balance** (updates every 10 seconds)
- **Wallet Address** (truncated: `0x0aaa...10ba`)
- **Copy button** to copy full address
- **Explorer link** to view on Arc Testnet Explorer

## Using Your Wallet

### For Market Creation

When you create a prediction and click "Mint Prediction Asset":
1. The app uses your server-side wallet (from `PRIVATE_KEY`)
2. Checks your USDC balance
3. Approves USDC to the PredictionMarket contract
4. Creates the market on-chain
5. Shows transaction status with Arc Explorer link

### Balance Updates

Your USDC balance automatically refreshes:
- Every 10 seconds
- After transactions
- When you navigate between pages

## Alternative: Connect via Dynamic Labs

If you want to use Dynamic Labs for wallet connection:

1. **Get Dynamic Labs Environment ID**:
   - Sign up at [Dynamic Labs](https://dynamic.xyz)
   - Create a new project
   - Copy your Environment ID

2. **Update `.env`**:
   ```env
   NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_environment_id_here
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

4. **Connect your wallet**:
   - Click "Connect Wallet" in the header
   - Choose your wallet provider (MetaMask, WalletConnect, etc.)
   - Approve the connection

## Importing Wallet to MetaMask (Optional)

If you want to use MetaMask with your wallet:

1. **Open MetaMask**
2. **Click the account icon** → **Import Account**
3. **Paste your private key**: `d704a381d03a2673527d57fc2894128c5fb6dd2264f01339d17883f7fa19b6d4`
4. **Add Arc Testnet Network**:
   - Network Name: `Arc Testnet`
   - RPC URL: `https://rpc-testnet.arc.network`
   - Chain ID: `1243`
   - Currency Symbol: `USDC`
   - Block Explorer: `https://testnet-explorer.arc.network`

5. **Connect via Dynamic Labs** (if configured)

## Security Notes

⚠️ **Important**:
- Your `PRIVATE_KEY` is stored in `.env` (server-side only)
- **Never commit `.env`** to version control
- The private key is **never exposed** to the frontend
- All transactions are signed server-side
- For production, consider using Circle Wallets or user wallet signing

## Troubleshooting

### Balance Not Showing

- Check that `NEXT_PUBLIC_USDC_CONTRACT` is set correctly in `.env`
- Verify your wallet has USDC on Arc Testnet
- Check browser console for errors
- Ensure Arc Testnet RPC is accessible

### Transactions Failing

- Verify you have enough USDC for gas + liquidity
- Check that `PREDICTION_MARKET_CONTRACT` is deployed and set in `.env`
- Ensure `PRIVATE_KEY` in `.env` matches your wallet
- Check Arc Testnet Explorer for transaction status

### Wallet Address Not Displaying

- Verify `PRIVATE_KEY` is set in `.env`
- Check that the API route `/api/wallet/connect` is accessible
- Check browser console for errors
- Restart the dev server

## Next Steps

1. ✅ Wallet is connected and displaying
2. ✅ USDC balance is showing (20 USDC)
3. 🎯 Create a prediction via `/create`
4. 🎯 Mint it on-chain
5. 🎯 View on Arc Explorer

## Resources

- [Arc Testnet Explorer](https://testnet-explorer.arc.network/address/0x0aaa246300e261c6801b8c62397090deb47310ba)
- [Circle Faucet](https://faucet.circle.com) - Get more testnet USDC
- [Dynamic Labs Docs](https://docs.dynamic.xyz)

