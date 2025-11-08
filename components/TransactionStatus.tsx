/**
 * TransactionStatus Component
 * 
 * Displays real-time transaction status with Arc Explorer link
 */

'use client';

import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

export type TransactionStatusType = 'idle' | 'pending' | 'confirmed' | 'failed';

interface TransactionStatusProps {
  status: TransactionStatusType;
  txHash?: string;
  marketId?: number;
  error?: string;
  explorerUrl?: string;
}

export default function TransactionStatus({
  status,
  txHash,
  marketId,
  error,
  explorerUrl,
}: TransactionStatusProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="mt-6 p-4 rounded-xl border-2">
      {status === 'pending' && (
        <div className="bg-yellow-900/50 border-yellow-400/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
            <div className="flex-1">
              <h3 className="text-yellow-200 font-semibold">Transaction Pending</h3>
              <p className="text-yellow-300 text-sm mt-1">
                Waiting for confirmation on Arc Testnet...
              </p>
              {txHash && (
                <p className="text-yellow-400 text-xs mt-2 font-mono">
                  {txHash.slice(0, 20)}...{txHash.slice(-10)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {status === 'confirmed' && (
        <div className="bg-green-900/50 border-green-400/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="flex-1">
              <h3 className="text-green-200 font-semibold">Transaction Confirmed!</h3>
              {marketId !== undefined && (
                <p className="text-green-300 text-sm mt-1">
                  Market #{marketId} created successfully
                </p>
              )}
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm mt-2 transition-colors"
                >
                  View on Arc Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="bg-red-900/50 border-red-400/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1">
              <h3 className="text-red-200 font-semibold">Transaction Failed</h3>
              <p className="text-red-300 text-sm mt-1">
                {error || 'An error occurred while creating the market'}
              </p>
              {txHash && explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm mt-2 transition-colors"
                >
                  View on Arc Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

