/**
 * Wallet Connection Component
 * Demonstrates Push Chain integration with wallet connection
 */

'use client';

import React from 'react';
import { usePushChain, useWalletConnection } from '@/contexts/PushChainContext';

export const WalletConnection: React.FC = () => {
  const { 
    initializeClient, 
    resetClient, 
    switchToPushChain,
    refreshWalletInfo 
  } = usePushChain();
  
  const { 
    isConnected, 
    walletAddress, 
    chainId, 
    isLoading, 
    error 
  } = useWalletConnection();

  const handleConnect = async () => {
    try {
      await initializeClient();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const handleDisconnect = () => {
    resetClient();
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToPushChain();
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshWalletInfo();
    } catch (err) {
      console.error('Failed to refresh wallet info:', err);
    }
  };

  return (
    <div className="rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)]">
      <h3 className="text-lg font-extrabold mb-4">Push Chain Wallet Connection</h3>
      
      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-bold">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {walletAddress && (
          <div className="text-xs font-mono bg-gray-100 p-2 rounded">
            Address: {walletAddress}
          </div>
        )}
        
        {chainId && (
          <div className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
            Chain ID: {chainId}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-none border-2 border-border shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)] disabled:opacity-50"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-none border-2 border-border shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)]"
            >
              Disconnect
            </button>
            
            <button
              onClick={handleSwitchNetwork}
              className="px-4 py-2 bg-[var(--color-secondary)] text-white text-sm font-bold rounded-none border-2 border-border shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)]"
            >
              Switch to Push Chain
            </button>
            
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[var(--color-accent)] text-foreground text-sm font-bold rounded-none border-2 border-border shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)]"
            >
              Refresh
            </button>
          </>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            Initializing Push Chain client...
          </div>
        </div>
      )}
    </div>
  );
};
