'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import NarrativeUpdatesFeed from '@/components/NarrativeUpdatesFeed';
import { getPredictionMarketContract } from '@/lib/contracts';
import { PREDICTION_MARKET_ADDRESS } from '@/lib/arcConfig';
import { getCurrentChain, getExplorerAddressUrl } from '@/lib/chainConfig';
import { Clock, User, DollarSign, ExternalLink } from 'lucide-react';
import { useDynamicContext } from '@/components/providers/DynamicProvider';

interface Market {
  title: string;
  thesis: string;
  expiry: number;
  creator: string;
  resolved: boolean;
  outcome: boolean;
  totalYesShares: number;
  totalNoShares: number;
  liquidityUsdc: number;
}

interface Update {
  id: string;
  text: string;
  probability: number;
  reasoning: string[];
  timestamp: number;
  uri?: string;
}

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = Number(params.id);
  const [market, setMarket] = useState<Market | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMarket = useCallback(async () => {
    try {
      // Dynamically import ethers to avoid bundling issues
      const { ethers } = await import('ethers');
      const { getCurrentChain } = await import('@/lib/chainConfig');
      
      // Get provider using current chain RPC (chain-aware)
      const currentChain = getCurrentChain();
      
      // Get chain-specific contract address
      const contractAddress = currentChain.predictionMarketAddress || PREDICTION_MARKET_ADDRESS;
      if (!contractAddress) {
        setError(`Prediction market contract not configured for ${currentChain.name}`);
        setIsLoading(false);
        return;
      }
      
      const provider = new ethers.JsonRpcProvider(currentChain.rpcUrl);
      
      // Use chain-specific contract address
      const { getPredictionMarketContract } = await import('@/lib/contracts');
      const marketContract = await getPredictionMarketContract(provider, contractAddress);
      const marketData = await marketContract.getMarket(marketId);

      // Convert liquidity from chain-specific USDC units (6 for Arc, 18 for BNB)
      const liquidityUsdc = Number(ethers.formatUnits(marketData.liquidityUsdc, currentChain.usdcDecimals));

      setMarket({
        title: marketData.title,
        thesis: marketData.thesis,
        expiry: Number(marketData.expiry),
        creator: marketData.creator,
        resolved: marketData.resolved,
        outcome: marketData.outcome,
        totalYesShares: Number(marketData.totalYesShares),
        totalNoShares: Number(marketData.totalNoShares),
        liquidityUsdc,
      });

      // TODO: Load updates from contract events or database
      // For now, use empty array
    } catch (err: any) {
      setError(err.message || 'Failed to load market');
    } finally {
      setIsLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    // Only load market data on client side to avoid SSR issues with ethers
    if (typeof window !== 'undefined') {
      loadMarket();
    }
  }, [marketId, loadMarket]);

  const handleUpdateAdded = (update: Update) => {
    setUpdates((prev) => [update, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-green-600">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-white">Loading market...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-green-600">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-200 mb-4">{error || 'Market not found'}</div>
            <button
              onClick={() => router.push('/app')}
              className="px-6 py-3 bg-lime-400 text-green-950 rounded-xl font-semibold hover:bg-lime-300"
            >
              Back to Markets
            </button>
          </div>
        </main>
      </div>
    );
  }

  const expiryDate = new Date(market.expiry * 1000);
  const isExpired = expiryDate < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-green-600">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/app')}
            className="text-lime-200 hover:text-lime-300 mb-4"
          >
            ← Back to Markets
          </button>
        </div>

        {/* Market Header */}
        <div className="bg-gradient-to-br from-green-700/95 via-green-600/90 to-emerald-700/95 rounded-2xl shadow-2xl border border-lime-400/20 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-lime-200 mb-4">{market.title}</h1>
              <p className="text-white text-lg mb-6">{market.thesis}</p>
            </div>
            {isExpired && (
              <div className="ml-4 px-4 py-2 bg-red-900/50 border border-red-400/30 rounded-lg text-red-200">
                Expired
              </div>
            )}
            {market.resolved && (
              <div className="ml-4 px-4 py-2 bg-lime-900/50 border border-lime-400/30 rounded-lg text-lime-200">
                {market.outcome ? 'YES' : 'NO'}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-lime-400/20">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-lime-300" />
              <div>
                <div className="text-sm text-white/60">Expiry</div>
                <div className="text-lg font-semibold text-white">{expiryDate.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-lime-300" />
              <div>
                <div className="text-sm text-white/60">Creator</div>
                <div className="text-lg font-mono text-white">{market.creator.slice(0, 8)}...{market.creator.slice(-6)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-lime-300" />
              <div>
                <div className="text-sm text-white/60">Liquidity</div>
                <div className="text-lg font-semibold text-white">{market.liquidityUsdc.toLocaleString()} USDC</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-lime-400/20">
            {(() => {
              const currentChain = getCurrentChain();
              const contractAddress = currentChain.predictionMarketAddress || PREDICTION_MARKET_ADDRESS;
              if (contractAddress) {
                return (
                  <a
                    href={getExplorerAddressUrl(currentChain.chainId, contractAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-lime-200 hover:text-lime-300 text-sm"
                  >
                    View on {currentChain.name} Explorer
                    <ExternalLink className="w-4 h-4" />
                  </a>
                );
              }
              return null;
            })()}
            <span className="mx-2 text-white/40">•</span>
            <span className="text-white/60 text-sm">Market ID: {marketId}</span>
          </div>
        </div>

        {/* Narrative Updates */}
        <div className="bg-gradient-to-br from-green-700/95 via-green-600/90 to-emerald-700/95 rounded-2xl shadow-2xl border border-lime-400/20 p-8">
          <NarrativeUpdatesFeed
            marketId={marketId}
            marketThesis={market.thesis}
            updates={updates}
            onUpdateAdded={handleUpdateAdded}
          />
        </div>
      </main>
    </div>
  );
}

