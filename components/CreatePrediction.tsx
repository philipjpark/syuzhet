'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  X, 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Settings,
  Eye,
  CheckCircle,
  Calendar,
  DollarSign,
  Package,
  RefreshCw,
  Info
} from 'lucide-react';
import { processFiles } from '@/lib/corpus/processors';
import { PredictionThesis } from '@/lib/ai/predictionGenerator';
import axios from 'axios';
import { PREDICTION_MARKET_ADDRESS, USDC_ADDRESS } from '@/lib/arcConfig';

type Step = 'research' | 'generate' | 'configure' | 'preview' | 'publish';

interface PredictionConfig {
  initialPrice: number;
  initialSupply: number;
  timeframe: string;
  timeframeDate: string; // ISO date string
  category: string;
  allowUpdates: boolean;
  updateFrequency: 'weekly' | 'monthly' | 'quarterly' | 'manual';
  description: string;
}

export default function CreatePrediction() {
  const [currentStep, setCurrentStep] = useState<Step>('research');
  const [files, setFiles] = useState<File[]>([]);
  const [corpusText, setCorpusText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prediction, setPrediction] = useState<PredictionThesis | null>(null);
  const [config, setConfig] = useState<PredictionConfig>({
    initialPrice: 0.50,
    initialSupply: 1000000,
    timeframe: '',
    timeframeDate: '',
    category: 'speculative',
    allowUpdates: true,
    updateFrequency: 'monthly',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
      try {
        const corpus = await processFiles(acceptedFiles);
        setCorpusText((prev) => prev + '\n\n' + corpus);
      } catch (err: any) {
        setError(`Failed to process file: ${err.message}`);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
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

      const generated = response.data.prediction;
      setPrediction(generated);
      
      // Auto-populate config with AI suggestions
      setConfig(prev => ({
        ...prev,
        initialPrice: generated.market_suggestion.suggested_yes_price_usd,
        category: generated.market_suggestion.category,
        timeframe: generated.timeframe,
        description: generated.description,
      }));

      setCurrentStep('configure');
    } catch (err: any) {
      setError(`Failed to generate prediction: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      // TODO: Publish to Arc Testnet
      // 1. Get user's wallet address and signer
      // 2. Convert timeframe to Unix timestamp
      // 3. Convert price to USDC units (6 decimals)
      // 4. Call PredictionMarket.createPrediction()
      // 5. Wait for transaction confirmation
      
      // Simulate for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('publish');
    } catch (err: any) {
      setError(`Failed to publish: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'research', label: 'Research', icon: <Upload className="w-4 h-4" /> },
    { id: 'generate', label: 'Generate', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'configure', label: 'Configure', icon: <Settings className="w-4 h-4" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
    { id: 'publish', label: 'Publish', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const canGoNext = () => {
    if (currentStep === 'research') return corpusText.trim().length > 0 || files.length > 0;
    if (currentStep === 'generate') return prediction !== null;
    if (currentStep === 'configure') return config.timeframeDate && config.initialPrice > 0;
    if (currentStep === 'preview') return true;
    return false;
  };

  const nextStep = () => {
    if (currentStep === 'research' && canGoNext()) {
      setCurrentStep('generate');
    } else if (currentStep === 'generate' && prediction) {
      setCurrentStep('configure');
    } else if (currentStep === 'configure' && canGoNext()) {
      setCurrentStep('preview');
    } else if (currentStep === 'preview') {
      handlePublish();
    }
  };

  const prevStep = () => {
    if (currentStep === 'generate') setCurrentStep('research');
    else if (currentStep === 'configure') setCurrentStep('generate');
    else if (currentStep === 'preview') setCurrentStep('configure');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    index <= currentStepIndex
                      ? 'bg-lime-400 text-green-950 shadow-lg shadow-lime-500/50'
                      : 'bg-green-700/50 text-green-300 border-2 border-lime-400/30'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    index <= currentStepIndex ? 'text-lime-200' : 'text-green-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-all ${
                    index < currentStepIndex
                      ? 'bg-lime-400'
                      : 'bg-green-700/50'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-green-700/95 via-green-600/90 to-emerald-700/95 rounded-2xl shadow-2xl border border-lime-400/20 p-8">
        {/* Step 1: Research */}
        {currentStep === 'research' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-lime-200 mb-2">Add Your Research</h2>
              <p className="text-green-300">Upload documents or paste research to generate your prediction</p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-lime-200 mb-3">
                Upload Research Materials
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-lime-400 bg-lime-400/10 scale-105'
                    : 'border-lime-400/30 hover:border-lime-400/50 bg-green-700/30 hover:bg-green-700/40'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-16 h-16 mx-auto text-lime-300 mb-4" />
                <p className="text-lg text-lime-200 font-medium mb-2">
                  {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-green-300">
                  or click to select • PDF, TXT, MD files supported
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-green-700/50 p-4 rounded-lg border border-lime-400/20"
                    >
                      <div className="flex items-center space-x-3">
                        <File className="w-5 h-5 text-lime-300" />
                        <div>
                          <span className="text-sm text-lime-200 font-medium">{file.name}</span>
                          <span className="text-xs text-green-300 ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-lime-200 mb-3">
                Or Paste Research Text
              </label>
              <textarea
                value={corpusText}
                onChange={(e) => setCorpusText(e.target.value)}
                placeholder="Paste articles, notes, research findings, links, or any relevant information here..."
                className="w-full h-64 px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-green-100 placeholder-green-400 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
              />
              <p className="text-xs text-green-400 mt-2">
                {corpusText.length} characters
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Generate */}
        {currentStep === 'generate' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-lime-200 mb-2">Generate Prediction</h2>
              <p className="text-green-300">AI will analyze your research and create an investable prediction thesis</p>
            </div>

            {!prediction ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <Sparkles className="w-20 h-20 mx-auto text-lime-400 mb-4" />
                  <p className="text-lg text-lime-200 mb-4">
                    Ready to generate your prediction?
                  </p>
                  <p className="text-sm text-green-300 mb-8">
                    Our AI will analyze your research and create a structured, tradable prediction asset
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-lime-400 text-green-950 py-4 px-8 rounded-xl font-semibold text-lg hover:bg-lime-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-lime-500/50 mx-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating Prediction...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Generate Prediction Thesis
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-green-700/50 rounded-xl p-6 border border-lime-400/20">
                <div className="flex items-start gap-4 mb-4">
                  <CheckCircle className="w-6 h-6 text-lime-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-lime-200 mb-2">{prediction.title}</h3>
                    <p className="text-green-200 mb-4">{prediction.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-300">Probability:</span>
                        <span className="text-lime-200 font-semibold">
                          {(prediction.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-300">Timeframe:</span>
                        <span className="text-lime-200 font-semibold">{prediction.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Configure */}
        {currentStep === 'configure' && prediction && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-lime-200 mb-2">Configure Your Prediction</h2>
              <p className="text-green-300">Set up your prediction asset parameters</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Initial Price */}
              <div className="bg-green-700/50 rounded-xl p-6 border border-lime-400/20">
                <label className="flex items-center gap-2 text-sm font-medium text-lime-200 mb-3">
                  <DollarSign className="w-4 h-4" />
                  Initial Price (USDC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={config.initialPrice}
                  onChange={(e) => setConfig(prev => ({ ...prev, initialPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-green-700/30 border border-lime-400/30 rounded-lg text-lime-200 focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                />
                <p className="text-xs text-green-400 mt-2">
                  Suggested: ${prediction.market_suggestion.suggested_yes_price_usd.toFixed(2)}
                </p>
              </div>

              {/* Initial Supply */}
              <div className="bg-green-700/50 rounded-xl p-6 border border-lime-400/20">
                <label className="flex items-center gap-2 text-sm font-medium text-lime-200 mb-3">
                  <Package className="w-4 h-4" />
                  Initial Supply (Shares)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={config.initialSupply}
                  onChange={(e) => setConfig(prev => ({ ...prev, initialSupply: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-green-700/30 border border-lime-400/30 rounded-lg text-lime-200 focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                />
                <p className="text-xs text-green-400 mt-2">
                  Total shares to mint
                </p>
              </div>

              {/* Timeframe Date */}
              <div className="bg-green-700/50 rounded-xl p-6 border border-lime-400/20">
                <label className="flex items-center gap-2 text-sm font-medium text-lime-200 mb-3">
                  <Calendar className="w-4 h-4" />
                  Resolution Date
                </label>
                <input
                  type="date"
                  value={config.timeframeDate}
                  onChange={(e) => setConfig(prev => ({ ...prev, timeframeDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-green-700/30 border border-lime-400/30 rounded-lg text-lime-200 focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                />
                <p className="text-xs text-green-400 mt-2">
                  When this prediction should be resolved
                </p>
              </div>

              {/* Category */}
              <div className="bg-green-700/50 rounded-xl p-6 border border-lime-400/20">
                <label className="flex items-center gap-2 text-sm font-medium text-lime-200 mb-3">
                  Category
                </label>
                <select
                  value={config.category}
                  onChange={(e) => setConfig(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-green-700/30 border border-lime-400/30 rounded-lg text-lime-200 focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                >
                  <option value="speculative">Speculative</option>
                  <option value="technology">Technology</option>
                  <option value="policy">Policy</option>
                  <option value="finance">Finance</option>
                  <option value="science">Science</option>
                  <option value="society">Society</option>
                </select>
              </div>
            </div>

            {/* Longitudinal Prediction Settings */}
            <div className="bg-green-900/50 rounded-xl p-6 border border-lime-400/20">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-lime-400" />
                <h3 className="text-lg font-semibold text-lime-200">Longitudinal Updates</h3>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allowUpdates}
                    onChange={(e) => setConfig(prev => ({ ...prev, allowUpdates: e.target.checked }))}
                    className="w-5 h-5 rounded border-lime-400/30 bg-green-700/30 text-lime-400 focus:ring-lime-400"
                  />
                  <span className="text-lime-200">Allow prediction updates over time</span>
                </label>

                {config.allowUpdates && (
                  <div>
                    <label className="block text-sm font-medium text-lime-200 mb-2">
                      Update Frequency
                    </label>
                    <select
                      value={config.updateFrequency}
                      onChange={(e) => setConfig(prev => ({ ...prev, updateFrequency: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-green-700/30 border border-lime-400/30 rounded-lg text-lime-200 focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="manual">Manual (on-demand)</option>
                    </select>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Updates allow you to refine predictions as new evidence emerges
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description Override */}
            <div>
              <label className="block text-sm font-medium text-lime-200 mb-3">
                Description (Optional - override AI-generated)
              </label>
              <textarea
                value={config.description || prediction.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder={prediction.description}
                className="w-full h-32 px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-green-100 placeholder-green-400 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 'preview' && prediction && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-lime-200 mb-2">Preview Your Prediction</h2>
              <p className="text-green-300">Review your prediction asset before publishing</p>
            </div>

            <div className="bg-green-900/50 rounded-xl p-8 border border-lime-400/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-lime-200 mb-2">{prediction.title}</h3>
                  <p className="text-green-200">{config.description || prediction.description}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-lime-400/20">
                  <div>
                    <div className="text-sm text-green-300 mb-1">Initial Price</div>
                    <div className="text-2xl font-bold text-lime-200">
                      ${config.initialPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-green-300 mb-1">Total Supply</div>
                    <div className="text-2xl font-bold text-lime-200">
                      {config.initialSupply.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-green-300 mb-1">Resolution Date</div>
                    <div className="text-xl font-semibold text-lime-200">
                      {config.timeframeDate ? new Date(config.timeframeDate).toLocaleDateString() : 'Not set'}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-lime-400/20">
                  <div className="flex items-center gap-2 text-sm text-green-300 mb-2">
                    <span>Category:</span>
                    <span className="text-lime-200 font-semibold capitalize">{config.category}</span>
                    {config.allowUpdates && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Updates:</span>
                        <span className="text-lime-200 font-semibold capitalize">{config.updateFrequency}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-300">AI Probability:</span>
                    <span className="text-lime-200 font-semibold">
                      {(prediction.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Publish */}
        {currentStep === 'publish' && (
          <div className="text-center py-12">
            <CheckCircle className="w-20 h-20 mx-auto text-lime-400 mb-6" />
            <h2 className="text-3xl font-bold text-lime-200 mb-4">Prediction Published!</h2>
            <p className="text-green-300 mb-8">
              Your prediction asset is now live on the market
            </p>
            <button
              onClick={() => window.location.href = '/app'}
              className="bg-lime-400 text-green-950 py-3 px-8 rounded-xl font-semibold hover:bg-lime-300 shadow-lg shadow-lime-500/50"
            >
              View in Market
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-400/30 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep !== 'publish' && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-lime-400/20">
            <button
              onClick={prevStep}
              disabled={currentStep === 'research'}
              className="flex items-center gap-2 px-6 py-3 bg-green-700/50 text-lime-200 rounded-lg font-medium hover:bg-green-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-lime-400/20"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={nextStep}
              disabled={!canGoNext() || isGenerating || isPublishing}
              className="flex items-center gap-2 px-8 py-3 bg-lime-400 text-green-950 rounded-lg font-semibold hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-lime-500/50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : currentStep === 'preview' ? (
                <>
                  Publish to Market
                  <CheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
