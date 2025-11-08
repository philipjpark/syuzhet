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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.' },
        { status: 500 }
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
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to generate prediction';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

