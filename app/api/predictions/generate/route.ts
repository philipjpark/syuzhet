import { NextRequest, NextResponse } from 'next/server';
import { generatePrediction } from '@/lib/ai/predictionGenerator';

export async function POST(request: NextRequest) {
  try {
    const { corpusText } = await request.json();

    if (!corpusText || typeof corpusText !== 'string') {
      return NextResponse.json(
        { error: 'Corpus text is required' },
        { status: 400 }
      );
    }

    const prediction = await generatePrediction(corpusText);

    return NextResponse.json({ prediction });
  } catch (error: any) {
    console.error('Error generating prediction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}

