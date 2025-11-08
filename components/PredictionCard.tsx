'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Users, ChevronRight } from 'lucide-react';
import TradeModal from './TradeModal';

interface Prediction {
  id: string;
  title: string;
  description: string;
  probability: number;
  currentPrice: number;
  priceChange: number;
  volume: number;
  timeframe: string;
  category: string;
  holders: number;
}

interface PredictionCardProps {
  prediction: Prediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const isPositive = prediction.priceChange >= 0;

  return (
    <>
      <div className="bg-gradient-to-br from-green-900/90 via-green-800/80 to-emerald-900/90 rounded-xl border border-lime-400/30 p-6 hover:border-lime-400/60 hover:shadow-2xl hover:shadow-lime-500/20 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-lime-200 mb-1 group-hover:text-lime-300 transition-colors">
              {prediction.title}
            </h3>
            <p className="text-sm text-green-200 mb-3 line-clamp-2">{prediction.description}</p>
            <div className="flex items-center gap-4 text-xs text-green-300">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{prediction.timeframe}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{prediction.holders} holders</span>
              </div>
                  <span className="px-2 py-0.5 bg-lime-400/20 rounded-full text-lime-200 text-xs font-medium border border-lime-400/30">
                    {prediction.category}
                  </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-green-300 group-hover:text-lime-300 transition-colors" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-lime-400/20">
          <div className="flex items-center gap-8">
            <div>
                  <div className="text-xs text-green-300 mb-1 font-medium">Price</div>
                  <div className="text-2xl font-bold text-lime-200">
                ${prediction.currentPrice.toFixed(2)}
              </div>
            </div>
            <div>
                  <div className="text-xs text-green-300 mb-1 font-medium">24h</div>
              <div
                className={`text-lg font-bold flex items-center gap-1 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {isPositive ? '+' : ''}
                {(prediction.priceChange * 100).toFixed(1)}%
              </div>
            </div>
            <div>
                  <div className="text-xs text-green-300 mb-1 font-medium">Volume</div>
                  <div className="text-lg font-semibold text-lime-200">
                ${(prediction.volume / 1000).toFixed(0)}k
              </div>
            </div>
            <div>
                  <div className="text-xs text-green-300 mb-1 font-medium">Prob</div>
                  <div className="text-lg font-semibold text-lime-200">
                {(prediction.probability * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowTradeModal(true)}
            className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-green-950 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl shadow-lime-500/50"
          >
            Trade
          </button>
        </div>
      </div>

      {showTradeModal && (
        <TradeModal
          prediction={prediction}
          onClose={() => setShowTradeModal(false)}
        />
      )}
    </>
  );
}

