/**
 * Arc Testnet configuration and contract addresses
 * 
 * Arc Testnet documentation:
 * https://docs.arc.network/arc/tutorials/deploy-on-arc
 * 
 * This file is maintained for backward compatibility.
 * For multi-chain support, use lib/chainConfig.ts
 */

import { ARC_TESTNET, getCurrentChain, isChainConfigured } from "./chainConfig";

/**
 * Prediction Market contract address on Arc Testnet
 * Set via NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT environment variable
 * @deprecated Use chainConfig.getCurrentChain().predictionMarketAddress instead
 */
export const PREDICTION_MARKET_ADDRESS =
  process.env.NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT || "";

/**
 * USDC contract address on Arc Testnet
 * Re-exported for backward compatibility
 * @deprecated Use chainConfig.getCurrentChain().usdcAddress instead
 */
export const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_CONTRACT ||
  "0x3600000000000000000000000000000000000000";

/**
 * Arc Testnet network configuration
 * @deprecated Use chainConfig.ARC_TESTNET or chainConfig.getCurrentChain() instead
 */
export const ARC_NETWORK = ARC_TESTNET;

/**
 * Check if contract addresses are configured
 * @deprecated Use chainConfig.isChainConfigured(getCurrentChain()) instead
 */
export function isArcConfigured(): boolean {
  return isChainConfigured(getCurrentChain());
}

