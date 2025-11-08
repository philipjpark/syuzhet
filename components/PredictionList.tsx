'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';
import PredictionCard from './PredictionCard';

// Mock data - in production, this would come from the blockchain
const mockPredictions = [
  {
    id: '1',
    title: 'A human will land on Mars by 2038',
    description: 'Based on SpaceX Starship progress and NASA funding',
    probability: 0.42,
    currentPrice: 0.42,
    priceChange: 0.05,
    volume: 125000,
    timeframe: 'by 2038',
    category: 'long-horizon speculative',
    holders: 234,
  },
  {
    id: '2',
    title: 'US passes national AI transparency law by 2028',
    description: 'Growing regulatory momentum and bipartisan support',
    probability: 0.68,
    currentPrice: 0.68,
    priceChange: -0.02,
    volume: 89000,
    timeframe: 'by 2028',
    category: 'policy',
    holders: 156,
  },
  {
    id: '3',
    title: 'Tesla autonomous taxi network approved in one US state by 2027',
    description: 'Regulatory progress and technology milestones',
    probability: 0.55,
    currentPrice: 0.55,
    priceChange: 0.12,
    volume: 210000,
    timeframe: 'by 2027',
    category: 'technology',
    holders: 412,
  },
];

export default function PredictionList() {
  const [predictions, setPredictions] = useState(mockPredictions);
  const [sortBy, setSortBy] = useState<'price' | 'volume' | 'probability'>('volume');

  const sortedPredictions = [...predictions].sort((a, b) => {
    if (sortBy === 'price') return b.currentPrice - a.currentPrice;
    if (sortBy === 'volume') return b.volume - a.volume;
    return b.probability - a.probability;
  });

  return (
    <div className="bg-gradient-to-br from-green-900/90 via-green-800/85 to-emerald-900/90 rounded-xl p-6 border border-lime-400/20">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-lime-200 mb-1">Market</h2>
          <p className="text-green-300">Trade predictions like stocks</p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2.5 bg-green-900/50 border border-lime-400/30 rounded-lg text-sm font-medium text-lime-200 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 cursor-pointer"
        >
          <option value="volume">Volume</option>
          <option value="price">Price</option>
          <option value="probability">Probability</option>
        </select>
      </div>

      <div className="space-y-3">
        {sortedPredictions.map((prediction) => (
          <PredictionCard key={prediction.id} prediction={prediction} />
        ))}
      </div>
    </div>
  );
}

