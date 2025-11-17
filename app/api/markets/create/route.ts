/**
 * API Route: Create Prediction Market On-Chain
 * 
 * POST /api/markets/create
 * 
 * Body: {
 *   title: string;
 *   thesis: string;
 *   expiryTimestamp: number;
 *   initialLiquidityUsdc: number;
 *   walletAddress?: string; // Optional - for Circle Wallets
 * }
 * 
 * Returns: {
 *   success: boolean;
 *   marketId?: number;
 *   txHash?: string;
 *   explorerUrl?: string;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentChain, getChainConfig, getExplorerTxUrl, type ChainId } from '@/lib/chainConfig';
import { toUsdcUnits } from '@/lib/usdc';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, thesis, expiryTimestamp, initialLiquidityUsdc, walletAddress, chainId } = body;

    // Validate inputs
    if (!title || !thesis || !expiryTimestamp || !initialLiquidityUsdc) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get chain configuration (use provided chainId or default)
    const targetChainId = (chainId as ChainId) || getCurrentChain().chainId;
    const chain = getChainConfig(targetChainId) || getCurrentChain();

    // Demo mode: If contract is not deployed, simulate a successful mint
    if (!chain.predictionMarketAddress) {
      console.log(`⚠️  PredictionMarket contract not deployed on ${chain.name}. Using demo mode.`);
      
      // Generate a mock market ID and transaction hash for demo purposes
      const mockMarketId = Math.floor(Math.random() * 1000000) + 1;
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      return NextResponse.json({
        success: true,
        marketId: mockMarketId,
        txHash: mockTxHash,
        explorerUrl: getExplorerTxUrl(targetChainId, mockTxHash),
        demo: true, // Flag to indicate this is a demo transaction
        chainId: targetChainId,
        chainName: chain.name,
      });
    }

    // Demo mode: If USDC address is not configured, also use demo mode
    if (!chain.usdcAddress || chain.usdcAddress === '0x3600000000000000000000000000000000000000') {
      console.log(`⚠️  USDC contract address not configured on ${chain.name}. Using demo mode.`);
      
      // Generate a mock market ID and transaction hash for demo purposes
      const mockMarketId = Math.floor(Math.random() * 1000000) + 1;
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      return NextResponse.json({
        success: true,
        marketId: mockMarketId,
        txHash: mockTxHash,
        explorerUrl: getExplorerTxUrl(targetChainId, mockTxHash),
        demo: true, // Flag to indicate this is a demo transaction
        chainId: targetChainId,
        chainName: chain.name,
      });
    }

    // For now, use server-side signer (from PRIVATE_KEY)
    // TODO: In production, use Circle Wallets or user's wallet via Dynamic Labs
    const { ethers } = await import('ethers');
    
    // Demo mode: If PRIVATE_KEY is not configured, use demo mode
    if (!process.env.PRIVATE_KEY) {
      console.log(`⚠️  PRIVATE_KEY not configured. Using demo mode on ${chain.name}.`);
      
      // Generate a mock market ID and transaction hash for demo purposes
      const mockMarketId = Math.floor(Math.random() * 1000000) + 1;
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      return NextResponse.json({
        success: true,
        marketId: mockMarketId,
        txHash: mockTxHash,
        explorerUrl: getExplorerTxUrl(targetChainId, mockTxHash),
        demo: true, // Flag to indicate this is a demo transaction
        chainId: targetChainId,
        chainName: chain.name,
      });
    }

    // Create provider and signer using chain-specific RPC URL
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Get contracts
    const PredictionMarketABI = [
      'function createMarket(string memory _title, string memory _thesis, uint256 _expiry, uint256 _initialLiquidityUsdc) external',
      'event MarketCreated(uint256 indexed marketId, string title, string thesis, uint256 expiry, address creator, uint256 initialLiquidityUsdc)',
    ];

    const USDCABI = [
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function allowance(address owner, address spender) external view returns (uint256)',
      'function balanceOf(address account) external view returns (uint256)',
      'function decimals() external view returns (uint8)',
    ];

    const marketContract = new ethers.Contract(
      chain.predictionMarketAddress!,
      PredictionMarketABI,
      signer
    );

    const usdcContract = new ethers.Contract(
      chain.usdcAddress!,
      USDCABI,
      signer
    );

    // Convert liquidity to chain-specific USDC units (6 for Arc, 18 for BNB)
    const liquidityAmount = toUsdcUnits(initialLiquidityUsdc.toString(), targetChainId);

    // Check USDC balance
    const signerAddress = await signer.getAddress();
    const balance = await usdcContract.balanceOf(signerAddress);
    const balanceFormatted = ethers.formatUnits(balance, chain.usdcDecimals);
    if (balance < liquidityAmount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient USDC balance. Need ${initialLiquidityUsdc} USDC, have ${balanceFormatted} USDC.` 
        },
        { status: 400 }
      );
    }

    // Check and approve USDC if needed
    const allowance = await usdcContract.allowance(signerAddress, chain.predictionMarketAddress!);
    if (allowance < liquidityAmount) {
      console.log('Approving USDC...');
      const approveTx = await usdcContract.approve(chain.predictionMarketAddress!, liquidityAmount);
      await approveTx.wait();
      console.log('USDC approved');
    }

    // Create market
    console.log('Creating market on-chain...');
    const createTx = await marketContract.createMarket(
      title,
      thesis,
      expiryTimestamp,
      liquidityAmount
    );

    console.log('Transaction submitted:', createTx.hash);
    const receipt = await createTx.wait();
    console.log('Transaction confirmed:', receipt.hash);

    // Extract market ID from event
    let marketId: number | null = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = marketContract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'MarketCreated') {
          marketId = Number(parsedLog.args.marketId);
          break;
        }
      } catch (e) {
        // Not the event we're looking for
      }
    }

    const explorerUrl = getExplorerTxUrl(targetChainId, receipt.hash);

    return NextResponse.json({
      success: true,
      marketId: marketId || undefined,
      txHash: receipt.hash,
      explorerUrl,
      chainId: targetChainId,
      chainName: chain.name,
    });
  } catch (error: any) {
    console.error('Error creating market:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create market on-chain',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

