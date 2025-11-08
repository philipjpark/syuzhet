/**
 * Wallet provider types for Syuzhet
 * 
 * Supports multiple account abstraction providers:
 * - Dynamic Labs: Current implementation
 * - Circle Wallets: Scaffolded for future integration
 */

export type WalletProvider = "dynamic" | "circle";

/**
 * Wallet configuration
 */
export interface WalletConfig {
  provider: WalletProvider;
  // Add other config as needed
}

/**
 * Get the active wallet provider from environment or default
 */
export function getWalletProvider(): WalletProvider {
  // TODO: Read from environment variable or user preference
  // For now, default to Dynamic Labs
  const provider = process.env.NEXT_PUBLIC_WALLET_PROVIDER as WalletProvider;
  return provider === "circle" ? "circle" : "dynamic";
}

