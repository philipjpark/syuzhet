use ethers::{
    prelude::*,
    types::{Address, U256, TransactionRequest, Bytes, H256, Transaction, TransactionReceipt},
    middleware::SignerMiddleware,
    providers::{Http, Provider},
    signers::{LocalWallet, Signer},
};
use std::sync::Arc;
use anyhow::Result;
use std::str::FromStr;

pub struct WalletService {
    wallet: LocalWallet,
    provider: Arc<Provider<Http>>,
    usdc_contract: Address,
}

// Type alias for convenience
type WalletClient = SignerMiddleware<Provider<Http>, LocalWallet>;

impl WalletService {
    pub async fn new_with_usdc_contract(private_key: &str, rpc_url: &str, usdc_contract: Address) -> Result<Self> {
        // Parse private key
        let private_key = private_key.strip_prefix("0x").unwrap_or(private_key);
        let wallet = LocalWallet::from_str(private_key)
            .map_err(|e| anyhow::anyhow!("Failed to parse private key: {}", e))?;

        // Create provider (async)
        let provider = Provider::<Http>::try_from(rpc_url)
            .map_err(|e| anyhow!("Failed to create provider: {}", e))?;
        let provider = Arc::new(provider);

        Ok(WalletService {
            wallet,
            provider,
            usdc_contract,
        })
    }

    pub fn get_address(&self) -> Address {
        self.wallet.address()
    }

    pub async fn get_usdc_balance(&self) -> Result<u64> {
        // Create a simple contract call for balanceOf
        // USDC contract: balanceOf(address) returns (uint256)
        let address = self.get_address();
        
        // Create the function selector for balanceOf(address)
        // balanceOf(address) = 0x70a08231
        let function_selector = hex::decode("70a08231")?;
        
        // Encode the address parameter (pad to 32 bytes)
        let mut data = function_selector;
        let mut address_bytes = vec![0u8; 32];
        let address_slice = address.as_bytes();
        address_bytes[32 - address_slice.len()..].copy_from_slice(address_slice);
        data.extend_from_slice(&address_bytes);
        
        // Make the call using TransactionRequest
        let tx = TransactionRequest::new()
            .to(self.usdc_contract)
            .data(Bytes::from(data));
        
        let result = self.provider.call(tx, None).await?;
        
        // Decode the result (uint256)
        if result.len() >= 32 {
            let balance = U256::from_big_endian(&result[..32]);
            Ok(balance.as_u64())
        } else {
            Ok(0)
        }
    }

    pub fn get_wallet(&self) -> &LocalWallet {
        &self.wallet
    }

    pub fn get_provider(&self) -> Arc<Provider<Http>> {
        Arc::clone(&self.provider)
    }

    /// Send a raw transaction
    pub async fn send_transaction(&self, to: Address, data: Option<Bytes>, value: U256) -> Result<TransactionReceipt> {
        let tx = TransactionRequest::new()
            .to(to)
            .data(data.unwrap_or_default())
            .value(value);

        let client: WalletClient = SignerMiddleware::new(self.provider.as_ref().clone(), self.wallet.clone());
        let pending_tx = client.send_transaction(tx, None).await?;
        let receipt = pending_tx.await?.ok_or_else(|| anyhow::anyhow!("Transaction failed"))?;
        Ok(receipt)
    }

    /// Approve USDC spending
    pub async fn approve_usdc(&self, spender: Address, amount: U256) -> Result<TransactionReceipt> {
        // approve(address spender, uint256 amount) = 0x095ea7b3
        let function_selector = hex::decode("095ea7b3")?;
        
        // Encode spender address (32 bytes, right-aligned)
        let mut data = function_selector;
        let mut spender_bytes = vec![0u8; 32];
        let spender_slice = spender.as_bytes();
        spender_bytes[32 - spender_slice.len()..].copy_from_slice(spender_slice);
        data.extend_from_slice(&spender_bytes);
        
        // Encode amount (32 bytes)
        let mut amount_bytes = vec![0u8; 32];
        amount.to_big_endian(&mut amount_bytes);
        data.extend_from_slice(&amount_bytes);
        
        let tx = TransactionRequest::new()
            .to(self.usdc_contract)
            .data(Bytes::from(data));
        
        let client: WalletClient = SignerMiddleware::new(self.provider.as_ref().clone(), self.wallet.clone());
        let pending_tx = client.send_transaction(tx, None).await?;
        let receipt = pending_tx.await?.ok_or_else(|| anyhow::anyhow!("USDC approval failed"))?;
        Ok(receipt)
    }

    /// Transfer USDC
    pub async fn transfer_usdc(&self, to: Address, amount: U256) -> Result<TransactionReceipt> {
        // transfer(address to, uint256 amount) = 0xa9059cbb
        let function_selector = hex::decode("a9059cbb")?;
        
        // Encode recipient address (32 bytes, right-aligned)
        let mut data = function_selector;
        let mut to_bytes = vec![0u8; 32];
        let to_slice = to.as_bytes();
        to_bytes[32 - to_slice.len()..].copy_from_slice(to_slice);
        data.extend_from_slice(&to_bytes);
        
        // Encode amount (32 bytes)
        let mut amount_bytes = vec![0u8; 32];
        amount.to_big_endian(&mut amount_bytes);
        data.extend_from_slice(&amount_bytes);
        
        let tx = TransactionRequest::new()
            .to(self.usdc_contract)
            .data(Bytes::from(data));
        
        let client: WalletClient = SignerMiddleware::new(self.provider.as_ref().clone(), self.wallet.clone());
        let pending_tx = client.send_transaction(tx, None).await?;
        let receipt = pending_tx.await?.ok_or_else(|| anyhow::anyhow!("USDC transfer failed"))?;
        Ok(receipt)
    }

    /// Get transaction receipt by hash
    pub async fn get_transaction_receipt(&self, tx_hash: H256) -> Result<Option<TransactionReceipt>> {
        self.provider.get_transaction_receipt(tx_hash).await
            .map_err(|e| anyhow::anyhow!("Failed to get receipt: {}", e))
    }

    /// Get transaction by hash
    pub async fn get_transaction(&self, tx_hash: H256) -> Result<Option<Transaction>> {
        self.provider.get_transaction(tx_hash).await
            .map_err(|e| anyhow::anyhow!("Failed to get transaction: {}", e))
    }
}

