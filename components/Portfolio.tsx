'use client';

import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// Mock portfolio data
const mockPortfolio = {
  totalValue: 12500.50,
  totalChange: 1250.30,
  totalChangePercent: 11.1,
  positions: [
    {
      id: '1',
      title: 'A human will land on Mars by 2038',
      shares: 100,
      avgPrice: 0.38,
      currentPrice: 0.42,
      value: 42.00,
      change: 4.00,
      changePercent: 10.5,
    },
    {
      id: '2',
      title: 'US passes national AI transparency law by 2028',
      shares: 50,
      avgPrice: 0.70,
      currentPrice: 0.68,
      value: 34.00,
      change: -1.00,
      changePercent: -2.9,
    },
  ],
};

export default function Portfolio() {
  const isPositive = mockPortfolio.totalChange >= 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-lime-200 mb-1">Portfolio</h2>
        <p className="text-green-300">Your prediction positions</p>
      </div>

      {/* Portfolio Summary - Ethereal Green Energy Style */}
      <div className="relative bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 rounded-xl p-8 mb-6 text-white shadow-2xl shadow-lime-500/20 overflow-hidden">
        {/* Glowing energy effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-lime-400/30 via-lime-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-2 font-medium">Total Portfolio Value</div>
            <div className="text-4xl font-bold">
              ${mockPortfolio.totalValue.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-2 font-medium">Total Change</div>
            <div
              className={`text-3xl font-bold flex items-center gap-2 justify-end ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
              {isPositive ? '+' : ''}${mockPortfolio.totalChange.toFixed(2)}
            </div>
            <div className={`text-lg font-semibold mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}
              {mockPortfolio.totalChangePercent.toFixed(1)}%
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Positions */}
      <div className="bg-gradient-to-br from-green-900/90 via-green-800/85 to-emerald-900/90 rounded-xl border border-lime-400/20 p-6">
        <h3 className="text-xl font-bold text-lime-200 mb-6">Your Positions</h3>
        {mockPortfolio.positions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 mx-auto text-green-400 mb-4" />
            <p className="text-green-200">No positions yet</p>
            <p className="text-sm text-green-300 mt-2">
              Start trading predictions to build your portfolio
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockPortfolio.positions.map((position) => {
              const isPosPositive = position.change >= 0;
              return (
                <div
                  key={position.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 text-lg">
                        {position.title}
                      </h4>
                      <div className="text-sm text-gray-500 font-medium">
                        {position.shares} shares @ ${position.avgPrice.toFixed(2)} avg
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 mb-1">
                        ${position.value.toFixed(2)}
                      </div>
                      <div
                        className={`text-base font-bold flex items-center gap-1 justify-end ${
                          isPosPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isPosPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {isPosPositive ? '+' : ''}${position.change.toFixed(2)} ({isPosPositive ? '+' : ''}
                        {position.changePercent.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium pt-3 border-t border-gray-100">
                    <span>Current: ${position.currentPrice.toFixed(2)}</span>
                    <span>•</span>
                    <span>Avg: ${position.avgPrice.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

