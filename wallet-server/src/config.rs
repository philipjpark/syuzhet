use std::env;

pub struct Config {
    pub private_key: String,
    pub rpc_url: String,
    pub usdc_contract: String,
    pub chain_id: u64,
    pub chain_name: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let private_key = env::var("PRIVATE_KEY")
            .map_err(|_| "PRIVATE_KEY environment variable not set")?;

        // Get default chain ID (1243 = Arc Testnet, 56 = BNB Chain, 97 = BNB Chain Testnet)
        let default_chain_id = env::var("DEFAULT_CHAIN_ID")
            .ok()
            .and_then(|s| s.parse::<u64>().ok())
            .unwrap_or(1243);

        // Get chain-specific configuration based on chain ID
        let (rpc_url, usdc_contract, chain_name) = match default_chain_id {
            1243 => (
                env::var("ARC_RPC_URL")
                    .unwrap_or_else(|_| "https://rpc-testnet.arc.network".to_string()),
                env::var("NEXT_PUBLIC_USDC_CONTRACT_ARC")
                    .or_else(|_| env::var("NEXT_PUBLIC_USDC_CONTRACT"))
                    .or_else(|_| env::var("USDC_CONTRACT"))
                    .unwrap_or_else(|_| "0x3600000000000000000000000000000000000000".to_string()),
                "Arc Testnet".to_string(),
            ),
            56 => (
                env::var("BNB_RPC_URL")
                    .unwrap_or_else(|_| "https://bsc-dataseed1.binance.org".to_string()),
                env::var("NEXT_PUBLIC_USDC_CONTRACT_BNB")
                    .unwrap_or_else(|_| "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d".to_string()),
                "BNB Chain".to_string(),
            ),
            97 => (
                env::var("BNB_TESTNET_RPC_URL")
                    .unwrap_or_else(|_| "https://data-seed-prebsc-1-s1.binance.org:8545".to_string()),
                env::var("NEXT_PUBLIC_USDC_CONTRACT_BNB_TESTNET")
                    .unwrap_or_else(|_| "0x64544969ed7EBf5f083679233325356EbE738930".to_string()),
                "BNB Chain Testnet".to_string(),
            ),
            _ => (
                env::var("ARC_RPC_URL")
                    .unwrap_or_else(|_| "https://rpc-testnet.arc.network".to_string()),
                env::var("NEXT_PUBLIC_USDC_CONTRACT")
                    .or_else(|_| env::var("USDC_CONTRACT"))
                    .unwrap_or_else(|_| "0x3600000000000000000000000000000000000000".to_string()),
                format!("Chain {}", default_chain_id),
            ),
        };

        Ok(Config {
            private_key,
            rpc_url,
            usdc_contract,
            chain_id: default_chain_id,
            chain_name,
        })
    }
}

