'use client';

import { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

interface Prediction {
  id: string;
  title: string;
  currentPrice: number;
  probability: number;
}

interface TradeModalProps {
  prediction: Prediction;
  onClose: () => void;
}

export default function TradeModal({ prediction, onClose }: TradeModalProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState<string>('');
  const [usdcAmount, setUsdcAmount] = useState<string>('');

  const handleSharesChange = (value: string) => {
    setShares(value);
    if (value && !isNaN(parseFloat(value))) {
      setUsdcAmount((parseFloat(value) * prediction.currentPrice).toFixed(2));
    } else {
      setUsdcAmount('');
    }
  };

  const handleUsdcChange = (value: string) => {
    setUsdcAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      setShares((parseFloat(value) / prediction.currentPrice).toFixed(2));
    } else {
      setShares('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">{prediction.title}</h2>
        <p className="text-sm text-gray-600 mb-6">
          Current Price: <span className="font-semibold">${prediction.currentPrice.toFixed(2)}</span>
        </p>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                tradeType === 'buy'
                  ? 'bg-green-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Buy Yes
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                tradeType === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingDown className="w-4 h-4 inline mr-2" />
              Sell Yes
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shares
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => handleSharesChange(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                USDC Amount
              </label>
              <input
                type="number"
                value={usdcAmount}
                onChange={(e) => handleUsdcChange(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent"
              />
            </div>
          </div>

          {shares && usdcAmount && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
              <div className="text-xl font-bold text-gray-900">
                {usdcAmount} USDC
              </div>
              <div className="text-xs text-gray-500 mt-1">
                for {shares} shares at ${prediction.currentPrice.toFixed(2)} each
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // TODO: Execute trade on Arc Testnet
              // 1. Get user's wallet address and signer
              // 2. Call PredictionMarket.buyShares() or sellShares()
              // 3. Contract address: import from @/lib/arcConfig
              // 4. Handle USDC approval if needed (ERC20 approve)
              // 5. Execute transaction and wait for confirmation
              // 6. Update UI with transaction hash
              // Example:
              //   const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, ABI, signer);
              //   const tx = await contract.buyShares(predictionId, shares);
              //   await tx.wait();
              alert('Trade execution will be implemented with smart contract integration');
              onClose();
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${
              tradeType === 'buy'
                ? 'bg-green-800 hover:bg-green-900'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {tradeType === 'buy' ? 'Buy' : 'Sell'} {shares || '0'} Shares
          </button>
        </div>
      </div>
    </div>
  );
}

