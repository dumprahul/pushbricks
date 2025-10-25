"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/footer";
import SiteHeader from "@/components/header";
import { usePushChain, useWalletConnection } from "@/contexts/PushChainContext";
import { createContractService } from "@/services/contractService";

interface ChainPricing {
  chainId: string;
  price: string;
  currency: string;
  decimals: string;
}

interface PropertyNFT {
  id: number;
  tokenId: string;
  name: string;
  location: string;
  price: string;
  priceInPC: string;
  priceInStablecoin: string;
  type: string;
  image: string; 
  status: string;
  offers: number;
  ownerAddress: string;
  metadataUri: string;
  pricingChains: ChainPricing[];
  active: boolean;
}

type TabType = "created" | "leased" | "rented";
type ModalType = "update" | "toggle" | null;

export default function MyNFTsPage() {
  const { isInitialized } = usePushChain();
  const { isConnected, walletAddress } = useWalletConnection();
  
  const [activeTab, setActiveTab] = useState<TabType>("created");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyNFT | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Real contract data
  const [userNFTs, setUserNFTs] = useState<PropertyNFT[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [nftError, setNftError] = useState<string | null>(null);

  // Update form state
  const [updatePricingChains, setUpdatePricingChains] = useState<ChainPricing[]>([]);

  // Toggle form state
  const [toggleActive, setToggleActive] = useState(false);

  const inputClasses = "w-full rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2";
  const labelClasses = "block text-sm font-bold mb-2 uppercase tracking-wide";

  // Fetch user NFTs from contract
  const fetchUserNFTs = useCallback(async () => {
    if (!isConnected || !walletAddress || !isInitialized) {
      return;
    }

    setIsLoadingNFTs(true);
    setNftError(null);

    try {
      const contractService = await createContractService();
      const nftDetails = await contractService.getUserNFTDetails(walletAddress);
      
      console.log('Fetched NFT details from contract:', nftDetails);
      console.log('Metadata URIs:', nftDetails.metadataURIs);
      
      // Convert contract data to UI format
      const formattedNFTs = await Promise.all(
        nftDetails.tokenIds.map(async (tokenId, index) => {
          let metadata = null;
          let imageUrl: string | null = null;
          let propertyName = `Property #${tokenId}`;
          let location = "Location TBD";
          
          // Try to fetch metadata from IPFS
          try {
            if (nftDetails.metadataURIs[index]) {
              // Convert IPFS URL to HTTP gateway URL for fetching
              let metadataUrl = nftDetails.metadataURIs[index];
              if (metadataUrl.startsWith('ipfs://')) {
                const ipfsHash = metadataUrl.replace('ipfs://', '');
                metadataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
              } else if (metadataUrl.startsWith('Qm') || metadataUrl.startsWith('baf')) {
                metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataUrl}`;
              }
              
              console.log(`Fetching metadata for token ${tokenId} from:`, metadataUrl);
              const metadataResponse = await fetch(metadataUrl);
              if (metadataResponse.ok) {
                metadata = await metadataResponse.json();
                console.log(`Metadata for token ${tokenId}:`, metadata);
                propertyName = metadata.name || `Property #${tokenId}`;
                location = metadata.address || "Location TBD";
                
                // Try to get image from metadata
                if (metadata.image) {
                  let processedImageUrl = metadata.image;
                  
                  // Convert IPFS URL to Pinata gateway URL
                  if (processedImageUrl.startsWith('ipfs://')) {
                    const ipfsHash = processedImageUrl.replace('ipfs://', '');
                    processedImageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
                  } else if (processedImageUrl.startsWith('Qm') || processedImageUrl.startsWith('baf')) {
                    processedImageUrl = `https://gateway.pinata.cloud/ipfs/${processedImageUrl}`;
                  }
                  
                  console.log('Processing image URL:', processedImageUrl);
                  
                  // Test if image loads
                  try {
                    const img = new window.Image();
                    img.src = processedImageUrl;
                    await new Promise((resolve, reject) => {
                      img.onload = resolve;
                      img.onerror = reject;
                    });
                    
                    console.log('Image loaded successfully:', processedImageUrl);
                    imageUrl = processedImageUrl; // Set the valid image URL
                    
                    // If we get here, image loaded successfully
                    const priceInPC = Number(nftDetails.pricings[index].priceInPC) / 1e18;
                    const priceInStablecoin = Number(nftDetails.pricings[index].priceInStablecoin) / 1e6;
                    
                    return {
                      id: Number(tokenId),
                      tokenId: tokenId.toString(),
                      name: propertyName,
                      location: location,
                      price: `${priceInPC} PC`, // Keep original for compatibility
                      priceInPC: `${priceInPC} PC`,
                      priceInStablecoin: `${priceInStablecoin} USDC`,
                      type: "sale",
                      image: imageUrl, // Use the fetched image
                      status: nftDetails.activeStatuses[index] ? "listed" : "unlisted",
                      offers: 0,
                      ownerAddress: walletAddress,
                      metadataUri: nftDetails.metadataURIs[index],
                      pricingChains: [{
                        chainId: "42101",
                        price: nftDetails.pricings[index].priceInPC.toString(),
                        currency: "PC",
                        decimals: "18"
                      }],
                      active: nftDetails.activeStatuses[index]
                    };
                  } catch (imgError) {
                    console.warn('Failed to load image from Pinata:', imgError);
                    console.warn('Image URL that failed:', processedImageUrl);
                  }
                }
              }
            }
          } catch (metadataError) {
            console.warn('Failed to fetch metadata from IPFS:', metadataError);
          }
          
          // Only return NFT if we have a valid image from IPFS
          if (imageUrl) {
            const priceInPC = Number(nftDetails.pricings[index].priceInPC) / 1e18;
            const priceInStablecoin = Number(nftDetails.pricings[index].priceInStablecoin) / 1e6;
            
            return {
              id: Number(tokenId),
              tokenId: tokenId.toString(),
              name: propertyName,
              location: location,
              price: `${priceInPC} PC`, // Keep original for compatibility
              priceInPC: `${priceInPC} PC`,
              priceInStablecoin: `${priceInStablecoin} USDC`,
              type: "sale",
              image: imageUrl as string, // Real IPFS image (guaranteed to be string)
              status: nftDetails.activeStatuses[index] ? "listed" : "unlisted",
              offers: 0,
              ownerAddress: walletAddress,
              metadataUri: nftDetails.metadataURIs[index],
              pricingChains: [{
                chainId: "42101",
                price: nftDetails.pricings[index].priceInPC.toString(),
                currency: "PC",
                decimals: "18"
              }],
              active: nftDetails.activeStatuses[index]
            };
          } else {
            console.warn(`No valid image found for token ${tokenId}, skipping...`);
            return null; // Skip NFTs without valid images
          }
        })
      );

      // Filter out null values (NFTs without valid images)
      const validNFTs = formattedNFTs.filter((nft): nft is PropertyNFT => nft !== null);
      console.log('Formatted NFTs for display:', validNFTs);
      setUserNFTs(validNFTs);
    } catch (error) {
      console.error('Failed to fetch user NFTs:', error);
      setNftError((error as Error).message);
    } finally {
      setIsLoadingNFTs(false);
    }
  }, [isConnected, walletAddress, isInitialized]);

  // Fetch NFTs when wallet is connected
  useEffect(() => {
    if (isConnected && isInitialized && walletAddress) {
      fetchUserNFTs();
    }
  }, [fetchUserNFTs, isConnected, isInitialized, walletAddress]);

  const openUpdateModal = (property: PropertyNFT) => {
    setSelectedProperty(property);
    setUpdatePricingChains([...property.pricingChains]);
    setActiveModal("update");
  };

  const openToggleModal = (property: PropertyNFT) => {
    setSelectedProperty(property);
    setToggleActive(property.active);
    setActiveModal("toggle");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedProperty(null);
  };

  const handleUpdatePricingChange = (index: number, field: keyof ChainPricing, value: string) => {
    const newPricing = [...updatePricingChains];
    newPricing[index][field] = value;
    setUpdatePricingChains(newPricing);
  };

  const addUpdatePricingChain = () => {
    setUpdatePricingChains([...updatePricingChains, { chainId: "42101", price: "", currency: "PC", decimals: "18" }]);
  };

  const removeUpdatePricingChain = (index: number) => {
    setUpdatePricingChains(updatePricingChains.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setSuccessMessage("Listing pricing updated successfully!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    closeModal();
  };

  const handleToggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setSuccessMessage(`Listing ${toggleActive ? "activated" : "deactivated"} successfully!`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    closeModal();
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        {/* Page Header */}
        <section className="mb-10">
          <div className="inline-block mb-4 rounded-none border-2 border-border bg-[var(--color-secondary)] px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
            My Portfolio
          </div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            My NFTs
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed opacity-90">
            Manage your tokenized real estate assets, track leases, and monitor performance.
          </p>
        </section>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 rounded-none border-2 border-border bg-[var(--color-accent)]/20 p-6 shadow-[4px_4px_0_var(--color-accent)]">
            <div className="flex items-start gap-4">
              <div className="rounded-none border-2 border-border bg-[var(--color-accent)] p-2">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold mb-1">Success!</h3>
                <p className="text-sm leading-relaxed opacity-90">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <section className="mb-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-none border-2 border-border bg-white p-5 shadow-[6px_6px_0_var(--color-primary)]">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Created
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--color-primary)]">
                {isLoadingNFTs ? "..." : userNFTs.length}
              </p>
              <p className="mt-1 text-xs opacity-70">Properties listed</p>
            </div>


            <div className="rounded-none border-2 border-border bg-white p-5 shadow-[6px_6px_0_var(--color-primary)]">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Leased
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--color-accent)]">
                0
              </p>
              <p className="mt-1 text-xs opacity-70">Active leases</p>
            </div>

            <div className="rounded-none border-2 border-border bg-white p-5 shadow-[6px_6px_0_var(--color-primary)]">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Rented
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--color-border)]">
                0
              </p>
              <p className="mt-1 text-xs opacity-70">Active rents</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            {(["created", "leased", "rented"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-none border-2 border-border px-6 py-2.5 text-sm font-bold uppercase tracking-wide transition-all ${
                  activeTab === tab
                    ? "bg-[var(--color-primary)] text-white shadow-[4px_4px_0_var(--color-border)]"
                    : "bg-white text-foreground hover:bg-[var(--color-secondary)] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* Created NFTs Section */}
        {activeTab === "created" && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold">Properties I Created</h2>
              <button
                onClick={fetchUserNFTs}
                disabled={isLoadingNFTs}
                className="inline-flex items-center gap-2 rounded-none border-2 border-border bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingNFTs ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh NFTs
                  </>
                )}
              </button>
            </div>
            
            {/* Loading State */}
            {isLoadingNFTs && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                  Loading your NFTs...
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
                      onClick={fetchUserNFTs}
                      className="mt-2 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-none border-2 border-border shadow-[3px_3px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)]"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* No NFTs State */}
            {!isLoadingNFTs && !nftError && userNFTs.length === 0 && (
              <div className="text-center py-8">
                <div className="rounded-none border-2 border-border bg-white p-8 shadow-[6px_6px_0_var(--color-primary)]">
                  <h3 className="text-lg font-extrabold mb-2">No Properties Found</h3>
                  <p className="text-sm text-gray-600 mb-4">You haven&apos;t created any property listings yet.</p>
                  <Link 
                    href="/list"
                    className="inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
                  >
                    Create Your First Property
                  </Link>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {!isLoadingNFTs && !nftError && userNFTs.length > 0 && (
              <div className="mb-6 rounded-none border-2 border-border bg-green-100 p-4 shadow-[4px_4px_0_green-500]">
                <div className="flex items-center gap-3">
                  <div className="rounded-none border-2 border-border bg-green-500 p-1">
                    <svg className="h-5 w-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-green-700">Found {userNFTs.length} Property NFT{userNFTs.length !== 1 ? 's' : ''} with Images</h3>
                    <p className="text-xs text-green-600">Your created properties with valid IPFS images are displayed below</p>
                  </div>
                </div>
              </div>
            )}

            {/* NFTs Grid */}
            {userNFTs.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="rounded-none border-2 border-border bg-white shadow-[6px_6px_0_var(--color-primary)]"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden border-b-2 border-border">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onLoad={() => console.log('IPFS image loaded successfully:', nft.image)}
                      onError={(e) => {
                        console.warn('IPFS image failed to load:', nft.image);
                        // Show error placeholder instead of fallback
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* Error placeholder - hidden by default */}
                    <div className="hidden absolute inset-0 bg-gray-200 items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">Image unavailable</p>
                      </div>
                    </div>
                    <div className={`absolute top-3 right-3 rounded-none border-2 border-border px-2 py-1 text-xs font-black uppercase ${
                      nft.active 
                        ? "bg-[var(--color-accent)] text-foreground" 
                        : "bg-gray-400 text-white"
                    }`}>
                      {nft.active ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-extrabold">{nft.name}</h3>
                    <p className="mt-1 text-sm opacity-70">{nft.location}</p>

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
                      
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                            Offers
                          </p>
                          <p className="text-base font-bold">
                            {nft.offers}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                            Status
                          </p>
                          <p className="text-sm font-bold text-green-600">
                            {nft.active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </div>


                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        onClick={() => openUpdateModal(nft)}
                        className="inline-flex w-full items-center justify-center rounded-none border-2 border-border bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
                      >
                        Update Pricing
                      </button>
                      <button
                        onClick={() => openToggleModal(nft)}
                        className="inline-flex w-full items-center justify-center rounded-none border-2 border-border bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-foreground shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </section>
        )}


        {/* Leased NFTs Section */}
        {activeTab === "leased" && (
          <section>
            <h2 className="mb-6 text-2xl font-extrabold">Properties I&apos;m Leasing</h2>
            <div className="text-center py-16">
              <div className="rounded-none border-2 border-border bg-white p-12 shadow-[6px_6px_0_var(--color-primary)] max-w-md mx-auto">
                <div className="mb-6">
                  <div className="rounded-none border-2 border-border bg-[var(--color-accent)] p-4 mx-auto w-16 h-16 flex items-center justify-center">
                    <svg className="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold mb-4">Coming Soon</h3>
                <p className="text-gray-600 mb-6">
                  Property leasing functionality is currently under development. 
                  You&apos;ll be able to lease properties and manage your leases here.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Features coming:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Browse available properties for lease</li>
                    <li>• Apply for property leases</li>
                    <li>• Manage your active leases</li>
                    <li>• Track lease payments and terms</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Rented NFTs Section */}
        {activeTab === "rented" && (
          <section>
            <h2 className="mb-6 text-2xl font-extrabold">Properties I&apos;m Renting Out</h2>
            <div className="text-center py-16">
              <div className="rounded-none border-2 border-border bg-white p-12 shadow-[6px_6px_0_var(--color-primary)] max-w-md mx-auto">
                <div className="mb-6">
                  <div className="rounded-none border-2 border-border bg-[var(--color-secondary)] p-4 mx-auto w-16 h-16 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold mb-4">Coming Soon</h3>
                <p className="text-gray-600 mb-6">
                  Property rental management functionality is currently under development. 
                  You&apos;ll be able to rent out your properties and manage rentals here.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Features coming:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• List properties for rent</li>
                    <li>• Manage rental applications</li>
                    <li>• Track rental income and payments</li>
                    <li>• Communicate with tenants</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="mt-16 rounded-none border-2 border-border bg-white p-8 shadow-[6px_6px_0_var(--color-primary)] md:p-12">
          <h2 className="text-2xl font-extrabold">Quick Actions</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
            >
              Browse Marketplace
            </Link>
            <Link
              href="/list"
              className="inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-foreground shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
            >
              List New Property
            </Link>
            <Link
              href="/marketplace#stats"
              className="inline-flex items-center justify-center rounded-none border-2 border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
            >
              View Analytics
            </Link>
          </div>
        </section>

        <Footer />
      </main>

      {/* Update Pricing Modal */}
      {activeModal === "update" && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-none border-2 border-border bg-white p-8 shadow-[8px_8px_0_var(--color-primary)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="inline-block mb-2 rounded-none border-2 border-border bg-[var(--color-secondary)] px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                  Update Pricing
                </div>
                <h2 className="text-2xl font-extrabold">{selectedProperty.name}</h2>
                <p className="mt-1 text-sm opacity-70">Token ID: #{selectedProperty.tokenId}</p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-none border-2 border-border bg-white p-2 shadow-[3px_3px_0_var(--color-border)] transition-all active:translate-y-[1px] active:shadow-[2px_2px_0_var(--color-border)]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <div className="space-y-6">
                {/* Pricing Structure */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelClasses + " mb-0"}>
                      New Pricing (ListingPricing) *
                    </label>
                    <button
                      type="button"
                      onClick={addUpdatePricingChain}
                      className="rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-1 text-xs font-black uppercase shadow-[3px_3px_0_var(--color-border)] transition-all active:translate-y-[1px] active:shadow-[2px_2px_0_var(--color-border)]"
                    >
                      + Add Chain
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {updatePricingChains.map((chain, index) => (
                      <div
                        key={index}
                        className="rounded-none border-2 border-border bg-[var(--color-secondary)]/5 p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-black uppercase">Chain {index + 1}</span>
                          {updatePricingChains.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeUpdatePricingChain(index)}
                              className="text-xs font-bold text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold mb-1">Chain ID *</label>
                            <input
                              type="text"
                              required
                              value={chain.chainId}
                              onChange={(e) => handleUpdatePricingChange(index, "chainId", e.target.value)}
                              placeholder="e.g., 1 (Ethereum Mainnet)"
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold mb-1">Price *</label>
                            <input
                              type="text"
                              required
                              value={chain.price}
                              onChange={(e) => handleUpdatePricingChange(index, "price", e.target.value)}
                              placeholder="e.g., 1000000000000000000"
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold mb-1">Currency *</label>
                            <input
                              type="text"
                              required
                              value={chain.currency}
                              onChange={(e) => handleUpdatePricingChange(index, "currency", e.target.value)}
                              placeholder="e.g., ETH or token address"
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold mb-1">Decimals *</label>
                            <input
                              type="text"
                              required
                              value={chain.decimals}
                              onChange={(e) => handleUpdatePricingChange(index, "decimals", e.target.value)}
                              placeholder="e.g., 18"
                              className={inputClasses}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-none border-2 border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Status Modal */}
      {activeModal === "toggle" && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-none border-2 border-border bg-white p-8 shadow-[8px_8px_0_var(--color-primary)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="inline-block mb-2 rounded-none border-2 border-border bg-[var(--color-secondary)] px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                  Toggle Status
                </div>
                <h2 className="text-2xl font-extrabold">{selectedProperty.name}</h2>
                <p className="mt-1 text-sm opacity-70">Token ID: #{selectedProperty.tokenId}</p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-none border-2 border-border bg-white p-2 shadow-[3px_3px_0_var(--color-border)] transition-all active:translate-y-[1px] active:shadow-[2px_2px_0_var(--color-border)]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleToggleSubmit}>
              <div className="space-y-6">
                {/* Active Flag */}
                <div>
                  <label className={labelClasses}>
                    Active Flag (active) *
                  </label>
                  <div className="rounded-none border-2 border-border bg-[var(--color-secondary)]/5 p-6">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={toggleActive}
                            onChange={(e) => setToggleActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 rounded-none border-2 border-border bg-white peer-checked:bg-[var(--color-primary)] transition-colors"></div>
                          <div className="absolute left-1 top-1 w-6 h-6 rounded-none border-2 border-border bg-[var(--color-accent)] transition-transform peer-checked:translate-x-6"></div>
                        </div>
                        <span className="text-sm font-bold">
                          {toggleActive ? "Active (Listed)" : "Inactive (Unlisted)"}
                        </span>
                      </label>
                    </div>
                    <p className="mt-3 text-xs opacity-70">
                      Toggle this switch to activate or deactivate the listing
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-none border-2 border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
