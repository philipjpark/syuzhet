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

// Create a context to track if we're in mock mode
const MockModeContext = createContext<boolean>(false);

// Export hook that works in both mock and real mode
// IMPORTANT: Always call hooks unconditionally to follow Rules of Hooks
export function useDynamicContext() {
  // Always call both hooks unconditionally
  const mockContext = useContext(MockDynamicContext);
  const isMockMode = useContext(MockModeContext);
  
  // Always call the real hook unconditionally
  // DynamicProvider is always mounted, so this will always work
  const realContext = useRealDynamicContext();
  
  // Return the appropriate context based on mode
  return isMockMode ? mockContext : realContext;
}

export function DynamicContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  // Mock mode - show app without wallet functionality
  // Check if environment ID is missing or is still the placeholder value
  const isMockMode = !environmentId || environmentId === 'your_dynamic_environment_id' || environmentId.trim() === '';

  // Always mount DynamicProvider to ensure useRealDynamicContext can be called
  // In mock mode, we'll use a dummy environment ID
  const effectiveEnvironmentId = isMockMode ? 'mock-mode' : environmentId!;
  
  return (
    <MockModeContext.Provider value={isMockMode}>
      <MockDynamicContext.Provider
        value={{
          user: { email: 'demo@syuzhet.com' },
          isAuthenticated: true,
          setShowAuthFlow: () => {},
          primaryWallet: null,
        }}
      >
        {/* Always mount DynamicProvider so useRealDynamicContext can be called */}
        <DynamicProvider
          settings={{
            environmentId: effectiveEnvironmentId,
            walletConnectors: isMockMode ? [] : [EthereumWalletConnectors],
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
      </MockDynamicContext.Provider>
    </MockModeContext.Provider>
  );
}

