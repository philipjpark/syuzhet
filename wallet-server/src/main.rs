use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};
use ethers::types::{H256, U256};

mod wallet;
mod config;

use wallet::WalletService;
use config::Config;

#[derive(Serialize)]
struct WalletInfo {
    address: String,
    network: String,
    chain_id: u64,
}

#[derive(Serialize)]
struct BalanceInfo {
    address: String,
    balance_usdc: String,
    balance_formatted: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[derive(Clone)]
struct AppState {
    wallet_service: Arc<WalletService>,
    config: Config,
}

#[tokio::main]
async fn main() {
    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    // Load configuration
    dotenv::dotenv().ok();
    let config = Config::from_env().expect("Failed to load configuration");

    // Parse USDC contract address
    let usdc_contract = config.usdc_contract
        .parse::<ethers::types::Address>()
        .expect("Invalid USDC contract address");

    // Initialize wallet service
    let wallet_service = Arc::new(
        WalletService::new_with_usdc_contract(&config.private_key, &config.rpc_url, usdc_contract)
            .await
            .expect("Failed to initialize wallet service")
    );

    let app_state = AppState {
        wallet_service,
        config,
    };

    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/wallet/info", get(get_wallet_info))
        .route("/wallet/balance", get(get_wallet_balance))
        .route("/wallet/approve", axum::routing::post(approve_usdc))
        .route("/wallet/transfer", axum::routing::post(transfer_usdc))
        .route("/wallet/transaction", axum::routing::post(send_transaction))
        .route("/wallet/receipt/:hash", get(get_transaction_receipt))
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .with_state(app_state);

    let addr = "0.0.0.0:8080";
    log::info!("Wallet server starting on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Server failed to start");
}

async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "service": "syuzhet-wallet-server"
    }))
}

async fn get_wallet_info(
    State(state): State<AppState>,
) -> Result<Json<WalletInfo>, (StatusCode, Json<ErrorResponse>)> {
    let address = state.wallet_service.get_address();
    
    Ok(Json(WalletInfo {
        address: format!("{:?}", address),
        network: "Arc Testnet".to_string(),
        chain_id: 1243,
    }))
}

async fn get_wallet_balance(
    State(state): State<AppState>,
) -> Result<Json<BalanceInfo>, (StatusCode, Json<ErrorResponse>)> {
    match state.wallet_service.get_usdc_balance().await {
        Ok(balance) => {
            let balance_formatted = format_usdc_balance(balance);
            Ok(Json(BalanceInfo {
                address: format!("{:?}", state.wallet_service.get_address()),
                balance_usdc: balance.to_string(),
                balance_formatted,
            }))
        }
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to get balance: {}", e),
            }),
        )),
    }
}

fn format_usdc_balance(balance: u64) -> String {
    // USDC has 6 decimals
    let integer = balance / 1_000_000;
    let decimal = balance % 1_000_000;
    format!("{}.{:06}", integer, decimal).trim_end_matches('0').trim_end_matches('.').to_string()
}

#[derive(Deserialize)]
struct ApproveRequest {
    spender: String,
    amount: String, // Amount in USDC units (6 decimals)
}

#[derive(Serialize)]
struct ApproveResponse {
    success: bool,
    tx_hash: String,
    explorer_url: String,
}

#[derive(Deserialize)]
struct TransferRequest {
    to: String,
    amount: String, // Amount in USDC units (6 decimals)
}

#[derive(Serialize)]
struct TransferResponse {
    success: bool,
    tx_hash: String,
    explorer_url: String,
}

#[derive(Deserialize)]
struct TransactionRequest {
    to: String,
    data: Option<String>, // Hex-encoded data
    value: Option<String>, // Value in wei (or USDC units for Arc)
}

#[derive(Serialize)]
struct TransactionResponse {
    success: bool,
    tx_hash: String,
    explorer_url: String,
}

#[derive(Serialize)]
struct ReceiptResponse {
    success: bool,
    receipt: Option<serde_json::Value>,
}

async fn approve_usdc(
    State(state): State<AppState>,
    Json(payload): Json<ApproveRequest>,
) -> Result<Json<ApproveResponse>, (StatusCode, Json<ErrorResponse>)> {
    let spender = payload.spender
        .parse::<ethers::types::Address>()
        .map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid spender address: {}", e),
                }),
            )
        })?;

    let amount = U256::from_dec_str(&payload.amount)
        .map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid amount: {}", e),
                }),
            )
        })?;

    match state.wallet_service.approve_usdc(spender, amount).await {
        Ok(receipt) => {
            let tx_hash = receipt.transaction_hash;
            Ok(Json(ApproveResponse {
                success: true,
                tx_hash: format!("{:?}", tx_hash),
                explorer_url: format!("https://testnet-explorer.arc.network/tx/{:?}", tx_hash),
            }))
        }
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to approve USDC: {}", e),
            }),
        )),
    }
}

async fn transfer_usdc(
    State(state): State<AppState>,
    Json(payload): Json<TransferRequest>,
) -> Result<Json<TransferResponse>, (StatusCode, Json<ErrorResponse>)> {
    let to = payload.to
        .parse::<ethers::types::Address>()
        .map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid recipient address: {}", e),
                }),
            )
        })?;

    let amount = U256::from_dec_str(&payload.amount)
        .map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid amount: {}", e),
                }),
            )
        })?;

    match state.wallet_service.transfer_usdc(to, amount).await {
        Ok(receipt) => {
            let tx_hash = receipt.transaction_hash;
            Ok(Json(TransferResponse {
                success: true,
                tx_hash: format!("{:?}", tx_hash),
                explorer_url: format!("https://testnet-explorer.arc.network/tx/{:?}", tx_hash),
            }))
        }
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to transfer USDC: {}", e),
            }),
        )),
    }
}

async fn send_transaction(
    State(state): State<AppState>,
    Json(payload): Json<TransactionRequest>,
) -> Result<Json<TransactionResponse>, (StatusCode, Json<ErrorResponse>)> {
    let to = payload.to
        .parse::<ethers::types::Address>()
        .map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid recipient address: {}", e),
                }),
            )
        })?;

    let data = payload.data
        .map(|d| {
            hex::decode(d.strip_prefix("0x").unwrap_or(&d))
                .map(Bytes::from)
                .map_err(|e| anyhow::anyhow!("Invalid hex data: {}", e))
        })
        .transpose()
        .map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid data: {}", e),
                }),
            )
        })?;

    let value = payload.value
        .map(|v| {
            U256::from_dec_str(&v)
                .or_else(|_| U256::from_str_radix(&v.strip_prefix("0x").unwrap_or(&v), 16))
                .map_err(|e| anyhow::anyhow!("Invalid value: {}", e))
        })
        .transpose()
        .map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid value: {}", e),
                }),
            )
        })?
        .unwrap_or(U256::zero());

    match state.wallet_service.send_transaction(to, data, value).await {
        Ok(receipt) => {
            let tx_hash = receipt.transaction_hash;
            Ok(Json(TransactionResponse {
                success: true,
                tx_hash: format!("{:?}", tx_hash),
                explorer_url: format!("https://testnet-explorer.arc.network/tx/{:?}", tx_hash),
            }))
        }
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to send transaction: {}", e),
            }),
        )),
    }
}

async fn get_transaction_receipt(
    State(state): State<AppState>,
    axum::extract::Path(tx_hash): axum::extract::Path<String>,
) -> Result<Json<ReceiptResponse>, (StatusCode, Json<ErrorResponse>)> {
    let hash = tx_hash
        .strip_prefix("0x")
        .unwrap_or(&tx_hash)
        .parse::<H256>()
        .map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid transaction hash: {}", e),
                }),
            )
        })?;

    match state.wallet_service.get_transaction_receipt(hash).await {
        Ok(Some(receipt)) => {
            // Serialize receipt to JSON
            let receipt_json = serde_json::json!({
                "transaction_hash": format!("{:?}", receipt.transaction_hash),
                "block_number": receipt.block_number.map(|n| n.as_u64()),
                "block_hash": receipt.block_hash.map(|h| format!("{:?}", h)),
                "transaction_index": receipt.transaction_index.map(|i| i.as_u64()),
                "from": format!("{:?}", receipt.from),
                "to": receipt.to.map(|a| format!("{:?}", a)),
                "gas_used": receipt.gas_used.map(|g| g.as_u64()),
                "effective_gas_price": receipt.effective_gas_price.map(|p| p.as_u64()),
                "status": receipt.status.map(|s| s.as_u64()),
                "logs": receipt.logs.len(),
            });
            
            Ok(Json(ReceiptResponse {
                success: true,
                receipt: Some(receipt_json),
            }))
        }
        Ok(None) => Ok(Json(ReceiptResponse {
            success: true,
            receipt: None,
        })),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to get receipt: {}", e),
            }),
        )),
    }
}

