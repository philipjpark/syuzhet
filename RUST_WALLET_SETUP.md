# Rust Wallet Server Setup Guide

## Quick Start

1. **Install Rust** (if not already installed):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Navigate to wallet-server**:
   ```bash
   cd wallet-server
   ```

3. **Create `.env` file** (already created with your wallet info):
   ```bash
   # File is already created at wallet-server/.env
   ```

4. **Build and run**:
   ```bash
   cargo build --release
   cargo run --release
   ```

   Or for development:
   ```bash
   cargo run
   ```

## Your Wallet Configuration

The wallet server is pre-configured with:
- **Private Key**: `d704a381d03a2673527d57fc2894128c5fb6dd2264f01339d17883f7fa19b6d4`
- **Address**: `0x0aaa246300e261c6801b8c62397090deb47310ba`
- **Network**: Arc Testnet
- **Balance**: 20 USDC (testnet)

## API Endpoints

Once running on `http://localhost:8080`:

### Health Check
```bash
curl http://localhost:8080/health
```

### Get Wallet Info
```bash
curl http://localhost:8080/wallet/info
```

### Get USDC Balance
```bash
curl http://localhost:8080/wallet/balance
```

## Integration with Next.js

Update your Next.js API route to use the Rust server:

**`app/api/wallet/connect/route.ts`**:
```typescript
const RUST_SERVER = process.env.RUST_WALLET_SERVER_URL || 'http://localhost:8080';

export async function GET() {
  const response = await fetch(`${RUST_SERVER}/wallet/info`);
  const data = await response.json();
  return NextResponse.json(data);
}
```

Add to `.env`:
```env
RUST_WALLET_SERVER_URL=http://localhost:8080
```

## Performance Benefits

- **Low latency**: Sub-millisecond response times
- **High throughput**: Thousands of requests per second
- **Memory efficient**: No garbage collection overhead
- **Type safe**: Compile-time guarantees

## Next Steps

1. Run the Rust server: `cd wallet-server && cargo run`
2. Update Next.js to use Rust server endpoints
3. Test wallet connection
4. Deploy Rust server (can run alongside Next.js or separately)

