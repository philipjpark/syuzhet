/**
 * Multi-chain configuration for Syuzhet
 * 
 * Supports:
 * - Arc Testnet (6 decimals USDC)
 * - BNB Chain Mainnet (18 decimals USDC)
 * - BNB Chain Testnet (18 decimals USDC)
 */

export type ChainId = 1243 | 56 | 97;

export interface ChainConfig {
  chainId: ChainId;
  name: string;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  usdcDecimals: number; // USDC decimals on this chain
  usdcAddress?: string; // USDC contract address (set via env)
  predictionMarketAddress?: string; // Prediction Market contract (set via env)
}

/**
 * Arc Testnet configuration
 */
export const ARC_TESTNET: ChainConfig = {
  chainId: 1243,
  name: "Arc Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc-testnet.arc.network",
  explorer: "https://testnet-explorer.arc.network",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },
  usdcDecimals: 6,
  usdcAddress: process.env.NEXT_PUBLIC_USDC_CONTRACT_ARC || process.env.NEXT_PUBLIC_USDC_CONTRACT || "0x3600000000000000000000000000000000000000",
  predictionMarketAddress: process.env.NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_ARC || process.env.NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT || "",
};

/**
 * BNB Chain Mainnet configuration
 */
export const BNB_MAINNET: ChainConfig = {
  chainId: 56,
  name: "BNB Chain",
  rpcUrl: process.env.NEXT_PUBLIC_BNB_RPC_URL || "https://bsc-dataseed1.binance.org",
  explorer: "https://bscscan.com",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  usdcDecimals: 18,
  usdcAddress: process.env.NEXT_PUBLIC_USDC_CONTRACT_BNB || "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // Official BNB Chain USDC
  predictionMarketAddress: process.env.NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_BNB || "",
};

/**
 * BNB Chain Testnet configuration
 */
export const BNB_TESTNET: ChainConfig = {
  chainId: 97,
  name: "BNB Chain Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_BNB_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
  explorer: "https://testnet.bscscan.com",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  usdcDecimals: 18,
  usdcAddress: process.env.NEXT_PUBLIC_USDC_CONTRACT_BNB_TESTNET || "0x64544969ed7EBf5f083679233325356EbE738930", // BNB Testnet USDC
  predictionMarketAddress: process.env.NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT_BNB_TESTNET || "",
};

/**
 * All supported chains
 */
export const SUPPORTED_CHAINS: Record<ChainId, ChainConfig> = {
  1243: ARC_TESTNET,
  56: BNB_MAINNET,
  97: BNB_TESTNET,
};

/**
 * Get chain configuration by chain ID
 */
export function getChainConfig(chainId: ChainId | number): ChainConfig | null {
  return SUPPORTED_CHAINS[chainId as ChainId] || null;
}

/**
 * Get default chain (BNB Chain Testnet is now default, can be overridden via env)
 */
export function getDefaultChain(): ChainConfig {
  // Check localStorage for user-selected chain (client-side only)
  if (typeof window !== 'undefined') {
    const savedChainId = localStorage.getItem('syuzhet_selected_chain');
    if (savedChainId) {
      const chainId = parseInt(savedChainId) as ChainId;
      const chain = getChainConfig(chainId);
      if (chain) return chain;
    }
  }
  
  // Check environment variable
  const defaultChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
  if (defaultChainId) {
    const chain = getChainConfig(parseInt(defaultChainId));
    if (chain) return chain;
  }
  
  // Default to BNB Chain Testnet (featured prominently)
  return BNB_TESTNET;
}

/**
 * Get current chain from environment, localStorage, or default
 */
export function getCurrentChain(): ChainConfig {
  return getDefaultChain();
}

/**
 * Check if chain is configured (has contract addresses)
 */
export function isChainConfigured(chain: ChainConfig): boolean {
  return !!(
    chain.predictionMarketAddress &&
    chain.usdcAddress &&
    chain.usdcAddress !== "0x3600000000000000000000000000000000000000"
  );
}

/**
 * Get chain name by chain ID
 */
export function getChainName(chainId: ChainId | number): string {
  const chain = getChainConfig(chainId);
  return chain?.name || `Chain ${chainId}`;
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerTxUrl(chainId: ChainId | number, txHash: string): string {
  const chain = getChainConfig(chainId);
  if (!chain) return `#`;
  return `${chain.explorer}/tx/${txHash}`;
}

/**
 * Get explorer URL for an address
 */
export function getExplorerAddressUrl(chainId: ChainId | number, address: string): string {
  const chain = getChainConfig(chainId);
  if (!chain) return `#`;
  return `${chain.explorer}/address/${address}`;
}

// Export for backward compatibility
export const ARC_NETWORK = ARC_TESTNET;
export const PREDICTION_MARKET_ADDRESS = ARC_TESTNET.predictionMarketAddress || "";
export const USDC_ADDRESS = ARC_TESTNET.usdcAddress || "";

