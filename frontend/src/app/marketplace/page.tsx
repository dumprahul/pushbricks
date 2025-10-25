"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/footer";
import SiteHeader from "@/components/header";
import { usePushChain } from "@/contexts/PushChainContext";
import { createContractService } from "@/services/contractService";
import { ethers } from "ethers";
import img1 from "../../../public/img1.webp";

// NFT Property interface
interface NFTProperty {
  id: number;
  name: string;
  location: string;
  price: string;
  priceInPC: string;
  priceInStablecoin: string;
  type: "buy" | "lease" | "rent";
  image: string;
  apy: string | null;
  yield: string | null;
  sqft: number;
  description: string;
  tokenId: string;
  owner: string;
  active?: boolean;
}

export default function MarketplacePage() {
  const { isInitialized } = usePushChain();
  
  const [selectedProperty, setSelectedProperty] = useState<NFTProperty | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  // Real contract data
  const [marketplaceNFTs, setMarketplaceNFTs] = useState<NFTProperty[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [nftError, setNftError] = useState<string | null>(null);

  // Fetch all marketplace NFTs from contract
  const fetchMarketplaceNFTs = useCallback(async () => {
    if (!isInitialized) {
      return;
    }

    setIsLoadingNFTs(true);
    setNftError(null);

    try {
      const contractService = await createContractService();
      
      // Get total supply to know how many NFTs exist
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const totalSupplyResult = await provider.call({
        to: "0x3125BB25506fbbb4466796533d908Eab1e132532", // PropertyNFT address
        data: "0x18160ddd" // totalSupply() function selector
      });
      
      const totalSupply = Number(ethers.getBigInt(totalSupplyResult));
      console.log('Total supply of NFTs:', totalSupply);
      
      if (totalSupply === 0) {
        setMarketplaceNFTs([]);
        return;
      }

      // Fetch all NFTs by iterating through token IDs
      const allNFTs = [];
      
      for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
        try {
          // Get listing details for this token
          const listing = await contractService.getListing(BigInt(tokenId));
          
          // Get token URI
          const tokenURI = await contractService.getPropertyTokenURI(BigInt(tokenId));
          
          // Fetch metadata from IPFS
          let metadata = null;
          let imageUrl: string = img1.src; // Default fallback
          let propertyName = `Property #${tokenId}`;
          let location = "Location TBD";
          let description = "Property description from metadata";
          
          try {
            // Convert IPFS URL to HTTP gateway URL for fetching
            let metadataUrl = tokenURI;
            if (metadataUrl.startsWith('ipfs://')) {
              const ipfsHash = metadataUrl.replace('ipfs://', '');
              metadataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            } else if (metadataUrl.startsWith('Qm') || metadataUrl.startsWith('baf')) {
              metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataUrl}`;
            }
            
            const metadataResponse = await fetch(metadataUrl);
            if (metadataResponse.ok) {
              metadata = await metadataResponse.json();
              propertyName = metadata.name || `Property #${tokenId}`;
              location = metadata.address || "Location TBD";
              description = metadata.description || "Property description from metadata";
              
              // Get image from metadata
              if (metadata.image) {
                let processedImageUrl = metadata.image;
                
                // Convert IPFS URL to Pinata gateway URL
                if (processedImageUrl.startsWith('ipfs://')) {
                  const ipfsHash = processedImageUrl.replace('ipfs://', '');
                  processedImageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
                } else if (processedImageUrl.startsWith('Qm') || processedImageUrl.startsWith('baf')) {
                  processedImageUrl = `https://gateway.pinata.cloud/ipfs/${processedImageUrl}`;
                }
                
                imageUrl = processedImageUrl;
              }
            }
          } catch (metadataError) {
            console.warn(`Failed to fetch metadata for token ${tokenId}:`, metadataError);
          }
          
          // Only include active listings
          if (listing.active) {
            const priceInPC = Number(listing.pricing.priceInPC) / 1e18;
            const priceInStablecoin = Number(listing.pricing.priceInStablecoin) / 1e6; // Assuming 6 decimals for USDC
            
            allNFTs.push({
              id: tokenId,
              name: propertyName,
              location: location,
              price: `${priceInPC} PC`, // Keep original for compatibility
              priceInPC: `${priceInPC} PC`,
              priceInStablecoin: `${priceInStablecoin} USDC`,
              type: "buy" as const,
              image: imageUrl,
              apy: null,
              yield: null,
              sqft: 0,
              description: description,
              tokenId: `#${tokenId}`,
              owner: listing.lister,
              active: listing.active
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch details for token ${tokenId}:`, error);
          // Continue to next token
        }
      }

      console.log('Fetched all marketplace NFTs:', allNFTs);
      setMarketplaceNFTs(allNFTs);
    } catch (error) {
      console.error('Failed to fetch marketplace NFTs:', error);
      setNftError((error as Error).message);
    } finally {
      setIsLoadingNFTs(false);
    }
  }, [isInitialized]);

  // Fetch NFTs when Push Chain is initialized
  useEffect(() => {
    if (isInitialized) {
      fetchMarketplaceNFTs();
    }
  }, [fetchMarketplaceNFTs, isInitialized]);

  // Handle property modal
  const openPropertyModal = (property: NFTProperty) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    setTransactionHash(null);
  };

  const closePropertyModal = () => {
    setShowPropertyModal(false);
    setSelectedProperty(null);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    setTransactionHash(null);
  };

  // Handle property purchase
  const handlePurchase = async () => {
    if (!selectedProperty) return;

    setIsPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    setTransactionHash(null);

    try {
      const contractService = await createContractService();
      
      // Get the price in wei (assuming 18 decimals for PC token)
      const priceInWei = BigInt(Math.floor(parseFloat(selectedProperty.price.replace(' PC', '')) * 1e18));
      
      console.log('Purchasing property:', selectedProperty.name, 'for', selectedProperty.price);
      
      // Call the buy function
      const txHash = await contractService.buyProperty(BigInt(selectedProperty.id), priceInWei);
      
      setTransactionHash(txHash);
      setPurchaseSuccess(true);
      
      console.log('Purchase successful! Transaction hash:', txHash);
      
      // Refresh the marketplace to update the listings
      setTimeout(() => {
        fetchMarketplaceNFTs();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to purchase property:', error);
      setPurchaseError((error as Error).message);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        {/* Page Header */}
        <section className="mb-10">
          <div className="inline-block mb-4 rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-1 text-xs font-black uppercase tracking-wider">
            NFT Marketplace
          </div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Discover Real Estate Assets
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed opacity-90">
            Browse tokenized properties available for purchase or lease on Push Chain.
          </p>
        </section>


        {/* Loading State */}
        {isLoadingNFTs && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 text-lg text-gray-600">
              <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              Loading marketplace NFTs...
            </div>
          </div>
        )}

        {/* Error State */}
        {nftError && (
          <div className="mb-6 rounded-none border-2 border-border bg-red-100 p-6 shadow-[4px_4px_0_red-500]">
            <div className="flex items-start gap-4">
              <div className="rounded-none border-2 border-border bg-red-500 p-2">
                <svg className="h-6 w-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold mb-1 text-red-700">Error Loading NFTs</h3>
                <p className="text-sm leading-relaxed text-red-600">{nftError}</p>
                <button 
                  onClick={fetchMarketplaceNFTs}
                  className="mt-2 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-none border-2 border-border shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)]"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No NFTs State */}
        {!isLoadingNFTs && !nftError && marketplaceNFTs.length === 0 && (
          <div className="text-center py-16">
            <div className="rounded-none border-2 border-border bg-white p-12 shadow-[6px_6px_0_var(--color-primary)] max-w-md mx-auto">
              <div className="mb-6">
                <div className="rounded-none border-2 border-border bg-[var(--color-primary)] p-4 mx-auto w-16 h-16 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold mb-4">No Properties Available</h3>
              <p className="text-gray-600 mb-6">
                No active property listings found in the marketplace. 
                Be the first to list a property!
              </p>
              <Link
                href="/list"
                className="inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
              >
                List Your Property
              </Link>
            </div>
          </div>
        )}

        {/* Success Message */}
        {!isLoadingNFTs && !nftError && marketplaceNFTs.length > 0 && (
          <div className="mb-6 rounded-none border-2 border-border bg-green-100 p-4 shadow-[4px_4px_0_green-500]">
            <div className="flex items-center gap-3">
              <div className="rounded-none border-2 border-border bg-green-500 p-1">
                <svg className="h-5 w-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-green-700">Found {marketplaceNFTs.length} Property NFT{marketplaceNFTs.length !== 1 ? 's' : ''}</h3>
                <p className="text-xs text-green-600">Active property listings from all users</p>
              </div>
            </div>
          </div>
        )}

        {/* NFT Grid */}
        {marketplaceNFTs.length > 0 && (
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {marketplaceNFTs.map((nft) => (
            <div
              key={nft.id}
              className="group rounded-none border-2 border-border bg-white shadow-[6px_6px_0_var(--color-primary)] transition-all"
            >
              {/* NFT Image */}
              <div className="relative h-48 overflow-hidden border-b-2 border-border">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 right-3 rounded-none border-2 border-border bg-[var(--color-accent)] px-2 py-1 text-xs font-black uppercase">
                  {nft.type}
                </div>
              </div>

              {/* NFT Details */}
              <div className="p-4">
                <h3 className="text-lg font-extrabold">{nft.name}</h3>
                <p className="mt-1 text-sm opacity-70">{nft.location}</p>

                {/* Stats */}
                <div className="mt-4 space-y-3">
                  {/* Dual Pricing Display */}
                  <div className="rounded-none border-2 border-border bg-[var(--color-primary)]/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
                      Pricing
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[var(--color-primary)]">
                          {nft.priceInPC}
                        </span>
                        <span className="text-xs opacity-70">Push Chain</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[var(--color-secondary)]">
                          {nft.priceInStablecoin}
                        </span>
                        <span className="text-xs opacity-70">Stablecoin</span>
                      </div>
                    </div>
                  </div>
                  
                  {nft.apy && (
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                        APY
                      </p>
                      <p className="text-base font-bold text-[var(--color-secondary)]">
                        {nft.apy}
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => openPropertyModal(nft)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          </section>
        )}

        {/* Stats Dashboard */}
        <section id="stats" className="mt-16 scroll-mt-20">
          <h2 className="mb-6 text-2xl font-extrabold">Marketplace Stats</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)]">
              <div className="mb-2 inline-block rounded-none border-2 border-border bg-[var(--color-accent)] px-2 py-1 text-xs font-black">
                TOTAL VOLUME
              </div>
              <p className="mt-3 text-3xl font-extrabold">142.8 ETH</p>
              <p className="mt-1 text-sm opacity-60">Last 30 days</p>
            </div>

            <div className="rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)]">
              <div className="mb-2 inline-block rounded-none border-2 border-border bg-[var(--color-secondary)] px-2 py-1 text-xs font-black text-white">
                PROPERTIES
              </div>
              <p className="mt-3 text-3xl font-extrabold">{marketplaceNFTs.length}</p>
              <p className="mt-1 text-sm opacity-60">Active listings</p>
            </div>

            <div className="rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)]">
              <div className="mb-2 inline-block rounded-none border-2 border-border bg-[var(--color-accent)] px-2 py-1 text-xs font-black">
                AVG. APY
              </div>
              <p className="mt-3 text-3xl font-extrabold">7.9%</p>
              <p className="mt-1 text-sm opacity-60">For lease properties</p>
            </div>

            <div className="rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)]">
              <div className="mb-2 inline-block rounded-none border-2 border-border bg-[var(--color-secondary)] px-2 py-1 text-xs font-black text-white">
                FLOOR PRICE
              </div>
              <p className="mt-3 text-3xl font-extrabold">2.5 ETH</p>
              <p className="mt-1 text-sm opacity-60">Lowest buy price</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-14 rounded-none border-2 border-border bg-white p-8 shadow-[6px_6px_0_var(--color-primary)] md:p-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">List Your Property</h2>
            <p className="mt-3 text-lg opacity-90">
              Tokenize your real estate and reach global investors on Push Chain.
            </p>
            <Link
              href="/list"
              className="mt-6 inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-accent)] px-8 py-3 text-sm font-black text-foreground shadow-[6px_6px_0_var(--color-primary)] transition-all active:translate-y-[2px] active:shadow-[4px_4px_0_var(--color-primary)] hover:translate-y-[1px] hover:shadow-[5px_5px_0_var(--color-primary)]"
            >
              Get Started
            </Link>
          </div>
        </section>

        <Footer />
      </main>

      {/* Property Details Modal */}
      {showPropertyModal && selectedProperty && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closePropertyModal}
        >
          <div 
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-none border-4 border-border bg-white "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closePropertyModal}
              className="absolute right-4 top-4 z-10 rounded-none border-2 border-border bg-white p-2 text-foreground shadow-[4px_4px_0_var(--color-border)] transition-all hover:bg-red-500 hover:text-white active:translate-y-[1px] active:shadow-[3px_3px_0_var(--color-border)]"
              aria-label="Close modal"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="p-6 md:p-8">
              {/* Property Image */}
              <div className="relative mb-6 h-64 overflow-hidden rounded-none border-2 border-border md:h-96">
                <Image
                  src={selectedProperty.image}
                  alt={selectedProperty.name}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4 rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-1 text-sm font-black uppercase">
                  {selectedProperty.type}
                </div>
              </div>

              {/* Property Title & Location */}
              <div className="mb-6">
                <h2 className="text-3xl font-extrabold md:text-4xl">{selectedProperty.name}</h2>
                <p className="mt-2 text-lg opacity-70">{selectedProperty.location}</p>
              </div>

              {/* Price & Stats Grid */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Push Chain Token Price */}
                <div className="rounded-none border-2 border-border bg-[var(--color-primary)]/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60">Push Chain</p>
                  <p className="mt-1 text-xl font-extrabold text-[var(--color-primary)]">
                    {selectedProperty.priceInPC}
                  </p>
                </div>

                {/* Stablecoin Price */}
                <div className="rounded-none border-2 border-border bg-[var(--color-secondary)]/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60">Stablecoin</p>
                  <p className="mt-1 text-xl font-extrabold text-[var(--color-secondary)]">
                    {selectedProperty.priceInStablecoin}
                  </p>
                </div>

                {selectedProperty.apy && (
                  <div className="rounded-none border-2 border-border bg-[var(--color-accent)]/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-60">APY</p>
                    <p className="mt-1 text-xl font-extrabold text-[var(--color-accent)]">
                      {selectedProperty.apy}
                    </p>
                  </div>
                )}

                <div className="rounded-none border-2 border-border bg-[var(--color-accent)]/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60">Square Feet</p>
                  <p className="mt-1 text-2xl font-extrabold">{selectedProperty.sqft.toLocaleString()}</p>
                </div>

                <div className="rounded-none border-2 border-border bg-[var(--color-primary)]/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60">Token ID</p>
                  <p className="mt-1 text-xl font-extrabold">{selectedProperty.tokenId}</p>
                </div>

                <div className="rounded-none border-2 border-border bg-[var(--color-secondary)]/10 p-4 sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60">Owner</p>
                  <p className="mt-1 text-xl font-extrabold">{selectedProperty.owner}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 rounded-none border-2 border-border bg-[var(--color-primary)]/5 p-6">
                <h3 className="mb-3 text-lg font-extrabold uppercase tracking-wide">Description</h3>
                <p className="leading-relaxed">{selectedProperty.description}</p>
              </div>

              {/* Purchase Status Messages */}
              {purchaseSuccess && (
                <div className="mb-6 rounded-none border-2 border-border bg-green-100 p-4 shadow-[4px_4px_0_green-500]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-none border-2 border-border bg-green-500 p-1">
                      <svg className="h-5 w-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-green-700">Purchase Successful!</h3>
                      <p className="text-xs text-green-600">Transaction Hash: {transactionHash}</p>
                    </div>
                  </div>
                </div>
              )}

              {purchaseError && (
                <div className="mb-6 rounded-none border-2 border-border bg-red-100 p-4 shadow-[4px_4px_0_red-500]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-none border-2 border-border bg-red-500 p-1">
                      <svg className="h-5 w-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-red-700">Purchase Failed</h3>
                      <p className="text-xs text-red-600">{purchaseError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing || purchaseSuccess}
                  className="flex-1 rounded-none border-2 border-border bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPurchasing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Purchasing...
                    </div>
                  ) : purchaseSuccess ? (
                    "Purchase Complete!"
                  ) : (
                    "Buy Now"
                  )}
                </button>
                <button 
                  onClick={closePropertyModal}
                  className="flex-1 rounded-none border-2 border-border bg-white px-6 py-3 text-sm font-bold uppercase transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

