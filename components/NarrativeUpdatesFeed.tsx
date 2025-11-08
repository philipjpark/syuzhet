'use client';

import { useState } from 'react';
import { RefreshCw, Loader2, Send, Sparkles } from 'lucide-react';
import axios from 'axios';
import { NarrativeUpdate } from '@/lib/ai/predictions';

interface Update {
  id: string;
  text: string;
  probability: number;
  reasoning: string[];
  timestamp: number;
  uri?: string;
}

interface NarrativeUpdatesFeedProps {
  marketId: number;
  marketThesis: string;
  updates: Update[];
  onUpdateAdded: (update: Update) => void;
}

export default function NarrativeUpdatesFeed({
  marketId,
  marketThesis,
  updates,
  onUpdateAdded,
}: NarrativeUpdatesFeedProps) {
  const [newEvidence, setNewEvidence] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedUpdate, setSuggestedUpdate] = useState<NarrativeUpdate | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateUpdate = async () => {
    if (!newEvidence.trim()) {
      setError('Please enter new evidence');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const lastUpdate = updates.length > 0 ? updates[updates.length - 1].text : undefined;
      
      const response = await axios.post(`/api/predictions/${marketId}/updates`, {
        marketThesis,
        lastUpdate,
        newEvidence,
      });

      setSuggestedUpdate(response.data.update);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate update');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishUpdate = async () => {
    if (!suggestedUpdate) return;

    setIsPublishing(true);
    setError(null);

    try {
      // TODO: Pin to IPFS and get hash
      // For now, use inline text as URI
      const updateUri = `data:text/plain;base64,${btoa(suggestedUpdate.updateText)}`;
      const probabilityPercent = Math.round(suggestedUpdate.newSuggestedProbability * 100);

      // TODO: Call recordNarrativeUpdate on contract
      // const marketContract = getPredictionMarketContract(signer);
      // await marketContract.recordNarrativeUpdate(marketId, updateUri, probabilityPercent);

      // For now, just add to local state
      const newUpdate: Update = {
        id: Date.now().toString(),
        text: suggestedUpdate.updateText,
        probability: suggestedUpdate.newSuggestedProbability,
        reasoning: suggestedUpdate.reasoningBullets,
        timestamp: Date.now(),
        uri: updateUri,
      };

      onUpdateAdded(newUpdate);
      setSuggestedUpdate(null);
      setNewEvidence('');
    } catch (err: any) {
      setError(err.message || 'Failed to publish update');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-lime-200 mb-2 flex items-center gap-2">
          <RefreshCw className="w-6 h-6" />
          Narrative Updates
        </h3>
        <p className="text-white">Post new evidence and developments related to this prediction.</p>
      </div>

      {/* New Update Form */}
      <div className="bg-green-700/50 rounded-xl p-6 border border-lime-400/20">
        <label className="block text-sm font-medium text-lime-200 mb-2">
          New Evidence / Developments
        </label>
        <textarea
          value={newEvidence}
          onChange={(e) => setNewEvidence(e.target.value)}
          placeholder="Paste new research, news, developments, or evidence..."
          className="w-full h-32 px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white placeholder-green-400 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
        />
        <button
          onClick={handleGenerateUpdate}
          disabled={isGenerating || !newEvidence.trim()}
          className="mt-4 px-6 py-3 bg-lime-400 text-green-950 rounded-xl font-semibold hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-lime-500/50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Update...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              AI Draft Update
            </>
          )}
        </button>
      </div>

      {/* Suggested Update Preview */}
      {suggestedUpdate && (
        <div className="bg-green-800/50 rounded-xl p-6 border border-lime-400/20">
          <h4 className="text-lg font-semibold text-lime-200 mb-4">Suggested Update</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-lime-200 mb-2">Update Text</label>
              <textarea
                value={suggestedUpdate.updateText}
                onChange={(e) => setSuggestedUpdate({ ...suggestedUpdate, updateText: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-lime-400/30 rounded-xl bg-green-700/30 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lime-200 mb-2">
                New Suggested Probability: {(suggestedUpdate.newSuggestedProbability * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={suggestedUpdate.newSuggestedProbability}
                onChange={(e) => setSuggestedUpdate({ ...suggestedUpdate, newSuggestedProbability: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lime-200 mb-2">Reasoning</label>
              <ul className="list-disc list-inside space-y-1 text-white text-sm">
                {suggestedUpdate.reasoningBullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setSuggestedUpdate(null)}
                className="flex-1 px-6 py-3 bg-green-700/50 text-lime-200 rounded-xl font-medium hover:bg-green-700/70 transition-all border border-lime-400/20"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishUpdate}
                disabled={isPublishing}
                className="flex-1 px-6 py-3 bg-lime-400 text-green-950 rounded-xl font-semibold hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-lime-500/50 flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Publish Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Updates List */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            No updates yet. Be the first to post new evidence!
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className="bg-green-700/50 rounded-xl p-6 border border-lime-400/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm text-white/60">
                  {new Date(update.timestamp).toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-lime-200">
                  {(update.probability * 100).toFixed(1)}% probability
                </div>
              </div>
              <p className="text-white mb-3">{update.text}</p>
              {update.reasoning.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-white/80 text-sm">
                  {update.reasoning.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-400/30 rounded-xl text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}

