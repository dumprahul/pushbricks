/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Push Chain Integration Test Page
 * Demonstrates the Push Chain SDK integration
 */

'use client';

import React, { useState } from 'react';
import { usePushChain, useWalletConnection } from '@/contexts/PushChainContext';
import { createContractService, convertPricingToContractFormat } from '@/services/contractService';
import { WalletConnection } from '@/components/WalletConnection';
import Footer from '@/components/footer';
import SiteHeader from '@/components/header';

export default function TestPushChainPage() {
  const { client, isInitialized } = usePushChain();
  const { isConnected, walletAddress } = useWalletConnection();
  
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contractService, setContractService] = useState<any>(null);

  // Test contract service creation
  const testContractService = async () => {
    setIsLoading(true);
    setTestResult('Creating contract service...');
    
    try {
      const service = await createContractService();
      setContractService(service);
      setTestResult('✅ Contract service created successfully!');
    } catch (error) {
      setTestResult(`❌ Failed to create contract service: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test user NFT details
  const testGetUserNFTs = async () => {
    if (!contractService || !walletAddress) {
      setTestResult('❌ Contract service not initialized or wallet not connected');
      return;
    }

    setIsLoading(true);
    setTestResult('Fetching user NFT details...');
    
    try {
      const userNFTs = await contractService.getUserNFTs(walletAddress);
      setTestResult(`✅ Found ${userNFTs.length} NFTs for user: ${userNFTs.map((id: bigint) => id.toString()).join(', ')}`);
    } catch (error) {
      setTestResult(`❌ Failed to get user NFTs: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test pricing conversion
  const testPricingConversion = () => {
    try {
      const mockPricingChains = [{
        nativePrice: '1000000000000000000', // 1 ETH in wei
        nativeDecimals: '18',
        stablecoinPrice: '1000000', // 1 USDC (6 decimals)
        stablecoinDecimals: '6'
      }];

      const converted = convertPricingToContractFormat(mockPricingChains);
      setTestResult(`✅ Pricing conversion successful: ${JSON.stringify(converted, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      )}`);
    } catch (error) {
      setTestResult(`❌ Pricing conversion failed: ${(error as Error).message}`);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        {/* Page Header */}
        <section className="mb-10">
          <div className="inline-block mb-4 rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-1 text-xs font-black uppercase tracking-wider">
            Push Chain Integration Test
          </div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Push Chain SDK Integration
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed opacity-90">
            Test the Push Chain SDK integration with wallet connection and contract interactions.
          </p>
        </section>

        {/* Wallet Connection */}
        <section className="mb-8">
          <WalletConnection />
        </section>

        {/* Integration Status */}
        <section className="mb-8">
          <div className="rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)]">
            <h3 className="text-lg font-extrabold mb-4">Integration Status</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-bold">Wallet Connected: {isConnected ? 'Yes' : 'No'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-bold">Push Chain Client: {isInitialized ? 'Initialized' : 'Not Initialized'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${client ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-bold">Client Available: {client ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {walletAddress && (
                  <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                    <strong>Address:</strong> {walletAddress}
                  </div>
                )}
                
                {contractService && (
                  <div className="text-xs font-mono bg-green-100 p-2 rounded">
                    <strong>Contract Service:</strong> Ready
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Test Functions */}
        <section className="mb-8">
          <div className="rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)]">
            <h3 className="text-lg font-extrabold mb-4">Test Functions</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={testContractService}
                disabled={!isInitialized || isLoading}
                className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-none border-2 border-border shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)] disabled:opacity-50"
              >
                Test Contract Service
              </button>
              
              <button
                onClick={testGetUserNFTs}
                disabled={!contractService || !walletAddress || isLoading}
                className="px-4 py-2 bg-[var(--color-secondary)] text-white text-sm font-bold rounded-none border-2 border-border shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)] disabled:opacity-50"
              >
                Test Get User NFTs
              </button>
              
              <button
                onClick={testPricingConversion}
                disabled={isLoading}
                className="px-4 py-2 bg-[var(--color-accent)] text-foreground text-sm font-bold rounded-none border-2 border-border shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)] disabled:opacity-50"
              >
                Test Pricing Conversion
              </button>
            </div>
          </div>
        </section>

        {/* Test Results */}
        {testResult && (
          <section className="mb-8">
            <div className="rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)]">
              <h3 className="text-lg font-extrabold mb-4">Test Results</h3>
              
              <div className="bg-gray-100 p-4 rounded text-sm font-mono">
                {testResult}
              </div>
              
              {isLoading && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              )}
            </div>
          </section>
        )}

        {/* Documentation */}
        <section className="mb-8">
          <div className="rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)]">
            <h3 className="text-lg font-extrabold mb-4">Integration Documentation</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-bold text-[var(--color-primary)]">Phase 1 Complete:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>✅ Push Chain SDK installed (@pushchain/core)</li>
                  <li>✅ Universal Signer setup implemented</li>
                  <li>✅ Push Chain client initialization</li>
                  <li>✅ React context provider created</li>
                  <li>✅ Contract service layer implemented</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-[var(--color-secondary)]">Next Steps:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>🔲 Update existing pages with real contract calls</li>
                  <li>🔲 Implement mint flow in /list page</li>
                  <li>🔲 Implement marketplace display with real data</li>
                  <li>🔲 Implement My NFTs page with user data</li>
                  <li>🔲 Add error handling and transaction feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
