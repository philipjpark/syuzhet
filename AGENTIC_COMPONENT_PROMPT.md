# Agentic Component Prompt for Wallet Connection & USDC Integration

## Overview

This prompt is designed for an AI agent to help implement and demonstrate the wallet connection and USDC integration flow in Syuzhet. The agent should be able to:

1. **Connect a wallet** (Dynamic Labs or Circle Wallets)
2. **Display USDC balance** on Arc Testnet
3. **Show transaction status** for market creation
4. **Guide users** through the on-chain prediction market creation process

## System Context

**Application**: Syuzhet - Predictions Investment Platform  
**Blockchain**: Arc Testnet (Chain ID: 1243)  
**Native Asset**: USDC (6 decimals, not 18)  
**Wallet Options**: 
- Dynamic Labs (current implementation)
- Circle Wallets (account abstraction - for hackathon demo)

**Key Addresses**:
- **USDC Contract**: `0x0aaa246300e261c6801b8c62397090deb47310ba` (set in `.env` as `NEXT_PUBLIC_USDC_CONTRACT`)
- **Wallet Address**: `0x0aaa246300e261c6801b8c62397090deb47310ba` (your Arc public wallet)
- **Prediction Market Contract**: Set after deployment via `npm run deploy`

## Agentic Component Requirements

### 1. Wallet Connection Component

**Purpose**: Display wallet connection status and allow users to connect their wallet.

**Features**:
- Show "Connect Wallet" button if not connected
- Display connected wallet address (truncated: `0x0aaa...10ba`)
- Show network badge: "Arc Testnet" (Chain ID: 1243)
- Display USDC balance once connected
- Handle network switching if user is on wrong network

**Implementation Location**: 
- `components/WalletConnection.tsx` (create if doesn't exist)
- Uses `useDynamicContext()` from `@/components/providers/DynamicProvider`

**Example UI**:
```
┌─────────────────────────────────────┐
│  [Connected] Arc Testnet            │
│  0x0aaa...10ba                      │
│  Balance: $1,234.56 USDC            │
└─────────────────────────────────────┘
```

### 2. USDC Balance Display

**Purpose**: Show user's USDC balance on Arc Testnet.

**Implementation**:
- Use `getWalletBalance(address)` from `lib/wallets/circleWallet.ts`
- Format using `formatUsdc()` from `lib/usdc.ts`
- Update balance after transactions
- Show loading state while fetching

**Code Example**:
```typescript
import { getWalletBalance } from '@/lib/wallets/circleWallet';
import { formatUsdc } from '@/lib/usdc';

const [balance, setBalance] = useState<bigint | null>(null);
const walletAddress = primaryWallet?.address;

useEffect(() => {
  if (walletAddress) {
    getWalletBalance(walletAddress).then(setBalance);
  }
}, [walletAddress]);

// Display: {balance ? formatUsdc(balance) : 'Loading...'}
```

### 3. Transaction Status Component

**Purpose**: Show real-time transaction status for market creation.

**Status States**:
- **Idle**: No transaction in progress
- **Pending**: Transaction submitted, waiting for confirmation
- **Confirmed**: Transaction confirmed, show market ID and explorer link
- **Failed**: Transaction failed, show error message

**Implementation**: 
- Already created in `components/TransactionStatus.tsx`
- Used in `components/PredictionWizard.tsx` during mint step

**Features**:
- Real-time status updates
- Transaction hash display (truncated)
- Arc Explorer link (`https://testnet-explorer.arc.network/tx/{txHash}`)
- Market ID display after confirmation
- Error message display on failure

### 4. On-Chain Market Creation Flow

**Purpose**: Create prediction markets on Arc Testnet using USDC.

**Flow**:
1. User completes PredictionWizard (AI generates prediction)
2. User clicks "Mint Prediction Asset"
3. Frontend calls `/api/markets/create` with:
   ```json
   {
     "title": "Human lands on Mars by 2038",
     "thesis": "Based on SpaceX progress...",
     "expiryTimestamp": 2145916800,
     "initialLiquidityUsdc": 1000
   }
   ```
4. Backend (API route):
   - Uses `PRIVATE_KEY` from `.env` to sign transactions
   - Approves USDC: `USDC.approve(PredictionMarket, amount)`
   - Creates market: `PredictionMarket.createMarket(...)`
   - Returns: `{ success, marketId, txHash, explorerUrl }`
5. Frontend displays transaction status
6. Redirects to `/markets/{marketId}` after confirmation

**API Endpoint**: `POST /api/markets/create`

**Implementation**: Already created in `app/api/markets/create/route.ts`

### 5. Circle Wallets Integration (For Hackathon)

**Purpose**: Demonstrate account abstraction with Circle Wallets.

**Current Status**: 
- Scaffolded in `lib/wallets/circleWallet.ts`
- `getWalletBalance()` is implemented (basic version)
- Other functions throw "Not implemented" errors

**For Hackathon Demo**:
- Show the flow: "Create Circle Wallet for user"
- Display wallet address after creation
- Show USDC balance
- Optionally: Mock the wallet creation if Circle API not fully integrated

**Implementation Steps** (if time permits):
1. Get Circle API credentials from Circle Developer Console
2. Implement `createCircleSmartWalletForUser(userId)`
3. Store wallet ID/address in database or session
4. Use Circle's transaction signing for market creation

## Agent Instructions

### Task 1: Create Wallet Connection Component

**Prompt for Agent**:
```
Create a WalletConnection component that:
1. Uses Dynamic Labs context to check wallet connection
2. Shows "Connect Wallet" button if not connected
3. Displays connected wallet address (truncated)
4. Shows "Arc Testnet" network badge
5. Displays USDC balance using getWalletBalance()
6. Handles network switching if needed

Location: components/WalletConnection.tsx
Use: components/providers/DynamicProvider for wallet context
Use: lib/wallets/circleWallet.ts for balance
Use: lib/usdc.ts for formatting
```

### Task 2: Integrate Wallet Connection into App

**Prompt for Agent**:
```
Add the WalletConnection component to:
1. The main app layout (app/app/layout.tsx or app/layout.tsx)
2. The PredictionWizard component (show balance before minting)
3. The Portfolio page (show user's wallet and balance)

Ensure it works in both:
- Mock mode (when Dynamic Labs not configured)
- Real mode (when NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is set)
```

### Task 3: Enhance Transaction Status

**Prompt for Agent**:
```
Enhance the TransactionStatus component to:
1. Poll for transaction confirmation (check every 2 seconds)
2. Show estimated confirmation time
3. Display gas fees (if available)
4. Add "View on Arc Explorer" button with proper styling
5. Show market preview after confirmation

Location: components/TransactionStatus.tsx
```

### Task 4: Test On-Chain Flow

**Prompt for Agent**:
```
Test the complete on-chain flow:
1. Ensure PredictionMarket contract is deployed (run npm run deploy)
2. Set NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT in .env
3. Ensure PRIVATE_KEY in .env has USDC on Arc Testnet
4. Create a prediction via PredictionWizard
5. Click "Mint Prediction Asset"
6. Verify transaction appears on Arc Explorer
7. Check that market ID is extracted correctly

If errors occur:
- Check contract addresses in .env
- Verify USDC balance of PRIVATE_KEY wallet
- Check Arc Testnet RPC URL
- Review transaction on Arc Explorer
```

### Task 5: Circle Wallets Demo (Optional)

**Prompt for Agent**:
```
For hackathon demo, create a mock Circle Wallets flow:
1. Create a "Create Circle Wallet" button
2. On click, generate a mock wallet address (use ethers.Wallet.createRandom())
3. Store wallet address in localStorage
4. Display wallet address and balance
5. Show message: "Circle Wallets integration - Demo Mode"

This demonstrates the account abstraction concept without full API integration.

Location: components/CircleWalletDemo.tsx (new file)
```

## Testing Checklist

- [ ] Wallet connects via Dynamic Labs
- [ ] USDC balance displays correctly
- [ ] Network badge shows "Arc Testnet"
- [ ] Market creation transaction succeeds
- [ ] Transaction status updates in real-time
- [ ] Arc Explorer link works
- [ ] Market ID is extracted correctly
- [ ] Error handling works for failed transactions
- [ ] Insufficient USDC error is caught
- [ ] Mock mode works without wallet connection

## Environment Variables Checklist

Ensure these are set in `.env`:

```env
# Required
NEXT_PUBLIC_USDC_CONTRACT=0x0aaa246300e261c6801b8c62397090deb47310ba
NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=<deployed_address>
PRIVATE_KEY=<your_private_key_with_usdc>
ARC_RPC_URL=https://rpc-testnet.arc.network
NEXT_PUBLIC_ARC_RPC_URL=https://rpc-testnet.arc.network

# Optional (for Dynamic Labs)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=<your_dynamic_id>

# Optional (for Circle Wallets)
CIRCLE_WALLET_API_KEY=<your_circle_key>
CIRCLE_WALLET_BASE_URL=https://api.circle.com/v1/w3s
```

## Resources

- [Arc Network Docs](https://docs.arc.network)
- [Arc Testnet Explorer](https://testnet-explorer.arc.network)
- [Circle Wallets API](https://developers.circle.com/w3s/docs)
- [Circle Faucet](https://faucet.circle.com) - Get testnet USDC
- [Dynamic Labs Docs](https://docs.dynamic.xyz)

## Notes for Hackathon

1. **Server-Side Signing**: Currently using `PRIVATE_KEY` for transactions. This is fine for hackathon demo but not production-ready.
2. **Circle Wallets**: Basic implementation is fine for demo. Full integration can be shown as "future work."
3. **Error Handling**: Ensure all errors are user-friendly and actionable.
4. **Transaction Status**: Real-time updates are impressive for judges.
5. **Explorer Links**: Always provide links to Arc Explorer for transparency.

## Success Criteria

✅ Wallet connects and displays balance  
✅ Market creation transaction succeeds  
✅ Transaction status updates in real-time  
✅ Arc Explorer links work  
✅ Error messages are clear and helpful  
✅ Works in both mock and real wallet modes  

