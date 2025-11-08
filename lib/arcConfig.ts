/**
 * Arc Testnet configuration and contract addresses
 * 
 * Arc Testnet documentation:
 * https://docs.arc.network/arc/tutorials/deploy-on-arc
 */

import { USDC_ADDRESS } from "./usdc";

/**
 * Prediction Market contract address on Arc Testnet
 * Set via NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT environment variable
 */
export const PREDICTION_MARKET_ADDRESS =
  process.env.NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT || "";

/**
 * USDC contract address on Arc Testnet
 * Re-exported from lib/usdc.ts for convenience
 */
export { USDC_ADDRESS };

/**
 * Arc Testnet network configuration
 */
export const ARC_NETWORK = {
  chainId: 1243,
  name: "Arc Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc-testnet.arc.network",
  explorer: "https://testnet-explorer.arc.network",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },
};

/**
 * Check if contract addresses are configured
 */
export function isArcConfigured(): boolean {
  return !!(
    PREDICTION_MARKET_ADDRESS &&
    USDC_ADDRESS &&
    USDC_ADDRESS !== "0x3600000000000000000000000000000000000000"
  );
}

