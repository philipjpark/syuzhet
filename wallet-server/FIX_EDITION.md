# Fix for Edition 2024 Error

## Problem
The error "feature 'edition 2024 is required'" occurs because:
- Rust edition 2024 doesn't exist yet (only 2015, 2018, 2021)
- Some dependency might be requiring a non-existent edition

## Solution Applied

1. **Changed ethers version**: From `2.0` to `1.0` for better compatibility
2. **Updated code**: Adjusted for ethers 1.x API differences
3. **Added SignerMiddleware**: Required for sending transactions in ethers 1.x

## Changes Made

### Cargo.toml
- Changed `ethers = "2.0"` to `ethers = "1.0"`
- Removed separate ethers sub-crates (they're included in ethers 1.0)

### wallet.rs
- Updated to use `SignerMiddleware` for transactions
- Changed async initialization pattern
- Updated transaction sending code

## Try Building Again

```bash
cd wallet-server
cargo clean
cargo build
```

If you still get errors, try:

```bash
# Update Rust toolchain
rustup update stable

# Clean and rebuild
cargo clean
cargo build
```

## Alternative: Use Alloy Instead of Ethers

If ethers continues to cause issues, we can switch to `alloy` which is more modern:

```toml
alloy = { version = "0.3", features = ["full"] }
```

Let me know if you want me to convert to Alloy instead!

