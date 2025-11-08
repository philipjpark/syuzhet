/**
 * API Route: Generate Narrative Update
 * 
 * POST /api/predictions/[id]/updates
 * 
 * Body: {
 *   marketThesis: string;
 *   lastUpdate?: string;
 *   newEvidence: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateNarrativeUpdate } from '@/lib/ai/predictions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { marketThesis, lastUpdate, newEvidence } = body;

    if (!marketThesis || typeof marketThesis !== 'string') {
      return NextResponse.json(
        { error: 'marketThesis is required and must be a string' },
        { status: 400 }
      );
    }

    if (!newEvidence || typeof newEvidence !== 'string') {
      return NextResponse.json(
        { error: 'newEvidence is required and must be a string' },
        { status: 400 }
      );
    }

    const update = await generateNarrativeUpdate({
      marketThesis,
      lastUpdate,
      newEvidence,
    });

    // TODO: Persist to database or IPFS
    // For now, just return the AI-generated update
    // In production, you would:
    // 1. Pin update text to IPFS (or store in DB)
    // 2. Get IPFS hash
    // 3. Store mapping: marketId -> update history
    // 4. Return update with IPFS URI

    return NextResponse.json({ update }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/predictions/[id]/updates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate update' },
      { status: 500 }
    );
  }
}

