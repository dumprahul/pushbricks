/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Push Chain Context Provider
 * Provides Push Chain client and wallet state throughout the application
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  getPushChainClient, 
  resetPushChainClient,
  getCurrentWalletAddress,
  getCurrentChainId,
  isWalletConnected,
  switchToPushChainNetwork,
  type PushChainConfig
} from '@/lib/pushChainClient';

// Types
interface PushChainContextType {
  client: any;
  isConnected: boolean;
  isInitialized: boolean;
  walletAddress: string | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
  initializeClient: (config?: PushChainConfig) => Promise<void>;
  resetClient: () => void;
  switchToPushChain: () => Promise<boolean>;
  refreshWalletInfo: () => Promise<void>;
}

// Create context
const PushChainContext = createContext<PushChainContextType | null>(null);

// Hook to use Push Chain context
export const usePushChain = (): PushChainContextType => {
  const context = useContext(PushChainContext);
  if (!context) {
    throw new Error('usePushChain must be used within a PushChainProvider');
  }
  return context;
};

// Provider component
interface PushChainProviderProps {
  children: ReactNode;
  config?: PushChainConfig;
}

export const PushChainProvider: React.FC<PushChainProviderProps> = ({ 
  children, 
  config = { network: 'testnet' } 
}) => {
  const [client, setClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Push Chain client
  const initializeClient = useCallback(async (clientConfig?: PushChainConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Initializing Push Chain client...');
      
      // Check if wallet is connected
      if (!isWalletConnected()) {
        throw new Error('No wallet found. Please install MetaMask or another wallet.');
      }

      // Get wallet info
      const address = await getCurrentWalletAddress();
      const currentChainId = await getCurrentChainId();
      
      setWalletAddress(address);
      setChainId(currentChainId);
      setIsConnected(true);

      // Initialize Push Chain client
      const pushChainClient = await getPushChainClient(clientConfig || config);
      setClient(pushChainClient);
      setIsInitialized(true);
      
      console.log('Push Chain client initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Push Chain client';
      setError(errorMessage);
      console.error('Failed to initialize Push Chain client:', err);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Reset client
  const resetClient = () => {
    resetPushChainClient();
    setClient(null);
    setIsInitialized(false);
    setWalletAddress(null);
    setChainId(null);
    setError(null);
    console.log('Push Chain client reset');
  };

  // Switch to Push Chain network
  const switchToPushChain = async (): Promise<boolean> => {
    try {
      const success = await switchToPushChainNetwork();
      if (success) {
        // Refresh wallet info after network switch
        await refreshWalletInfo();
      }
      return success;
    } catch (err) {
      console.error('Failed to switch to Push Chain network:', err);
      return false;
    }
  };

  // Refresh wallet information
  const refreshWalletInfo = async () => {
    try {
      const address = await getCurrentWalletAddress();
      const currentChainId = await getCurrentChainId();
      
      setWalletAddress(address);
      setChainId(currentChainId);
      setIsConnected(!!address);
    } catch (err) {
      console.error('Failed to refresh wallet info:', err);
    }
  };

  // Auto-initialize on mount if wallet is connected
  useEffect(() => {
    const autoInitialize = async () => {
      if (isWalletConnected() && !isInitialized && !isLoading) {
        await initializeClient();
      }
    };

    autoInitialize();
  }, [initializeClient, isInitialized, isLoading]);

  // Listen for wallet account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Wallet accounts changed:', accounts);
      if (accounts.length === 0) {
        // Wallet disconnected
        resetClient();
      } else {
        // Wallet connected or switched
        refreshWalletInfo();
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Wallet chain changed:', chainId);
      refreshWalletInfo();
    };

    // Add event listeners
    (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    (window as any).ethereum.on('chainChanged', handleChainChanged);

    // Cleanup
    return () => {
      if ((window as any).ethereum.removeListener) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isInitialized]);

  const contextValue: PushChainContextType = {
    client,
    isConnected,
    isInitialized,
    walletAddress,
    chainId,
    isLoading,
    error,
    initializeClient,
    resetClient,
    switchToPushChain,
    refreshWalletInfo,
  };

  return (
    <PushChainContext.Provider value={contextValue}>
      {children}
    </PushChainContext.Provider>
  );
};

// Hook for wallet connection status
export const useWalletConnection = () => {
  const { isConnected, walletAddress, chainId, isLoading, error } = usePushChain();
  
  return {
    isConnected,
    walletAddress,
    chainId,
    isLoading,
    error,
  };
};

// Hook for Push Chain client
export const usePushChainClient = () => {
  const { client, isInitialized, error } = usePushChain();
  
  return {
    client,
    isInitialized,
    error,
  };
};
