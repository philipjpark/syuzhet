'use client';

import { CheckCircle, Clock, User } from 'lucide-react';

interface PredictionCardProps {
  title: string;
  thesis: string;
  expiry: number;
  creator: string;
  liquidityUsdc: number;
  marketId: number;
  onClick?: () => void;
}

export default function PredictionCard({
  title,
  thesis,
  expiry,
  creator,
  liquidityUsdc,
  marketId,
  onClick,
}: PredictionCardProps) {
  const expiryDate = new Date(expiry * 1000);
  const isExpired = expiryDate < new Date();

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-green-700/90 via-green-600/80 to-emerald-700/90 rounded-xl border border-lime-400/30 p-6 hover:border-lime-400/60 hover:shadow-2xl hover:shadow-lime-500/20 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-lime-200 mb-2">{title}</h3>
          <p className="text-white text-sm mb-4 line-clamp-2">{thesis}</p>
        </div>
        {isExpired && (
          <div className="ml-4 px-3 py-1 bg-red-900/50 border border-red-400/30 rounded-lg text-red-200 text-sm rounded">
            Expired
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-white/80">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{expiryDate.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span className="font-mono text-xs">{creator.slice(0, 6)}...{creator.slice(-4)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold">{liquidityUsdc.toLocaleString()} USDC</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-lime-400/20">
        <span className="text-xs text-white/60">Market ID: {marketId}</span>
      </div>
    </div>
  );
}
