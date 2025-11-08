/**
 * Wallet Provider for Syuzhet
 * 
 * Current implementation: Dynamic Labs
 * Scaffolded for future: Circle Wallets (see lib/wallets/circleWallet.ts)
 * 
 * TODO: Add wallet provider toggle support
 * - Use getWalletProvider() from lib/wallets/types.ts
 * - Conditionally render Dynamic Labs or Circle Wallets provider
 * - See lib/wallets/circleWallet.ts for Circle Wallets integration stubs
 */
'use client';

import { DynamicContextProvider as DynamicProvider, useDynamicContext as useRealDynamicContext } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { createContext, useContext } from 'react';

// Mock context for development mode
const MockDynamicContext = createContext({
  user: { email: 'demo@syuzhet.com' },
  isAuthenticated: true,
  setShowAuthFlow: () => {},
  primaryWallet: null,
});

// Track if we're in mock mode
let isMockMode = false;

// Export hook that works in both mock and real mode
export function useDynamicContext() {
  if (isMockMode) {
    return useContext(MockDynamicContext);
  }
  // In real mode, use the actual Dynamic Labs hook
  return useRealDynamicContext();
}

export function DynamicContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  // Mock mode - show app without wallet functionality
  // Check if environment ID is missing or is still the placeholder value
  if (!environmentId || environmentId === 'your_dynamic_environment_id' || environmentId.trim() === '') {
    isMockMode = true;
    return (
      <MockDynamicContext.Provider
        value={{
          user: { email: 'demo@syuzhet.com' },
          isAuthenticated: true,
          setShowAuthFlow: () => {},
          primaryWallet: null,
        }}
      >
        {children}
      </MockDynamicContext.Provider>
    );
  }

  isMockMode = false;

  // Real mode with Dynamic Labs
  return (
    <DynamicProvider
      settings={{
        environmentId: environmentId!,
        walletConnectors: [EthereumWalletConnectors],
        appName: 'Syuzhet',
        appLogoUrl: '/syuzhet.png',
        overrides: {
          evmNetworks: [
            {
              chainId: 1243, // Arc Testnet
              chainName: 'Arc Testnet',
              nativeCurrency: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
              },
              rpcUrls: [
                process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc-testnet.arc.network',
              ],
              blockExplorerUrls: ['https://testnet-explorer.arc.network'],
            },
          ],
        },
      }}
    >
      {children}
    </DynamicProvider>
  );
}

