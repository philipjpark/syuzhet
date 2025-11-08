/**
 * USDC on Arc utilities
 * 
 * Arc Testnet USDC contract address:
 * https://docs.arc.network/arc/references/contract-addresses#usdc
 * 
 * Important: USDC on Arc uses 6 decimals (not 18 like ETH)
 */

/**
 * USDC contract address on Arc Testnet
 * Set via NEXT_PUBLIC_USDC_CONTRACT environment variable
 */
export const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_CONTRACT ||
  "0x3600000000000000000000000000000000000000"; // Placeholder - update with real address

/**
 * USDC decimals on Arc (always 6)
 * See: https://docs.arc.network/arc/references/contract-addresses#usdc
 */
export const USDC_DECIMALS = 6;

/**
 * Convert a human-readable USDC amount to on-chain units (6 decimals)
 * 
 * @example
 * toUsdcUnits(100.5) // returns "100500000" (100.5 * 10^6)
 */
export function toUsdcUnits(amount: number | string): bigint {
  const amountStr = typeof amount === "number" ? amount.toString() : amount;
  const [integer, decimal = ""] = amountStr.split(".");
  const decimalPadded = decimal.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  return BigInt(integer + decimalPadded);
}

/**
 * Convert on-chain USDC units (6 decimals) to human-readable amount
 * 
 * @example
 * fromUsdcUnits("100500000") // returns "100.5"
 */
export function fromUsdcUnits(units: bigint | string): string {
  const unitsStr = units.toString().padStart(USDC_DECIMALS + 1, "0");
  const integer = unitsStr.slice(0, -USDC_DECIMALS) || "0";
  const decimal = unitsStr.slice(-USDC_DECIMALS);
  const decimalTrimmed = decimal.replace(/\.?0+$/, "");
  return decimalTrimmed ? `${integer}.${decimalTrimmed}` : integer;
}

/**
 * Format USDC amount for display
 * 
 * @example
 * formatUsdc("100500000") // returns "$100.50"
 */
export function formatUsdc(units: bigint | string): string {
  const amount = fromUsdcUnits(units);
  return `$${parseFloat(amount).toFixed(2)}`;
}

