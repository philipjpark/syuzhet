use std::env;

pub struct Config {
    pub private_key: String,
    pub rpc_url: String,
    pub usdc_contract: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let private_key = env::var("PRIVATE_KEY")
            .map_err(|_| "PRIVATE_KEY environment variable not set")?;

        let rpc_url = env::var("ARC_RPC_URL")
            .unwrap_or_else(|_| "https://rpc-testnet.arc.network".to_string());

        let usdc_contract = env::var("NEXT_PUBLIC_USDC_CONTRACT")
            .or_else(|_| env::var("USDC_CONTRACT"))
            .unwrap_or_else(|_| "0x0aaa246300e261c6801b8c62397090deb47310ba".to_string());

        Ok(Config {
            private_key,
            rpc_url,
            usdc_contract,
        })
    }
}

