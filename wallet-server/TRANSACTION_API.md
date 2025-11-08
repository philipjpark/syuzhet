# Transaction API Documentation

## Endpoints

### 1. Approve USDC Spending

**POST** `/wallet/approve`

Approve a spender to use your USDC.

**Request Body**:
```json
{
  "spender": "0x1234567890123456789012345678901234567890",
  "amount": "1000000000"  // Amount in USDC units (6 decimals), e.g., 1000 USDC = 1000000000
}
```

**Response**:
```json
{
  "success": true,
  "tx_hash": "0x...",
  "explorer_url": "https://testnet-explorer.arc.network/tx/0x..."
}
```

**Example**:
```bash
curl -X POST http://localhost:8080/wallet/approve \
  -H "Content-Type: application/json" \
  -d '{
    "spender": "0x1234567890123456789012345678901234567890",
    "amount": "1000000000"
  }'
```

### 2. Transfer USDC

**POST** `/wallet/transfer`

Transfer USDC to another address.

**Request Body**:
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "20000000"  // 20 USDC in 6-decimal units
}
```

**Response**:
```json
{
  "success": true,
  "tx_hash": "0x...",
  "explorer_url": "https://testnet-explorer.arc.network/tx/0x..."
}
```

**Example**:
```bash
curl -X POST http://localhost:8080/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "20000000"
  }'
```

### 3. Send Raw Transaction

**POST** `/wallet/transaction`

Send a raw transaction to any contract or address.

**Request Body**:
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "data": "0x...",  // Optional: Hex-encoded function call data
  "value": "0"  // Optional: Value to send (in wei/USDC units)
}
```

**Response**:
```json
{
  "success": true,
  "tx_hash": "0x...",
  "explorer_url": "https://testnet-explorer.arc.network/tx/0x..."
}
```

**Example** (Call a contract function):
```bash
curl -X POST http://localhost:8080/wallet/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x1234567890123456789012345678901234567890",
    "data": "0x70a082310000000000000000000000000aaa246300e261c6801b8c62397090deb47310ba",
    "value": "0"
  }'
```

### 4. Get Transaction Receipt

**GET** `/wallet/receipt/:hash`

Get the receipt for a transaction by hash.

**Response**:
```json
{
  "success": true,
  "receipt": {
    "transaction_hash": "0x...",
    "block_number": 12345,
    "block_hash": "0x...",
    "transaction_index": 0,
    "from": "0x0aaa246300e261c6801b8c62397090deb47310ba",
    "to": "0x...",
    "gas_used": 21000,
    "effective_gas_price": 1000000,
    "status": 1,
    "logs": 2
  }
}
```

**Example**:
```bash
curl http://localhost:8080/wallet/receipt/0x1234567890123456789012345678901234567890123456789012345678901234
```

## USDC Amount Conversion

USDC on Arc uses **6 decimals** (not 18 like ETH).

- **1 USDC** = `1000000` (1,000,000 units)
- **20 USDC** = `20000000` (20,000,000 units)
- **100.5 USDC** = `100500000` (100,500,000 units)

### Conversion Formula

```rust
// Human-readable to units
units = amount * 10^6

// Units to human-readable
amount = units / 10^6
```

## Integration with Next.js

### Example: Approve USDC for Market Creation

```typescript
// app/api/wallet/approve/route.ts
export async function POST(request: Request) {
  const { spender, amount } = await request.json();
  
  const response = await fetch('http://localhost:8080/wallet/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      spender,
      amount: (parseFloat(amount) * 1_000_000).toString(), // Convert to 6-decimal units
    }),
  });
  
  return NextResponse.json(await response.json());
}
```

### Example: Transfer USDC

```typescript
// app/api/wallet/transfer/route.ts
export async function POST(request: Request) {
  const { to, amount } = await request.json();
  
  const response = await fetch('http://localhost:8080/wallet/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      amount: (parseFloat(amount) * 1_000_000).toString(), // Convert to 6-decimal units
    }),
  });
  
  return NextResponse.json(await response.json());
}
```

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

Common errors:
- `400 Bad Request`: Invalid address, amount, or data format
- `500 Internal Server Error`: Transaction failed, network error, etc.

## Security Notes

⚠️ **Important**:
- All transactions are signed with the server's private key
- Never expose the private key
- Use HTTPS in production
- Implement rate limiting
- Add authentication/authorization for production use

## Transaction Status

After sending a transaction:
1. You'll receive a `tx_hash` immediately
2. Use `/wallet/receipt/:hash` to check confirmation status
3. Check `status` field: `1` = success, `0` = failed
4. View on Arc Explorer using the `explorer_url`

## Gas Fees

On Arc Testnet:
- Gas is paid in USDC (not ETH)
- Gas prices are typically very low
- Transactions are usually confirmed quickly

## Next Steps

1. **Test Approve**: Approve USDC for your PredictionMarket contract
2. **Test Transfer**: Send USDC to another address
3. **Create Market**: Use raw transaction to call `createMarket` on your contract
4. **Monitor**: Use receipt endpoint to track transaction status

