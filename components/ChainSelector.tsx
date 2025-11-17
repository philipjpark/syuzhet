/**
 * ChainSelector Component
 * 
 * Allows users to toggle between Arc Testnet and BNB Chain Testnet
 * Features BNB Chain prominently
 */

'use client';

import { useState, useEffect } from 'react';
import { ARC_TESTNET, BNB_TESTNET, getChainConfig, type ChainId } from '@/lib/chainConfig';
import { Network, ChevronDown } from 'lucide-react';

const CHAIN_STORAGE_KEY = 'syuzhet_selected_chain';

export default function ChainSelector() {
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(BNB_TESTNET.chainId);
  const [isOpen, setIsOpen] = useState(false);

  // Load saved chain preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChainId = localStorage.getItem(CHAIN_STORAGE_KEY);
      if (savedChainId) {
        const chainId = parseInt(savedChainId) as ChainId;
        if (chainId === ARC_TESTNET.chainId || chainId === BNB_TESTNET.chainId) {
          setSelectedChainId(chainId);
        }
      }
    }
  }, []);

  // Save chain preference
  const handleChainChange = (chainId: ChainId) => {
    setSelectedChainId(chainId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHAIN_STORAGE_KEY, chainId.toString());
    }
    setIsOpen(false);
    // Trigger a page refresh to apply chain changes
    window.location.reload();
  };

  const selectedChain = getChainConfig(selectedChainId) || BNB_TESTNET;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-lg font-semibold text-white hover:from-yellow-500/30 hover:to-orange-500/30 hover:border-yellow-400/70 transition-all shadow-lg shadow-yellow-500/20"
      >
        <Network className="w-4 h-4" />
        <span className="text-sm font-bold">
          {selectedChainId === BNB_TESTNET.chainId ? '🌐 BNB Chain' : '🔷 Arc Testnet'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-gradient-to-br from-green-700/95 to-green-800/95 border-2 border-lime-400/50 rounded-xl shadow-2xl z-20 overflow-hidden">
            <div className="p-2">
              {/* BNB Chain - Featured Prominently */}
              <button
                onClick={() => handleChainChange(BNB_TESTNET.chainId)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedChainId === BNB_TESTNET.chainId
                    ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400/70 shadow-lg shadow-yellow-500/30'
                    : 'bg-green-600/30 border border-lime-400/20 hover:bg-green-600/50 hover:border-lime-400/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🌐</span>
                      <span className="font-bold text-white text-lg">BNB Chain Testnet</span>
                      {selectedChainId === BNB_TESTNET.chainId && (
                        <span className="px-2 py-0.5 bg-yellow-400/30 text-yellow-200 text-xs font-semibold rounded">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-green-200 mt-1">Chain ID: {BNB_TESTNET.chainId}</p>
                    <p className="text-xs text-green-300 mt-0.5">USDC: 18 decimals</p>
                  </div>
                </div>
              </button>

              <div className="h-2" />

              {/* Arc Testnet */}
              <button
                onClick={() => handleChainChange(ARC_TESTNET.chainId)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedChainId === ARC_TESTNET.chainId
                    ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-2 border-blue-400/70 shadow-lg shadow-blue-500/30'
                    : 'bg-green-600/30 border border-lime-400/20 hover:bg-green-600/50 hover:border-lime-400/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🔷</span>
                      <span className="font-bold text-white text-lg">Arc Testnet</span>
                      {selectedChainId === ARC_TESTNET.chainId && (
                        <span className="px-2 py-0.5 bg-blue-400/30 text-blue-200 text-xs font-semibold rounded">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-green-200 mt-1">Chain ID: {ARC_TESTNET.chainId}</p>
                    <p className="text-xs text-green-300 mt-0.5">USDC: 6 decimals</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

