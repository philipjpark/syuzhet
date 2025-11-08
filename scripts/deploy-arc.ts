/**
 * Deployment script for Arc Testnet
 * 
 * Follows the official Arc deployment tutorial:
 * https://docs.arc.network/arc/tutorials/deploy-on-arc
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-arc.ts --network arcTestnet
 *   or
 *   npm run deploy
 */

import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying to Arc Testnet...\n");

  // Get USDC contract address from environment
  // On Arc Testnet, use the official USDC address or a mock for testing
  // Official Arc Testnet USDC: https://docs.arc.network/arc/references/contract-addresses#usdc
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT || "0x3600000000000000000000000000000000000000";

  if (!usdcAddress || usdcAddress === "0x3600000000000000000000000000000000000000") {
    console.warn(
      "⚠️  WARNING: Using placeholder USDC address. Set NEXT_PUBLIC_USDC_CONTRACT in .env"
    );
    console.warn(
      "   See: https://docs.arc.network/arc/references/contract-addresses#usdc"
    );
  }

  console.log(`Using USDC address: ${usdcAddress}\n`);

  // Deploy PredictionMarket contract
  console.log("Deploying PredictionMarket...");
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(usdcAddress);
  await predictionMarket.waitForDeployment();
  const marketAddress = await predictionMarket.getAddress();

  console.log("\n✅ Deployment successful!");
  console.log("=".repeat(60));
  console.log(`PredictionMarket deployed to: ${marketAddress}`);
  console.log("=".repeat(60));
  console.log("\n📋 TODO: Copy these addresses into your .env file:\n");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=${marketAddress}`);
  console.log(`NEXT_PUBLIC_USDC_CONTRACT=${usdcAddress}`);
  console.log("\n🔍 View on Arc Explorer:");
  console.log(`https://testnet-explorer.arc.network/address/${marketAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
