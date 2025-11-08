# Syuzhet Wallet Server (Rust)

A high-performance Rust-based wallet server for managing Arc Testnet wallet operations.

## Features

- **Wallet Management**: Secure server-side wallet handling
- **USDC Balance**: Query USDC balance on Arc Testnet
- **REST API**: Simple HTTP endpoints for wallet operations
- **CORS Enabled**: Ready for frontend integration

## Wallet Information

- **Address**: `0x0aaa246300e261c6801b8c62397090deb47310ba`
- **Network**: Arc Testnet (Chain ID: 1243)
- **Balance**: 20 USDC (testnet tokens)

## Setup

### Prerequisites

- Rust 1.70+ (install from [rustup.rs](https://rustup.rs/))
- Cargo (comes with Rust)

### Installation

1. **Navigate to wallet-server directory**:
   ```bash
   cd wallet-server
   ```

2. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your configuration**:
   ```env
   PRIVATE_KEY=d704a381d03a2673527d57fc2894128c5fb6dd2264f01339d17883f7fa19b6d4
   ARC_RPC_URL=https://rpc-testnet.arc.network
   USDC_CONTRACT=0x0aaa246300e261c6801b8c62397090deb47310ba
   ```

4. **Build the project**:
   ```bash
   cargo build --release
   ```

5. **Run the server**:
   ```bash
   cargo run --release
   ```

   Or for development:
   ```bash
   cargo run
   ```

## API Endpoints

### Health Check
```
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "service": "syuzhet-wallet-server"
}
```

### Get Wallet Info
```
GET /wallet/info
```

**Response**:
```json
{
  "address": "0x0aaa246300e261c6801b8c62397090deb47310ba",
  "network": "Arc Testnet",
  "chain_id": 1243
}
```

### Get USDC Balance
```
GET /wallet/balance
```

**Response**:
```json
{
  "address": "0x0aaa246300e261c6801b8c62397090deb47310ba",
  "balance_usdc": "20000000",
  "balance_formatted": "20.0"
}
```

## Integration with Next.js

Update your Next.js app to use the Rust wallet server:

1. **Update `app/api/wallet/connect/route.ts`** to proxy to Rust server:
   ```typescript
   const RUST_WALLET_SERVER = process.env.RUST_WALLET_SERVER_URL || 'http://localhost:8080';
   
   export async function GET() {
     const response = await fetch(`${RUST_WALLET_SERVER}/wallet/info`);
     return NextResponse.json(await response.json());
   }
   ```

2. **Add to `.env`**:
   ```env
   RUST_WALLET_SERVER_URL=http://localhost:8080
   ```

## Development

### Run with hot reload (requires `cargo-watch`):
```bash
cargo install cargo-watch
cargo watch -x run
```

### Run tests:
```bash
cargo test
```

### Build for production:
```bash
cargo build --release
```

The binary will be at `target/release/syuzhet-wallet-server`

## Security Notes

⚠️ **Important**:
- Never commit `.env` file with private keys
- Keep `PRIVATE_KEY` secure and server-side only
- Use environment variables for all sensitive data
- In production, use proper secret management (AWS Secrets Manager, etc.)

## Architecture

```
wallet-server/
├── src/
│   ├── main.rs          # HTTP server and routes
│   ├── wallet.rs        # Wallet service implementation
│   └── config.rs        # Configuration management
├── Cargo.toml           # Dependencies
├── .env                 # Environment variables (not committed)
└── README.md            # This file
```

## Dependencies

- **axum**: Modern async web framework
- **ethers**: Ethereum/Arc blockchain interaction
- **tokio**: Async runtime
- **serde**: Serialization/deserialization
- **tower-http**: HTTP middleware (CORS)

## Performance

Rust provides:
- **Low latency**: Sub-millisecond response times
- **High throughput**: Can handle thousands of requests per second
- **Memory safety**: No garbage collection overhead
- **Type safety**: Compile-time guarantees

## Next Steps

1. Add transaction signing endpoints
2. Add USDC transfer functionality
3. Add market creation helpers
4. Add rate limiting
5. Add authentication/authorization
6. Add logging and metrics

## Troubleshooting

### "Failed to initialize wallet service"
- Check that `PRIVATE_KEY` is set in `.env`
- Verify private key format (with or without `0x` prefix)

### "Failed to get balance"
- Verify `USDC_CONTRACT` address is correct
- Check Arc Testnet RPC is accessible
- Ensure wallet has USDC balance

### CORS errors
- CORS is enabled for all origins in development
- Adjust CORS settings in `main.rs` for production

## License

Same as main Syuzhet project.

