'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Calendar,
  DollarSign,
  Settings,
  Eye
} from 'lucide-react';
import { GeneratedPrediction } from '@/lib/ai/predictions';
import axios from 'axios';
import { useDynamicContext } from '@/components/providers/DynamicProvider';
import { ethers } from 'ethers';
import { getPredictionMarketContract, getUsdcContract, toUsdcUnits } from '@/lib/contracts';
import { PREDICTION_MARKET_ADDRESS, USDC_ADDRESS, ARC_NETWORK } from '@/lib/arcConfig';
import { useRouter } from 'next/navigation';

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

  const handleGenerate = async () => {
    if (!corpusSummary.trim()) {
      setError('Please enter your idea and research notes');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post('/api/predictions', {
        corpusSummary,
        userNotes: userNotes || undefined,
        preferences: preferences.timeHorizon ? preferences : undefined,
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
    if (!primaryWallet) {
      setError('Please connect your wallet');
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      // Get signer from wallet
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // Check network
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== ARC_NETWORK.chainId) {
        throw new Error(`Please switch to ${ARC_NETWORK.name} (Chain ID: ${ARC_NETWORK.chainId})`);
      }

      const marketContract = getPredictionMarketContract(signer);
      const usdcContract = getUsdcContract(signer);

      // Approve USDC
      const liquidityAmount = toUsdcUnits(editedPrediction.parameters.initialLiquidityUsdc);
      const approveTx = await usdcContract.approve(PREDICTION_MARKET_ADDRESS, liquidityAmount);
      await approveTx.wait();

      // Create market
      const createTx = await marketContract.createMarket(
        editedPrediction.title,
        editedPrediction.thesis,
        editedPrediction.parameters.expiryTimestamp,
        liquidityAmount
      );

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
        router.push(`/markets/${marketId}`);
      } else {
        setError('Market created but could not extract market ID. Check transaction receipt.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mint prediction market');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { id: 'input', label: 'Idea & Corpus', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'review', label: 'Review & Edit', icon: <Eye className="w-4 h-4" /> },
            { id: 'mint', label: 'Mint On-Chain', icon: <Settings className="w-4 h-4" /> },
          ].map((step, index) => {
            const stepIndex = ['input', 'review', 'mint'].indexOf(currentStep);
            const isActive = index === stepIndex;
            const isCompleted = index < stepIndex;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
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
                  <span className={`text-xs mt-2 font-medium ${isActive || isCompleted ? 'text-lime-200' : 'text-green-400'}`}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`h-1 flex-1 mx-2 transition-all ${index < stepIndex ? 'bg-lime-400' : 'bg-green-700/50'}`} />
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
            <div>
              <label className="block text-sm font-medium text-lime-200 mb-2">
                Research Corpus & Notes *
              </label>
              <textarea
                value={corpusSummary}
                onChange={(e) => setCorpusSummary(e.target.value)}
                placeholder="Paste your research, articles, notes, links, or any relevant information here..."
                className="w-full h-64 px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white placeholder-green-400 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-lime-200 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Any additional context or preferences..."
                className="w-full h-32 px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white placeholder-green-400 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lime-200 mb-2">
                  Time Horizon (Optional)
                </label>
                <input
                  type="text"
                  value={preferences.timeHorizon}
                  onChange={(e) => setPreferences({ ...preferences, timeHorizon: e.target.value })}
                  placeholder="e.g., by 2035, within 3 years"
                  className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white placeholder-green-400 focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lime-200 mb-2">
                  Risk Tolerance
                </label>
                <select
                  value={preferences.riskTolerance}
                  onChange={(e) => setPreferences({ ...preferences, riskTolerance: e.target.value })}
                  className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
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

            {!primaryWallet && (
              <div className="bg-yellow-900/50 border border-yellow-400/30 rounded-xl p-4 text-yellow-200">
                Please connect your wallet to mint the prediction market.
              </div>
            )}

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
                disabled={isMinting || !primaryWallet}
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

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-400/30 rounded-xl text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}

