/**
 * API Route: Generate Prediction Thesis
 * 
 * POST /api/predictions
 * 
 * Body: {
 *   corpusSummary: string;
 *   userNotes?: string;
 *   preferences?: { timeHorizon?: string; riskTolerance?: string; ... };
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePredictionFromCorpus } from '@/lib/ai/predictions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { corpusSummary, userNotes, preferences } = body;

    if (!corpusSummary || typeof corpusSummary !== 'string') {
      return NextResponse.json(
        { error: 'corpusSummary is required and must be a string' },
        { status: 400 }
      );
    }

    const prediction = await generatePredictionFromCorpus({
      corpusSummary,
      userNotes,
      preferences,
    });

    return NextResponse.json({ prediction }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/predictions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}

