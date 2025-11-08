'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Calendar,
  DollarSign,
  Settings,
  Eye,
  FolderOpen,
  File,
  Plus,
  X,
  Link,
  TrendingUp
} from 'lucide-react';
import { GeneratedPrediction } from '@/lib/ai/predictions';
import axios from 'axios';
import { useDynamicContext } from '@/components/providers/DynamicProvider';
import { getPredictionMarketContract, getUsdcContract, toUsdcUnits } from '@/lib/contracts';
import { PREDICTION_MARKET_ADDRESS, USDC_ADDRESS, ARC_NETWORK } from '@/lib/arcConfig';
import { useRouter } from 'next/navigation';
import { selectDirectory, readDirectoryFiles } from '@/lib/corpus/directoryReader';
import TransactionStatus, { TransactionStatusType as TxStatus } from '@/components/TransactionStatus';

type Step = 'input' | 'review' | 'mint';

export default function PredictionWizard() {
  const router = useRouter();
  const { primaryWallet } = useDynamicContext();
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [corpusSummary, setCorpusSummary] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [preferences, setPreferences] = useState({ timeHorizon: '', riskTolerance: 'medium' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [prediction, setPrediction] = useState<GeneratedPrediction | null>(null);
  const [editedPrediction, setEditedPrediction] = useState<GeneratedPrediction | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txMarketId, setTxMarketId] = useState<number | undefined>();
  const [txExplorerUrl, setTxExplorerUrl] = useState<string | undefined>();
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [directoryFiles, setDirectoryFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [marketSentiment, setMarketSentiment] = useState('mars news');
  const [isMounted, setIsMounted] = useState(false);

  // Check for directory picker support only on client side after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only check for directory picker support after component has mounted on client
  const isDirectoryPickerSupported = isMounted && typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const handleSelectDirectory = async () => {
    setIsLoadingDirectory(true);
    setError(null);

    try {
      const directoryHandle = await selectDirectory();
      
      if (!directoryHandle) {
        setIsLoadingDirectory(false);
        return; // User cancelled
      }

      setSelectedDirectory(directoryHandle.name);

      // Read all supported files from the directory
      const files = await readDirectoryFiles(directoryHandle);

      if (files.length === 0) {
        setError('No supported files found in the selected directory. Please select a directory containing PDF, TXT, or MD files.');
        setIsLoadingDirectory(false);
        return;
      }

      setDirectoryFiles(files);

      // Add file names to corpus for preview (actual content will be extracted during generation)
      const fileNames = files.map(f => f.name).join(', ');
      setCorpusSummary((prev) => {
        const separator = prev.trim() ? '\n\n---\n\n' : '';
        return prev + separator + '[Files from "' + directoryHandle.name + '"]: ' + fileNames + '\n\n(Content will be extracted when generating prediction)';
      });
    } catch (err: any) {
      setError(`Failed to read directory: ${err.message}`);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  const handleGenerate = async () => {
    if (!corpusSummary.trim() && directoryFiles.length === 0 && urls.length === 0) {
      setError('Please enter your idea and research notes, select a directory with research files, or add research URLs');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Process PDF files on the server if any are selected
      let fileCorpus = corpusSummary;
      if (directoryFiles.length > 0) {
        try {
          const formData = new FormData();
          directoryFiles.forEach((file) => {
            formData.append('files', file);
          });

          const processResponse = await axios.post('/api/process-files', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const { corpus: extractedCorpus, fileNames } = processResponse.data;
          
          // Add extracted PDF content to corpus
          if (extractedCorpus) {
            const separator = fileCorpus.trim() ? '\n\n---\n\n' : '';
            const dirName = selectedDirectory || 'selected directory';
            fileCorpus = fileCorpus + separator + '[Files from "' + dirName + '"]\n\n' + extractedCorpus;
          }

          // Also include file names in the corpus for context
          if (fileNames && fileNames.length > 0) {
            const fileNamesList = fileNames.map(name => '- ' + name).join('\n');
            const fileNamesText = '\n\n--- Research Files ---\n' + fileNamesList + '\n';
            fileCorpus = fileCorpus + fileNamesText;
          }
        } catch (err: any) {
          console.error('Error processing files:', err);
          // If file processing fails, at least include the filenames
          const failedFileNames = directoryFiles.map(f => '- ' + f.name).join('\n');
          const fileNamesText = '\n\n--- Research Files (content extraction failed) ---\n' + failedFileNames + '\n';
          fileCorpus = fileCorpus + fileNamesText;
        }
      }

      // Combine URLs into corpus if provided
      let enhancedCorpus = fileCorpus;
      if (urls.length > 0) {
        const urlsText = `\n\n--- Research URLs ---\n${urls.map(url => `- ${url}`).join('\n')}\n`;
        enhancedCorpus = enhancedCorpus + urlsText;
      }
      
      // Add market sentiment to preferences
      const enhancedPreferences = {
        ...preferences,
        marketSentiment: marketSentiment || undefined,
      };

      const response = await axios.post('/api/predictions', {
        corpusSummary: enhancedCorpus,
        userNotes: userNotes || undefined,
        preferences: enhancedPreferences.timeHorizon || enhancedPreferences.marketSentiment ? enhancedPreferences : undefined,
      });

      const generated = response.data.prediction;
      setPrediction(generated);
      setEditedPrediction(generated);
      setCurrentStep('review');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate prediction');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMint = async () => {
    if (!editedPrediction) return;

    setIsMinting(true);
    setError(null);
    setTxStatus('pending');
    setTxHash(undefined);
    setTxMarketId(undefined);
    setTxExplorerUrl(undefined);

    try {
      // Option 1: Use API route (server-side signing with PRIVATE_KEY)
      // This is better for hackathon demo as it doesn't require user wallet connection
      const response = await axios.post('/api/markets/create', {
        title: editedPrediction.title,
        thesis: editedPrediction.thesis,
        expiryTimestamp: editedPrediction.parameters.expiryTimestamp,
        initialLiquidityUsdc: editedPrediction.parameters.initialLiquidityUsdc,
      });

      if (response.data.success) {
        setTxStatus('confirmed');
        setTxHash(response.data.txHash);
        setTxMarketId(response.data.marketId);
        setTxExplorerUrl(response.data.explorerUrl);

        // Redirect to market page after a short delay
        if (response.data.marketId) {
          setTimeout(() => {
            router.push(`/markets/${response.data.marketId}`);
          }, 2000);
        }
      } else {
        throw new Error(response.data.error || 'Failed to create market');
      }

      /* Option 2: Direct on-chain (requires user wallet connection)
      if (!primaryWallet) {
        throw new Error('Please connect your wallet');
      }

      // Check network
      if (primaryWallet.chain?.id !== ARC_NETWORK.chainId) {
        throw new Error(`Please switch to ${ARC_NETWORK.name} (Chain ID: ${ARC_NETWORK.chainId})`);
      }

      // Get provider and signer from Dynamic Labs
      const provider = await primaryWallet.connector.getProvider();
      const signer = await provider.getSigner();

      const marketContract = await getPredictionMarketContract(signer);
      const usdcContract = await getUsdcContract(signer);

      // Approve USDC
      const liquidityAmount = await toUsdcUnits(editedPrediction.parameters.initialLiquidityUsdc);
      const approveTx = await usdcContract.approve(PREDICTION_MARKET_ADDRESS, liquidityAmount);
      await approveTx.wait();

      // Create market
      const createTx = await marketContract.createMarket(
        editedPrediction.title,
        editedPrediction.thesis,
        editedPrediction.parameters.expiryTimestamp,
        liquidityAmount
      );

      setTxHash(createTx.hash);
      setTxExplorerUrl(`https://testnet-explorer.arc.network/tx/${createTx.hash}`);

      const receipt = await createTx.wait();

      // Extract market ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = marketContract.interface.parseLog(log);
          return parsed?.name === 'MarketCreated';
        } catch {
          return false;
        }
      });

      let marketId: number | null = null;
      if (event) {
        const parsed = marketContract.interface.parseLog(event);
        marketId = Number(parsed?.args.marketId);
      }

      if (marketId !== null) {
        setTxStatus('confirmed');
        setTxMarketId(marketId);
        setTimeout(() => {
          router.push(`/markets/${marketId}`);
        }, 2000);
      } else {
        throw new Error('Market created but could not extract market ID. Check transaction receipt.');
      }
      */
    } catch (err: any) {
      setTxStatus('failed');
      setError(err.response?.data?.error || err.message || 'Failed to mint prediction market');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Market Sentiment Section */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-green-800/50 via-green-700/40 to-emerald-800/50 rounded-xl p-4 border border-lime-400/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-lime-300" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-white mb-1">
                Market Sentiment
              </label>
              <input
                type="text"
                value={marketSentiment}
                onChange={(e) => setMarketSentiment(e.target.value)}
                placeholder="e.g., mars news, AI developments, space exploration"
                className="w-full px-3 py-2 border border-lime-400/30 rounded-lg bg-green-700/30 text-white placeholder-white/60 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[
            { id: 'input', label: 'Idea & Corpus', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'review', label: 'Review & Edit', icon: <Eye className="w-4 h-4" /> },
            { id: 'mint', label: 'Mint On-Chain', icon: <Settings className="w-4 h-4" /> },
          ].map((step, index) => {
            const stepIndex = ['input', 'review', 'mint'].indexOf(currentStep);
            const isActive = index === stepIndex;
            const isCompleted = index < stepIndex;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      isCompleted
                        ? 'bg-lime-400 text-green-950'
                        : isActive
                        ? 'bg-lime-400 text-green-950 shadow-lg shadow-lime-500/50'
                        : 'bg-green-700/50 text-green-300 border-2 border-lime-400/30'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>
                  <span className={`text-xs mt-2 font-medium whitespace-nowrap ${isActive || isCompleted ? 'text-lime-200' : 'text-green-400'}`}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`h-1 w-16 mx-4 transition-all ${index < stepIndex ? 'bg-lime-400' : 'bg-green-700/50'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Input */}
      {currentStep === 'input' && (
        <div className="bg-gradient-to-br from-green-700/95 via-green-600/90 to-emerald-700/95 rounded-2xl shadow-2xl border border-lime-400/20 p-8">
          <h2 className="text-3xl font-bold text-lime-200 mb-2">Describe Your Intuition</h2>
          <p className="text-white mb-6">Enter your idea and research notes. AI will transform it into a structured prediction thesis.</p>

          <div className="space-y-6">
            {/* Directory Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Connect to Local Directory
              </label>
              <button
                type="button"
                onClick={handleSelectDirectory}
                disabled={isLoadingDirectory}
                className="w-full bg-green-800/50 hover:bg-green-800/70 text-white border-2 border-lime-400/30 hover:border-lime-400/50 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingDirectory ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading directory...
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-5 h-5" />
                    Select Directory
                  </>
                )}
              </button>
              {selectedDirectory && (
                <div className="mt-2 p-3 bg-green-800/30 rounded-lg border border-lime-400/20">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <FolderOpen className="w-4 h-4 text-white" />
                    <span className="font-medium">{selectedDirectory}</span>
                    <span className="text-white">({directoryFiles.length} files)</span>
                  </div>
                  {directoryFiles.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {directoryFiles.slice(0, 5).map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-white">
                          <File className="w-3 h-3" />
                          <span className="truncate">{file.name}</span>
                        </div>
                      ))}
                      {directoryFiles.length > 5 && (
                        <div className="text-xs text-white italic">
                          +{directoryFiles.length - 5} more files...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <p className="mt-2 text-xs text-white">
                {isDirectoryPickerSupported
                  ? 'Select a directory to automatically load all PDF, TXT, and MD files'
                  : 'Directory selection not available in this browser. Use manual paste instead.'}
              </p>
            </div>

            {/* URL Input Section */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Research URLs
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="flex-1 px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white placeholder-white/60 focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && currentUrl.trim()) {
                      e.preventDefault();
                      setUrls([...urls, currentUrl.trim()]);
                      setCurrentUrl('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (currentUrl.trim()) {
                      setUrls([...urls, currentUrl.trim()]);
                      setCurrentUrl('');
                    }
                  }}
                  className="px-4 py-3 bg-lime-400 text-green-950 rounded-xl font-semibold hover:bg-lime-300 transition-all shadow-lg shadow-lime-500/50 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {urls.length > 0 && (
                <div className="mt-2 space-y-2">
                  {urls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-green-800/30 rounded-lg border border-lime-400/20">
                      <Link className="w-4 h-4 text-white flex-shrink-0" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-white hover:text-lime-300 truncate"
                      >
                        {url}
                      </a>
                      <button
                        type="button"
                        onClick={() => setUrls(urls.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center">
              <span className="text-white text-sm">OR</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Research Corpus & Notes *
              </label>
              <textarea
                value={corpusSummary}
                onChange={(e) => setCorpusSummary(e.target.value)}
                placeholder="Paste your research, articles, notes, links, or any relevant information here..."
                className="w-full h-64 px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white placeholder-white/60 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
              />
              <p className="mt-2 text-xs text-white">
                {corpusSummary.length} characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Any additional context or preferences..."
                className="w-full h-32 px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white placeholder-white/60 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Time Horizon (Optional)
                </label>
                <input
                  type="text"
                  value={preferences.timeHorizon}
                  onChange={(e) => setPreferences({ ...preferences, timeHorizon: e.target.value })}
                  placeholder="e.g., by 2035, within 3 years"
                  className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white placeholder-white/60 focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Risk Tolerance
                </label>
                <select
                  value={preferences.riskTolerance}
                  onChange={(e) => setPreferences({ ...preferences, riskTolerance: e.target.value })}
                  className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                >
                  <option value="low" className="bg-green-700 text-white">Low</option>
                  <option value="medium" className="bg-green-700 text-white">Medium</option>
                  <option value="high" className="bg-green-700 text-white">High</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-lime-400 text-green-950 py-4 px-8 rounded-xl font-semibold text-lg hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-lime-500/50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Prediction Thesis...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Prediction Thesis
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review & Edit */}
      {currentStep === 'review' && editedPrediction && (
        <div className="bg-gradient-to-br from-green-700/95 via-green-600/90 to-emerald-700/95 rounded-2xl shadow-2xl border border-lime-400/20 p-8">
          <h2 className="text-3xl font-bold text-lime-200 mb-2">Review & Edit Prediction</h2>
          <p className="text-white mb-6">Review the AI-generated thesis and adjust as needed.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-lime-200 mb-2">Title</label>
              <input
                type="text"
                value={editedPrediction.title}
                onChange={(e) => setEditedPrediction({ ...editedPrediction, title: e.target.value })}
                className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-lime-200 mb-2">Thesis</label>
              <textarea
                value={editedPrediction.thesis}
                onChange={(e) => setEditedPrediction({ ...editedPrediction, thesis: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lime-200 mb-2">Time Horizon</label>
                <input
                  type="text"
                  value={editedPrediction.timeHorizon}
                  onChange={(e) => setEditedPrediction({ ...editedPrediction, timeHorizon: e.target.value })}
                  className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lime-200 mb-2">
                  Suggested Probability: {(editedPrediction.suggestedProbability * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={editedPrediction.suggestedProbability}
                  onChange={(e) => setEditedPrediction({ ...editedPrediction, suggestedProbability: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-lime-200 mb-2">Reasoning</label>
              <ul className="list-disc list-inside space-y-2 text-white">
                {editedPrediction.reasoningBullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep('input')}
                className="flex-1 px-6 py-3 bg-green-700/50 text-lime-200 rounded-xl font-medium hover:bg-green-700/70 transition-all border border-lime-400/20"
              >
                <ChevronLeft className="w-5 h-5 inline mr-2" />
                Back
              </button>
              <button
                onClick={() => setCurrentStep('mint')}
                className="flex-1 px-6 py-3 bg-lime-400 text-green-950 rounded-xl font-semibold hover:bg-lime-300 transition-all shadow-lg shadow-lime-500/50"
              >
                Continue to On-Chain Setup
                <ChevronRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Mint */}
      {currentStep === 'mint' && editedPrediction && (
        <div className="bg-gradient-to-br from-green-700/95 via-green-600/90 to-emerald-700/95 rounded-2xl shadow-2xl border border-lime-400/20 p-8">
          <h2 className="text-3xl font-bold text-lime-200 mb-2">Mint Prediction Asset</h2>
          <p className="text-white mb-6">Set on-chain parameters and mint your prediction market.</p>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-lime-200 mb-2">
                <Calendar className="w-4 h-4" />
                Expiry Date & Time
              </label>
              <input
                type="datetime-local"
                value={new Date(editedPrediction.parameters.expiryTimestamp * 1000).toISOString().slice(0, 16)}
                onChange={(e) => {
                  const timestamp = Math.floor(new Date(e.target.value).getTime() / 1000);
                  setEditedPrediction({
                    ...editedPrediction,
                    parameters: { ...editedPrediction.parameters, expiryTimestamp: timestamp },
                  });
                }}
                className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-lime-200 mb-2">
                <DollarSign className="w-4 h-4" />
                Initial Liquidity (USDC)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={editedPrediction.parameters.initialLiquidityUsdc}
                onChange={(e) => {
                  setEditedPrediction({
                    ...editedPrediction,
                    parameters: {
                      ...editedPrediction.parameters,
                      initialLiquidityUsdc: parseFloat(e.target.value) || 0,
                    },
                  });
                }}
                className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              />
              <p className="text-xs text-white/70 mt-2">
                This USDC will be locked as seed liquidity for the market
              </p>
            </div>

            <div className="bg-green-800/50 rounded-xl p-6 border border-lime-400/20">
              <h3 className="text-lg font-semibold text-lime-200 mb-4">Summary</h3>
              <div className="space-y-2 text-white text-sm">
                <div><span className="font-medium">Title:</span> {editedPrediction.title}</div>
                <div><span className="font-medium">Expiry:</span> {new Date(editedPrediction.parameters.expiryTimestamp * 1000).toLocaleString()}</div>
                <div><span className="font-medium">Liquidity:</span> {editedPrediction.parameters.initialLiquidityUsdc} USDC</div>
                <div><span className="font-medium">Initial Price:</span> {(editedPrediction.parameters.initialYesPrice * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep('review')}
                className="flex-1 px-6 py-3 bg-green-700/50 text-lime-200 rounded-xl font-medium hover:bg-green-700/70 transition-all border border-lime-400/20"
              >
                <ChevronLeft className="w-5 h-5 inline mr-2" />
                Back
              </button>
              <button
                onClick={handleMint}
                disabled={isMinting}
                className="flex-1 px-6 py-3 bg-lime-400 text-green-950 rounded-xl font-semibold hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-lime-500/50"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    Minting...
                  </>
                ) : (
                  'Mint Prediction Asset'
                )}
              </button>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Status */}
          <TransactionStatus
            status={txStatus}
            txHash={txHash}
            marketId={txMarketId}
            error={error || undefined}
            explorerUrl={txExplorerUrl}
          />

          {error && txStatus !== 'failed' && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-400/30 rounded-xl text-red-200">
              {error}
            </div>
          )}
        </div>
      );
    }

