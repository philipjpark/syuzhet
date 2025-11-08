'use client';

import { PredictionThesis } from '@/lib/ai/predictionGenerator';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface PredictionPreviewProps {
  prediction: PredictionThesis;
}

export default function PredictionPreview({ prediction }: PredictionPreviewProps) {
  const getProbabilityColor = (prob: number) => {
    if (prob < 0.3) return 'text-red-600 bg-red-50';
    if (prob < 0.6) return 'text-yellow-600 bg-yellow-50';
    if (prob < 0.85) return 'text-green-600 bg-green-50';
    return 'text-green-800 bg-green-50';
  };

  const getConfidenceIcon = (confidence: string) => {
    if (confidence === 'high') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (confidence === 'medium') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{prediction.title}</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getProbabilityColor(prediction.probability)}`}>
          {(prediction.probability * 100).toFixed(0)}%
        </div>
      </div>

      <p className="text-gray-700 mb-4">{prediction.description}</p>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">Timeframe:</span>
          <span>{prediction.timeframe}</span>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Evidence:</h4>
        <div className="space-y-2">
          {prediction.evidence.map((ev, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 flex items-start gap-2">
              {getConfidenceIcon(ev.confidence)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {ev.type}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {ev.confidence} confidence
                  </span>
                </div>
                <p className="text-sm text-gray-700">{ev.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-green-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Market Suggestion</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Suggested Price:</span>
            <span className="ml-2 font-semibold text-gray-900">
              ${prediction.market_suggestion.suggested_yes_price_usd.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {prediction.market_suggestion.category}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Risk Grade:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {prediction.market_suggestion.risk_grade}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Volatility:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {prediction.market_suggestion.expected_volatility}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-green-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-900">
          Publish to Market
        </button>
        <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300">
          Edit Prediction
        </button>
      </div>
    </div>
  );
}

