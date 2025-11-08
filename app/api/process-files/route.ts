/**
 * API Route: Process Files (PDF, TXT, MD)
 * 
 * POST /api/process-files
 * 
 * Body: FormData with files
 * Returns: { corpus: string, fileNames: string[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const processedFiles: Array<{ name: string; content: string }> = [];

    for (const file of files) {
      const fileName = file.name;
      let content = '';

      if (file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const data = await pdfParse(buffer);
          content = data.text;
        } catch (err: any) {
          // If PDF parsing fails, at least include the filename
          content = `[PDF file: ${fileName} - Content extraction failed, but filename suggests: ${fileName}]`;
        }
      } else if (file.type.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        content = await file.text();
      } else {
        // For unsupported types, at least include the filename
        content = `[File: ${fileName} - Content not extracted]`;
      }

      processedFiles.push({
        name: fileName,
        content: content || `[File: ${fileName}]`,
      });
    }

    // Combine all content into a single corpus
    const corpus = processedFiles
      .map((file) => `=== ${file.name} ===\n${file.content}\n\n`)
      .join('\n');

    const fileNames = processedFiles.map((f) => f.name);

    return NextResponse.json(
      { corpus, fileNames },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in /api/process-files:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process files' },
      { status: 500 }
    );
  }
}

