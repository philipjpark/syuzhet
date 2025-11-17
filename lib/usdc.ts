/**
 * USDC utilities for multi-chain support
 * 
 * Arc Testnet: 6 decimals
 * BNB Chain: 18 decimals
 * 
 * Arc Testnet USDC: https://docs.arc.network/arc/references/contract-addresses#usdc
 * BNB Chain USDC: https://bscscan.com/token/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
 */

import { getChainConfig, getCurrentChain, type ChainId } from './chainConfig';

/**
 * USDC contract address on Arc Testnet (backward compatibility)
 * Set via NEXT_PUBLIC_USDC_CONTRACT environment variable
 */
export const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_CONTRACT ||
  "0x3600000000000000000000000000000000000000"; // Placeholder

/**
 * USDC decimals on Arc (always 6) - backward compatibility
 * See: https://docs.arc.network/arc/references/contract-addresses#usdc
 */
export const USDC_DECIMALS = 6;

/**
 * Get USDC decimals for a specific chain
 */
export function getUsdcDecimals(chainId?: ChainId | number): number {
  if (chainId) {
    const chain = getChainConfig(chainId);
    if (chain) return chain.usdcDecimals;
  }
  const currentChain = getCurrentChain();
  return currentChain.usdcDecimals;
}

/**
 * Convert a human-readable USDC amount to on-chain units
 * 
 * @param amount - Human-readable amount (e.g., 100.5)
 * @param chainId - Optional chain ID (defaults to current chain)
 * @example
 * toUsdcUnits(100.5, 1243) // returns "100500000" (100.5 * 10^6) for Arc
 * toUsdcUnits(100.5, 56) // returns "100500000000000000000" (100.5 * 10^18) for BNB
 */
export function toUsdcUnits(amount: number | string, chainId?: ChainId | number): bigint {
  const decimals = getUsdcDecimals(chainId);
  const amountStr = typeof amount === "number" ? amount.toString() : amount;
  const [integer, decimal = ""] = amountStr.split(".");
  const decimalPadded = decimal.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(integer + decimalPadded);
}

/**
 * Convert on-chain USDC units to human-readable amount
 * 
 * @param units - On-chain units (e.g., "100500000")
 * @param chainId - Optional chain ID (defaults to current chain)
 * @example
 * fromUsdcUnits("100500000", 1243) // returns "100.5" for Arc
 * fromUsdcUnits("100500000000000000000", 56) // returns "100.5" for BNB
 */
export function fromUsdcUnits(units: bigint | string, chainId?: ChainId | number): string {
  const decimals = getUsdcDecimals(chainId);
  const unitsStr = units.toString().padStart(decimals + 1, "0");
  const integer = unitsStr.slice(0, -decimals) || "0";
  const decimal = unitsStr.slice(-decimals);
  const decimalTrimmed = decimal.replace(/\.?0+$/, "");
  return decimalTrimmed ? `${integer}.${decimalTrimmed}` : integer;
}

/**
 * Format USDC amount for display
 * 
 * @param units - On-chain units
 * @param chainId - Optional chain ID (defaults to current chain)
 * @example
 * formatUsdc("100500000", 1243) // returns "$100.50" for Arc
 */
export function formatUsdc(units: bigint | string, chainId?: ChainId | number): string {
  const amount = fromUsdcUnits(units, chainId);
  return `$${parseFloat(amount).toFixed(2)}`;
}

