/**
 * Local deployment script (for testing)
 * 
 * For Arc Testnet deployment, use: npm run deploy
 * which runs scripts/deploy-arc.ts
 */
import { ethers } from "hardhat";

async function main() {
  // Deploy USDC mock token for local testing
  // For Arc Testnet, use the official USDC address instead
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // Deploy PredictionMarket
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(usdcAddress);
  await predictionMarket.waitForDeployment();
  const marketAddress = await predictionMarket.getAddress();

  console.log("PredictionMarket deployed to:", marketAddress);
  console.log("\nUpdate your .env file with:");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=${marketAddress}`);
  console.log(`NEXT_PUBLIC_USDC_CONTRACT=${usdcAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

