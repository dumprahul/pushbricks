/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Contract Service Layer
 * Integrates with Push Chain client for contract interactions
 */

import { ethers } from 'ethers';
import { getPushChainClient } from '@/lib/pushChainClient';
import { CONTRACT_CONFIG, type PropertyPricing, type Listing, type CreateListingParams, type UpdatePricingParams, type SetListingActiveParams } from '@/lib/contracts';
import PropertyNFTABI from '../../abi/PropertyNFT.sol/PropertyNFT.json';

// ABIs
const ABIS = {
  PROPERTY_NFT: PropertyNFTABI.abi,
};

// Contract service class
export class ContractService {
  private client: any;
  private registryAddress: string;
  private registryABI: any;
  private propertyNFTAddress: string;
  private marketAddress: string;

  constructor(client: any, registryAddress: string, registryABI: any, propertyNFTAddress: string, marketAddress: string) {
    this.client = client;
    this.registryAddress = registryAddress;
    this.registryABI = registryABI;
    this.propertyNFTAddress = propertyNFTAddress;
    this.marketAddress = marketAddress;
  }

  /**
   * Create a new property listing
   * Calls Registry.createListing() function
   */
  async createListing(params: CreateListingParams): Promise<bigint> {
    try {
      console.log('Creating listing with params:', params);
      
      // Encode the function call
      const iface = new ethers.Interface(this.registryABI);
      const encodedData = iface.encodeFunctionData('createListing', [
        params.to,
        params.uri,
        [params.pricing.priceInPC, params.pricing.priceInStablecoin]
      ]);

      console.log('Encoded data:', encodedData);

      // Use ethers signer for write operations
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: this.registryAddress,
        data: encodedData,
        value: 0,
      });

      console.log('Transaction sent:', tx.hash);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      // Extract tokenId from logs
      if (receipt && receipt.logs) {
        const tokenId = this.extractTokenIdFromLogs([...receipt.logs]);
        console.log('Extracted token ID:', tokenId.toString());
        return tokenId;
      } else {
        throw new Error('Transaction receipt or logs not found');
      }
    } catch (error) {
      console.error('Failed to create listing:', error);
      throw error;
    }
  }

  /**
   * Get listing details
   * Calls Registry.getListing() function
   */
  async getListing(tokenId: bigint): Promise<Listing> {
    try {
      const iface = new ethers.Interface(this.registryABI);
      const encodedData = iface.encodeFunctionData('getListing', [tokenId]);

      // Use ethers provider directly for read operations
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const result = await provider.call({
        to: this.registryAddress,
        data: encodedData,
      });

      return this.decodeListing(result, iface);
    } catch (error) {
      console.error('Failed to get listing:', error);
      throw error;
    }
  }

  /**
   * Update listing pricing
   * Calls Registry.updateListingPricing() function
   */
  async updateListingPricing(params: UpdatePricingParams): Promise<string> {
    try {
      const iface = new ethers.Interface(this.registryABI);
      const encodedData = iface.encodeFunctionData('updateListingPricing', [
        params.tokenId,
        [params.pricing.priceInPC, params.pricing.priceInStablecoin]
      ]);

      // Use ethers signer for write operations
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: this.registryAddress,
        data: encodedData,
        value: 0,
      });

      return tx.hash;
    } catch (error) {
      console.error('Failed to update listing pricing:', error);
      throw error;
    }
  }

  /**
   * Set listing active status
   * Calls Registry.setListingActive() function
   */
  async setListingActive(params: SetListingActiveParams): Promise<string> {
    try {
      const iface = new ethers.Interface(this.registryABI);
      const encodedData = iface.encodeFunctionData('setListingActive', [
        params.tokenId,
        params.active
      ]);

      // Use ethers signer for write operations
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: this.registryAddress,
        data: encodedData,
        value: 0,
      });

      return tx.hash;
    } catch (error) {
      console.error('Failed to set listing active:', error);
      throw error;
    }
  }

  /**
   * Get user NFT details
   * Calls Registry.getUserNFTDetails() function
   */
  async getUserNFTDetails(userAddress: string): Promise<{
    tokenIds: bigint[];
    metadataURIs: string[];
    pricings: PropertyPricing[];
    activeStatuses: boolean[];
  }> {
    try {
      const iface = new ethers.Interface(this.registryABI);
      const encodedData = iface.encodeFunctionData('getUserNFTDetails', [userAddress]);

      // Use ethers provider directly for read operations
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const result = await provider.call({
        to: this.registryAddress,
        data: encodedData,
      });

      return this.decodeUserNFTDetails(result, iface);
    } catch (error) {
      console.error('Failed to get user NFT details:', error);
      throw error;
    }
  }

  /**
   * Buy property
   * Calls Market.buy() function
   */
  async buyProperty(tokenId: bigint, value: bigint = BigInt(0)): Promise<string> {
    try {
      // Note: You'll need the Market contract ABI for this
      // For now, this is a placeholder
      console.log('Buying property:', tokenId, 'with value:', value.toString());
      
      // This would need the actual Market contract ABI
      throw new Error('Market contract integration not yet implemented');
    } catch (error) {
      console.error('Failed to buy property:', error);
      throw error;
    }
  }

  /**
   * Get user's NFTs
   * Calls Registry.getUserNFTs() function
   */
  async getUserNFTs(userAddress: string): Promise<bigint[]> {
    try {
      const iface = new ethers.Interface(this.registryABI);
      const encodedData = iface.encodeFunctionData('getUserNFTs', [userAddress]);

      // Use ethers provider directly for read operations
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const result = await provider.call({
        to: this.registryAddress,
        data: encodedData,
      });

      const decoded = iface.decodeFunctionResult('getUserNFTs', result);
      return decoded[0].map((id: any) => BigInt(id));
    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      throw error;
    }
  }

  // Helper methods for encoding/decoding
  private extractTokenIdFromLogs(logs: any[]): bigint {
    const iface = new ethers.Interface(this.registryABI);
    
    for (const log of logs) {
      try {
        const decoded = iface.parseLog(log);
        if (decoded && decoded.name === 'ListingCreated') {
          return BigInt(decoded.args.tokenId);
        }
      } catch {
        // Continue to next log
      }
    }
    
    throw new Error('TokenId not found in transaction logs');
  }

  private decodeListing(result: string, iface: ethers.Interface): Listing {
    const decoded = iface.decodeFunctionResult('getListing', result);
    
    return {
      lister: decoded[0].lister,
      pricing: {
        priceInPC: BigInt(decoded[0].pricing.priceInPC),
        priceInStablecoin: BigInt(decoded[0].pricing.priceInStablecoin),
      },
      active: decoded[0].active,
    };
  }

  private decodeUserNFTDetails(result: string, iface: ethers.Interface): {
    tokenIds: bigint[];
    metadataURIs: string[];
    pricings: PropertyPricing[];
    activeStatuses: boolean[];
  } {
    const decoded = iface.decodeFunctionResult('getUserNFTDetails', result);
    
    return {
      tokenIds: decoded[0].map((id: any) => BigInt(id)),
      metadataURIs: decoded[1],
      pricings: decoded[2].map((pricing: any) => ({
        priceInPC: BigInt(pricing.priceInPC),
        priceInStablecoin: BigInt(pricing.priceInStablecoin),
      })),
      activeStatuses: decoded[3],
    };
  }

  /**
   * Get property token URI from PropertyNFT contract
   * Calls PropertyNFT.tokenURI() function
   */
  async getPropertyTokenURI(tokenId: bigint): Promise<string> {
    try {
      const iface = new ethers.Interface(ABIS.PROPERTY_NFT);
      const encodedData = iface.encodeFunctionData('tokenURI', [tokenId]);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const result = await provider.call({
        to: this.propertyNFTAddress,
        data: encodedData,
      });
      const decoded = iface.decodeFunctionResult('tokenURI', result);
      return decoded[0];
    } catch (error) {
      console.error('Failed to get property token URI:', error);
      throw error;
    }
  }
}

// Factory function to create contract service instance
export async function createContractService(): Promise<ContractService> {
  try {
    const client = await getPushChainClient();
    
    // Validate contract configuration
    if (!CONTRACT_CONFIG.PUSH_BRICKS_REGISTRY.address || CONTRACT_CONFIG.PUSH_BRICKS_REGISTRY.address.startsWith('0x...')) {
      throw new Error('PushBricksRegistry contract address is not configured');
    }
    
    if (!CONTRACT_CONFIG.PUSH_BRICKS_REGISTRY.abi || CONTRACT_CONFIG.PUSH_BRICKS_REGISTRY.abi.length === 0) {
      throw new Error('PushBricksRegistry ABI is not loaded');
    }
    
    console.log('Creating contract service with registry address:', CONTRACT_CONFIG.PUSH_BRICKS_REGISTRY.address);
    
    return new ContractService(
      client,
      CONTRACT_CONFIG.PUSH_BRICKS_REGISTRY.address,
      CONTRACT_CONFIG.PUSH_BRICKS_REGISTRY.abi,
      '0x3125BB25506fbbb4466796533d908Eab1e132532', // PropertyNFT address
      '0x3bDe719EcaCE07b8298CD3a4f892a1CDaA73E571'  // Market address
    );
  } catch (error) {
    console.error('Failed to create contract service:', error);
    throw error;
  }
}

// Utility function to convert pricing from form data to contract format
export function convertPricingToContractFormat(pricingChains: any[]): PropertyPricing {
  // Use the first pricing chain for now
  const firstPricing = pricingChains[0];
  
  if (!firstPricing) {
    throw new Error('At least one pricing chain is required');
  }

  // Convert native token price to wei
  const nativePriceInWei = BigInt(firstPricing.nativePrice) * BigInt(10 ** parseInt(firstPricing.nativeDecimals));
  
  // Convert stablecoin price to smallest unit
  const stablecoinPriceInSmallestUnit = BigInt(firstPricing.stablecoinPrice) * BigInt(10 ** parseInt(firstPricing.stablecoinDecimals));
  
  return {
    priceInPC: nativePriceInWei,
    priceInStablecoin: stablecoinPriceInSmallestUnit,
  };
}
