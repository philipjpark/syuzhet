'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Sparkles, Loader2 } from 'lucide-react';
import { processFiles } from '@/lib/corpus/processors';
import { PredictionThesis } from '@/lib/ai/predictionGenerator';
import PredictionPreview from './PredictionPreview';
import axios from 'axios';

export default function CreatePrediction() {
  const [files, setFiles] = useState<File[]>([]);
  const [corpusText, setCorpusText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prediction, setPrediction] = useState<PredictionThesis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
      try {
        const corpus = await processFiles(acceptedFiles);
        setCorpusText((prev) => prev + '\n\n' + corpus);
      } catch (err) {
        setError(`Failed to process file: ${err}`);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!corpusText.trim() && files.length === 0) {
      setError('Please upload files or enter text to generate a prediction');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let fullCorpus = corpusText;
      if (files.length > 0) {
        const processedCorpus = await processFiles(files);
        fullCorpus = corpusText + '\n\n' + processedCorpus;
      }

      const response = await axios.post('/api/predictions/generate', {
        corpusText: fullCorpus,
      });

      setPrediction(response.data.prediction);
    } catch (err: any) {
      setError(`Failed to generate prediction: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-green-900/95 via-green-800/90 to-emerald-900/95 rounded-lg shadow-lg border border-lime-400/20 p-6">
        <h2 className="text-2xl font-bold text-lime-200 mb-6">
          Create New Prediction
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-lime-200 mb-2">
            Upload Research Materials
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-lime-400 bg-lime-400/10'
                : 'border-lime-400/30 hover:border-lime-400/50 bg-green-900/30'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-lime-300 mb-4" />
            <p className="text-green-200">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-sm text-green-300 mt-2">
              PDF, DOCX, TXT, MD files supported
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-green-900/50 p-3 rounded-lg border border-lime-400/20"
                >
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4 text-lime-300" />
                    <span className="text-sm text-lime-200">{file.name}</span>
                    <span className="text-xs text-green-300">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-lime-200 mb-2">
            Or Enter Research Text Directly
          </label>
          <textarea
            value={corpusText}
            onChange={(e) => setCorpusText(e.target.value)}
            placeholder="Paste articles, notes, research findings, links, or any relevant information here..."
            className="w-full h-48 px-4 py-3 border border-lime-400/30 rounded-lg bg-green-900/30 text-green-100 placeholder-green-400 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-lime-400 text-green-950 py-3 px-6 rounded-lg font-medium hover:bg-lime-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-lime-500/50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Prediction...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Prediction Thesis
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {prediction && (
          <div className="mt-6">
            <PredictionPreview prediction={prediction} />
          </div>
        )}
      </div>
    </div>
  );
}

