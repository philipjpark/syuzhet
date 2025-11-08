# Build Instructions - Fix Download Issues

## If you get "failed to download base64ct" error:

### Option 1: Clean and Retry (Most Common Fix)
```bash
cd wallet-server
cargo clean
Remove-Item Cargo.lock -ErrorAction SilentlyContinue
cargo build
```

### Option 2: Update Cargo
```bash
rustup update stable
cargo --version  # Should be 1.84.0 or newer
```

### Option 3: Use Git Dependency (Bypass crates.io)
If crates.io is having issues, we can use ethers from GitHub:

Edit `Cargo.toml`:
```toml
ethers = { git = "https://github.com/gakonst/ethers-rs", tag = "v1.0.0", features = ["legacy"] }
```

### Option 4: Use Alloy Instead (Modern Alternative)
If ethers continues to cause issues, I can rewrite the wallet server to use `alloy` which is:
- More modern
- Better maintained  
- Fewer dependency issues
- Better performance

Just let me know and I'll convert it!

## Current Status

The code is set up for `ethers = "1.0"`. If you continue to have download issues, try:

1. **Check internet connection**: Make sure you can access crates.io
2. **Try different network**: Sometimes corporate firewalls block crates.io
3. **Use VPN**: If you're behind a restrictive firewall
4. **Wait and retry**: Sometimes crates.io has temporary issues

## Quick Test

```bash
# Test if you can reach crates.io
curl https://crates.io

# Or in PowerShell:
Invoke-WebRequest https://crates.io
```

If that works, try building again:
```bash
cd wallet-server
cargo build
```

