/**
 * Contract Helpers for Syuzhet
 * 
 * Provides typed contract interfaces for PredictionMarket and USDC on Arc Testnet
 * 
 * Note: ethers is imported dynamically to avoid Next.js bundling issues
 */

import { PREDICTION_MARKET_ADDRESS, USDC_ADDRESS } from './arcConfig';

// Type imports (these don't cause bundling issues)
type SignerOrProvider = any; // Will be ethers.Signer | ethers.Provider
type Contract = any; // Will be ethers.Contract

// PredictionMarket ABI (minimal for now)
const PREDICTION_MARKET_ABI = [
  'function createMarket(string memory _title, string memory _thesis, uint256 _expiry, uint256 _initialLiquidityUsdc) external',
  'function recordNarrativeUpdate(uint256 _marketId, string memory _updateUri, uint256 _newSuggestedProbability) external',
  'function getMarket(uint256 _marketId) external view returns (tuple(string title, string thesis, uint256 expiry, address creator, bool resolved, bool outcome, uint256 totalYesShares, uint256 totalNoShares, uint256 liquidityUsdc))',
  'function markets(uint256) external view returns (string memory title, string memory thesis, uint256 expiry, address creator, bool resolved, bool outcome, uint256 totalYesShares, uint256 totalNoShares, uint256 liquidityUsdc)',
  'function nextMarketId() external view returns (uint256)',
  'event MarketCreated(uint256 indexed marketId, string title, string thesis, uint256 expiry, address creator, uint256 initialLiquidityUsdc)',
  'event MarketUpdated(uint256 indexed marketId, string updateUri, uint256 newSuggestedProbability)',
];

// USDC (ERC-20) ABI
const USDC_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function decimals() external view returns (uint8)',
];

/**
 * Get PredictionMarket contract instance
 * @param signerOrProvider ethers Signer or Provider
 * @returns Contract instance
 */
export async function getPredictionMarketContract(
  signerOrProvider: SignerOrProvider
): Promise<Contract> {
  if (!PREDICTION_MARKET_ADDRESS) {
    throw new Error('NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT not set in environment variables');
  }

  // Dynamic import to avoid bundling issues
  const { ethers } = await import('ethers');
  
  return new ethers.Contract(
    PREDICTION_MARKET_ADDRESS,
    PREDICTION_MARKET_ABI,
    signerOrProvider
  );
}

/**
 * Get USDC contract instance
 * @param signerOrProvider ethers Signer or Provider
 * @returns Contract instance
 */
export async function getUsdcContract(
  signerOrProvider: SignerOrProvider
): Promise<Contract> {
  if (!USDC_ADDRESS) {
    throw new Error('NEXT_PUBLIC_USDC_CONTRACT not set in environment variables');
  }

  // Dynamic import to avoid bundling issues
  const { ethers } = await import('ethers');
  
  return new ethers.Contract(
    USDC_ADDRESS,
    USDC_ABI,
    signerOrProvider
  );
}

/**
 * Convert human-readable USDC amount to 6-decimal units
 * @param amount Human-readable amount (e.g., 100.50)
 * @returns Amount in 6-decimal units (bigint)
 * @deprecated Use toUsdcUnits from lib/usdc.ts instead
 */
export async function toUsdcUnits(amount: number | string): Promise<bigint> {
  const { ethers } = await import('ethers');
  return ethers.parseUnits(amount.toString(), 6);
}

/**
 * Convert 6-decimal USDC units to human-readable amount
 * @param amount Amount in 6-decimal units (bigint)
 * @returns Human-readable amount (string)
 */
export async function fromUsdcUnits(amount: bigint | string): Promise<string> {
  const { ethers } = await import('ethers');
  return ethers.formatUnits(amount.toString(), 6);
}

