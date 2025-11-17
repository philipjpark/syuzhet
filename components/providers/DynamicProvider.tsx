/**
 * Wallet Provider for Syuzhet
 * 
 * Current implementation: Dynamic Labs
 * Scaffolded for future: Circle Wallets (see lib/wallets/circleWallet.ts)
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
export function useDynamicContext() {
  // Always call both hooks unconditionally
  const mockContext = useContext(MockDynamicContext);
  const isMockMode = useContext(MockModeContext);
  
  // Always call useRealDynamicContext - it will work because DynamicProvider is always mounted
  // In mock mode, the API call will fail, but the hook itself will still work
  const realContext = useRealDynamicContext();
  
  // Return the appropriate context based on mode
  // In mock mode, use mock context. In real mode, use real context.
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
  // In mock mode, use a dummy environment ID - the API call will fail but that's okay
  // We suppress the error in the console/UI
  const effectiveEnvironmentId = isMockMode ? 'mock-mode-placeholder' : environmentId!;
  
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
                // Arc Testnet
                {
                  chainId: 1243,
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
                // BNB Chain Mainnet
                {
                  chainId: 56,
                  chainName: 'BNB Chain',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18,
                  },
                  rpcUrls: [
                    process.env.NEXT_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed1.binance.org',
                  ],
                  blockExplorerUrls: ['https://bscscan.com'],
                },
                // BNB Chain Testnet
                {
                  chainId: 97,
                  chainName: 'BNB Chain Testnet',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18,
                  },
                  rpcUrls: [
                    process.env.NEXT_PUBLIC_BNB_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
                  ],
                  blockExplorerUrls: ['https://testnet.bscscan.com'],
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
