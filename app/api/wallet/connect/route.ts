/**
 * API Route: Connect Wallet (Server-side)
 * 
 * This endpoint provides wallet information for the configured private key
 * Used for demo purposes when Dynamic Labs is not configured
 * 
 * GET /api/wallet/connect
 * 
 * Returns: {
 *   address: string;
 *   network: string;
 * }
 */

import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getCurrentChain } from '@/lib/chainConfig';

export async function GET() {
  try {
    if (!process.env.PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'PRIVATE_KEY not configured' },
        { status: 500 }
      );
    }

    // Create wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const address = wallet.address;

    // Get current chain configuration
    const currentChain = getCurrentChain();

    return NextResponse.json({
      address,
      network: currentChain.name,
      chainId: currentChain.chainId,
    });
  } catch (error: any) {
    console.error('Error in /api/wallet/connect:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get wallet info' },
      { status: 500 }
    );
  }
}

