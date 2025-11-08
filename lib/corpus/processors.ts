import pdfParse from 'pdf-parse';

// Mammoth will be dynamically imported server-side only

export interface ProcessedFile {
  name: string;
  type: string;
  content: string;
}

export async function processFile(file: File): Promise<ProcessedFile> {
  const type = file.type;
  const name = file.name;

  if (type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    return {
      name,
      type: 'pdf',
      content: data.text,
    };
  }

  if (
    type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    // DOCX support temporarily disabled due to Windows installation issues
    // To enable: npm install mammoth --legacy-peer-deps
    throw new Error('DOCX files are not currently supported. Please convert to PDF or TXT format.');
  }

  if (type.startsWith('text/')) {
    const content = await file.text();
    return {
      name,
      type: 'text',
      content,
    };
  }

  // Default: try to read as text
  try {
    const content = await file.text();
    return {
      name,
      type: 'text',
      content,
    };
  } catch (error) {
    throw new Error(`Unsupported file type: ${type}`);
  }
}

export async function processFiles(files: File[]): Promise<string> {
  const processedFiles = await Promise.all(
    files.map((file) => processFile(file))
  );

  // Combine all content into a single corpus
  const corpus = processedFiles
    .map((file) => `=== ${file.name} ===\n${file.content}\n\n`)
    .join('\n');

  return corpus;
}
