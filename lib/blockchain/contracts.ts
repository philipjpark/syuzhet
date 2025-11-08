import { ethers } from 'ethers';

export const PREDICTION_MARKET_ABI = [
  'function createPrediction(string memory title, string memory description, uint256 initialPrice, uint256 initialSupply, uint256 timeframe) external returns (uint256)',
  'function buyShares(uint256 predictionId, uint256 shares) external',
  'function sellShares(uint256 predictionId, uint256 shares) external',
  'function getPrediction(uint256 predictionId) external view returns (tuple(string title, string description, uint256 initialPrice, uint256 totalSupply, uint256 timeframe, address creator, bool resolved, bool outcome, uint256 createdAt))',
  'function predictionCount() external view returns (uint256)',
  'function predictionTokens(uint256) external view returns (address)',
  'event PredictionCreated(uint256 indexed predictionId, address indexed creator, string title, uint256 initialPrice)',
];

export const PREDICTION_TOKEN_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function totalSupply() external view returns (uint256)',
];

export const USDC_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
];

export function getPredictionMarketContract(
  address: string,
  provider: ethers.Provider | ethers.Signer
) {
  return new ethers.Contract(
    address,
    PREDICTION_MARKET_ABI,
    provider
  );
}

export function getPredictionTokenContract(
  address: string,
  provider: ethers.Provider | ethers.Signer
) {
  return new ethers.Contract(
    address,
    PREDICTION_TOKEN_ABI,
    provider
  );
}

export function getUSDCContract(
  address: string,
  provider: ethers.Provider | ethers.Signer
) {
  return new ethers.Contract(
    address,
    USDC_ABI,
    provider
  );
}

