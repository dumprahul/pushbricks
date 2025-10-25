/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Push Chain Client Integration
 * Following official Push Chain documentation: https://pushchain.github.io/push-chain-website/pr-preview/pr-1067/docs/chain/build/
 */

import { PushChain } from '@pushchain/core';
import { ethers } from 'ethers';

// Types for Push Chain integration
export interface PushChainConfig {
  network: 'testnet' | 'mainnet';
  rpcUrl?: string;
}

export interface UniversalSignerConfig {
  signAndSendTransaction: (unsignedTx: any) => Promise<string>;
  signMessage: (data: string) => Promise<string>;
  signTypedData: (typedData: any) => Promise<string>;
}

// Push Chain client instance
let pushChainClient: any = null;
let universalSigner: any = null;

/**
 * Create Universal Signer from wallet connection
 * Following Push Chain docs: https://pushchain.github.io/push-chain-website/pr-preview/pr-1067/docs/chain/build/create-universal-signer/
 */
export async function createUniversalSigner(): Promise<any> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Push Chain client can only be initialized in browser environment');
    }

    // Check if wallet is connected
    if (!(window as any).ethereum) {
      throw new Error('No wallet found. Please install MetaMask or another wallet.');
    }

    // Request account access
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

    // Create ethers provider using BrowserProvider
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    
    // Get signer from provider
    const ethersSigner = await provider.getSigner();
    
    // Get user's address and chain info
    const address = await ethersSigner.getAddress();
    const network = await ethersSigner.provider.getNetwork();
    const chainId = Number(network.chainId);
    
    console.log('Wallet connected:', { address, chainId });

    // Create account object for Universal Signer
    const account = {
      address: address,
      chain: `eip155:${chainId}` as any // Format: eip155:chainId
    };

    // Create skeleton signer with wallet functions
    const skeletonSigner = PushChain.utils.signer.construct(account, {
      signAndSendTransaction: async (unsignedTx: any) => {
        console.log('Signing and sending transaction:', unsignedTx);
        
        // Use ethers to sign and send transaction
        const txResponse = await ethersSigner.sendTransaction({
          to: unsignedTx.to,
          data: unsignedTx.data,
          value: unsignedTx.value || 0,
          gasLimit: unsignedTx.gasLimit,
        });
        
        // Convert hash to Uint8Array
        return new TextEncoder().encode(txResponse.hash);
      },
      signMessage: async (data: Uint8Array) => {
        console.log('Signing message:', data);
        const messageString = new TextDecoder().decode(data);
        const signature = await ethersSigner.signMessage(messageString);
        return new TextEncoder().encode(signature);
      },
      signTypedData: async (typedData: any) => {
        console.log('Signing typed data:', typedData);
        const signature = await ethersSigner.signTypedData(
          typedData.domain,
          typedData.types,
          typedData.message
        );
        return new TextEncoder().encode(signature);
      }
    });

    // Convert skeleton to Universal Signer
    universalSigner = await PushChain.utils.signer.toUniversal(skeletonSigner);
    
    console.log('Universal Signer created successfully');
    return universalSigner;
  } catch (error) {
    console.error('Failed to create Universal Signer:', error);
    throw error;
  }
}

/**
 * Initialize Push Chain Client
 * Following Push Chain docs: https://pushchain.github.io/push-chain-website/pr-preview/pr-1067/docs/chain/build/initialize-push-chain-client/
 */
export async function initializePushChainClient(config: PushChainConfig = { network: 'testnet' }): Promise<any> {
  try {
    // Create Universal Signer if not already created
    if (!universalSigner) {
      universalSigner = await createUniversalSigner();
    }

    // Initialize Push Chain SDK with Universal Signer
    pushChainClient = await PushChain.initialize(universalSigner, {
      network: config.network === 'testnet' 
        ? PushChain.CONSTANTS.PUSH_NETWORK.TESTNET 
        : PushChain.CONSTANTS.PUSH_NETWORK.MAINNET,
    });

    console.log('Push Chain client initialized successfully');
    console.log('Network:', config.network);
    
    return pushChainClient;
  } catch (error) {
    console.error('Failed to initialize Push Chain client:', error);
    throw error;
  }
}

/**
 * Get Push Chain client (initialize if not already done)
 */
export async function getPushChainClient(config?: PushChainConfig): Promise<any> {
  if (!pushChainClient) {
    await initializePushChainClient(config);
  }
  return pushChainClient;
}

/**
 * Get Universal Signer
 */
export function getUniversalSigner(): any {
  if (!universalSigner) {
    throw new Error('Universal Signer not initialized. Please call createUniversalSigner() first.');
  }
  return universalSigner;
}

/**
 * Check if Push Chain client is initialized
 */
export function isPushChainClientReady(): boolean {
  return pushChainClient !== null;
}

/**
 * Reset Push Chain client (useful for wallet switching)
 */
export function resetPushChainClient(): void {
  pushChainClient = null;
  universalSigner = null;
  console.log('Push Chain client reset');
}

/**
 * Get current wallet address
 */
export async function getCurrentWalletAddress(): Promise<string | null> {
  try {
    if (!(window as any).ethereum) {
      return null;
    }
    
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Failed to get wallet address:', error);
    return null;
  }
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  return typeof window !== 'undefined' && !!(window as any).ethereum;
}

/**
 * Get current network chain ID
 */
export async function getCurrentChainId(): Promise<number | null> {
  try {
    if (!(window as any).ethereum) {
      return null;
    }
    
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    return await provider.getNetwork().then(network => Number(network.chainId));
  } catch (error) {
    console.error('Failed to get chain ID:', error);
    return null;
  }
}

/**
 * Switch to Push Chain network
 */
export async function switchToPushChainNetwork(): Promise<boolean> {
  try {
    if (!(window as any).ethereum) {
      throw new Error('No wallet found');
    }

    // Push Chain testnet chain ID
    const pushChainTestnetId = '0xa4d5'; // 42101 in hex
    
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: pushChainTestnetId }],
      });
    } catch (switchError: any) {
      // If the chain doesn't exist, try to add it
      if (switchError.code === 42101) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: pushChainTestnetId,
              chainName: 'Push Chain Testnet',
              rpcUrls: ['https://evm.rpc-testnet-donut-node1.push.org'], 
              nativeCurrency: {
                name: 'Push Chain Token',
                symbol: 'PC',
                decimals: 18,
              },
            }],
          });
        } catch (addError) {
          console.error('Failed to add Push Chain network:', addError);
          return false;
        }
      } else {
        throw switchError;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to switch to Push Chain network:', error);
    return false;
  }
}
