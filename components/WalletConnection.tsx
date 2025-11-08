/**
 * WalletConnection Component
 * 
 * Displays wallet connection status, address, network, and USDC balance
 * Works with Dynamic Labs or can use server-side wallet connection
 */

'use client';

import { useState, useEffect } from 'react';
import { useDynamicContext } from '@/components/providers/DynamicProvider';
import { getWalletBalance } from '@/lib/wallets/circleWallet';
import { fromUsdcUnits } from '@/lib/usdc';
import { Wallet, Copy, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { ARC_NETWORK } from '@/lib/arcConfig';
import axios from 'axios';

const WALLET_STORAGE_KEY = 'syuzhet_wallet_connected';

export default function WalletConnection() {
  const { primaryWallet, setShowAuthFlow, isAuthenticated } = useDynamicContext();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverWallet, setServerWallet] = useState<{ address: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load wallet connection from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
      if (storedWallet) {
        try {
          const walletData = JSON.parse(storedWallet);
          if (walletData.address) {
            setServerWallet({ address: walletData.address });
          }
        } catch (e) {
          console.error('Error loading wallet from localStorage:', e);
        }
      }
    }
  }, []);

  // Try to get server-side wallet if Dynamic Labs is not configured
  useEffect(() => {
    const fetchServerWallet = async () => {
      // Always try to fetch server wallet if Dynamic Labs wallet is not available
      if (!primaryWallet && !serverWallet) {
        try {
          const response = await axios.get('/api/wallet/connect');
          if (response.data && response.data.address) {
            const walletData = { address: response.data.address };
            setServerWallet(walletData);
            // Persist to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));
            }
          }
        } catch (error: any) {
          // Server wallet not available, that's okay
          console.log('Server wallet not available:', error.message);
        }
      } else if (primaryWallet) {
        // If Dynamic Labs wallet is connected, clear server wallet
        setServerWallet(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(WALLET_STORAGE_KEY);
        }
      }
    };

    fetchServerWallet();
  }, [primaryWallet, serverWallet]);

  // Get wallet address (prefer Dynamic Labs, fallback to server wallet)
  const walletAddress = primaryWallet?.address || serverWallet?.address || null;

  // Fetch USDC balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) {
        setBalance(null);
        return;
      }

      setIsLoadingBalance(true);
      try {
        const balanceBigInt = await getWalletBalance(walletAddress);
        const balanceFormatted = fromUsdcUnits(balanceBigInt);
        setBalance(parseFloat(balanceFormatted).toFixed(2));
      } catch (error: any) {
        console.error('Error fetching balance:', error);
        setBalance('Error');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
    
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  const handleCopyAddress = () => {
    const addressToCopy = walletAddress || serverWallet?.address;
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (address: string) => {
    return `https://testnet-explorer.arc.network/address/${address}`;
  };

  // Not connected state
  if (!walletAddress) {
    // If we have a server wallet but not authenticated, show it
    if (serverWallet) {
      // Server wallet is available, show it but indicate it's read-only
      return (
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-green-800/50 border border-lime-400/30 rounded-lg text-xs font-medium text-lime-200">
            Arc Testnet
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-800/50 border border-lime-400/30 rounded-lg">
            <span className="text-sm font-mono text-lime-200">
              {truncateAddress(serverWallet.address)}
            </span>
            <button
              onClick={handleCopyAddress}
              className="text-lime-300 hover:text-lime-200 transition-colors"
              title="Copy address"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <a
              href={getExplorerUrl(serverWallet.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-300 hover:text-lime-200 transition-colors"
              title="View on Arc Explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      );
    }

    // No wallet available, show connect button
    return (
      <button
        onClick={async () => {
          setIsConnecting(true);
          try {
            // Try to use Dynamic Labs if available and not in mock mode
            if (setShowAuthFlow && typeof setShowAuthFlow === 'function') {
              try {
                setShowAuthFlow(true);
                // Wait a bit to see if Dynamic Labs connects
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (error) {
                console.error('Error opening Dynamic Labs:', error);
              }
            }
            
            // Always try to fetch server wallet as fallback/primary method
            try {
              const response = await axios.get('/api/wallet/connect');
              if (response.data && response.data.address) {
                const walletData = { address: response.data.address };
                setServerWallet(walletData);
                // Persist to localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));
                }
              }
            } catch (error: any) {
              console.error('Error connecting server wallet:', error);
              // Don't show alert, just log - server wallet might not be available
            }
          } finally {
            setIsConnecting(false);
          }
        }}
        disabled={isConnecting}
        className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-green-950 rounded-lg font-semibold hover:bg-lime-300 transition-all shadow-lg shadow-lime-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </>
        )}
      </button>
    );
  }

  // Connected state
  return (
    <div className="flex items-center gap-3">
      {/* Network Badge */}
      <div className="px-3 py-1.5 bg-green-800/50 border border-lime-400/30 rounded-lg text-xs font-medium text-lime-200">
        Arc Testnet
      </div>

      {/* Balance */}
      <div className="px-3 py-1.5 bg-green-800/50 border border-lime-400/30 rounded-lg">
        <div className="flex items-center gap-2">
          {isLoadingBalance ? (
            <Loader2 className="w-3 h-3 animate-spin text-lime-300" />
          ) : (
            <span className="text-sm font-semibold text-lime-200">
              {balance !== null ? `$${balance} USDC` : '--'}
            </span>
          )}
        </div>
      </div>

      {/* Wallet Address */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-800/50 border border-lime-400/30 rounded-lg">
        <span className="text-sm font-mono text-lime-200">
          {truncateAddress(walletAddress)}
        </span>
        <button
          onClick={handleCopyAddress}
          className="text-lime-300 hover:text-lime-200 transition-colors"
          title="Copy address"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        <a
          href={getExplorerUrl(walletAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lime-300 hover:text-lime-200 transition-colors"
          title="View on Arc Explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

