/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Footer from "@/components/footer";
import SiteHeader from "@/components/header";
import Link from "next/link";
import { 
  uploadCompletePropertyToIPFS
} from "@/lib/pinata";
import { createContractService, convertPricingToContractFormat } from "@/services/contractService";
import { usePushChain, useWalletConnection } from "@/contexts/PushChainContext";

interface ChainPricing {
  chainId: string;
  // Native token pricing (priceInPC)
  nativePrice: string;
  nativeCurrency: string;
  nativeDecimals: string;
  // Stablecoin pricing (priceInStablecoin)
  stablecoinPrice: string;
  stablecoinCurrency: string;
  stablecoinDecimals: string;
}

interface PropertyMetadata {
  name: string;
  address: string;
  description: string;
  propertyType: string;
  squareFeet: string;
  yearBuilt: string;
  imageData: string;
}

interface CreateListingData {
  ownerAddress: string;
  metadata: PropertyMetadata;
  pricingChains: ChainPricing[];
}

export default function ListPropertyPage() {
  const { isInitialized, error: pushChainError } = usePushChain();
  const { isConnected, walletAddress } = useWalletConnection();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [metadataIPFSHash, setMetadataIPFSHash] = useState<string>("");
  const [contractError, setContractError] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");

  // Create Listing State
  const [createData, setCreateData] = useState<CreateListingData>({
    ownerAddress: "",
    metadata: {
      name: "",
      address: "",
      description: "",
      propertyType: "residential",
      squareFeet: "",
      yearBuilt: "",
      imageData: "",
    },
    pricingChains: [{ 
      chainId: "42101", // Push Chain testnet
      nativePrice: "", 
      nativeCurrency: "PC", // Push Chain token
      nativeDecimals: "18",
      stablecoinPrice: "",
      stablecoinCurrency: "USDC",
      stablecoinDecimals: "6"
    }],
  });

  const inputClasses = "w-full rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2";
  const labelClasses = "block text-sm font-bold mb-2 uppercase tracking-wide";


  // Handle metadata changes
  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [name]: value },
    }));
  };

  // Handle owner address change
  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateData((prev) => ({ ...prev, ownerAddress: e.target.value }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setCreateData((prev) => ({
          ...prev,
          metadata: { ...prev.metadata, imageData: base64String },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setImagePreview(null);
    setCreateData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, imageData: "" },
    }));
  };

  const handleCreatePricingChange = (index: number, field: keyof ChainPricing, value: string) => {
    const newPricing = [...createData.pricingChains];
    newPricing[index][field] = value;
    setCreateData((prev) => ({ ...prev, pricingChains: newPricing }));
  };

  const addCreatePricingChain = () => {
    setCreateData((prev) => ({
      ...prev,
      pricingChains: [...prev.pricingChains, { 
        chainId: "42101", // Push Chain testnet
        nativePrice: "", 
        nativeCurrency: "PC", // Push Chain token
        nativeDecimals: "18",
        stablecoinPrice: "",
        stablecoinCurrency: "USDC",
        stablecoinDecimals: "6"
      }],
    }));
  };

  const removeCreatePricingChain = (index: number) => {
    setCreateData((prev) => ({
      ...prev,
      pricingChains: prev.pricingChains.filter((_, i) => i !== index),
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadStatus("Preparing to upload...");
    setContractError("");
    setTransactionHash("");
    
    try {
      // Check if wallet is available
      if (!(window as any).ethereum) {
        throw new Error("No wallet found. Please install MetaMask or another wallet.");
      }
      // Step 1: Upload image to IPFS
      setUploadStatus("Uploading image to IPFS...");
      
      if (!createData.metadata.imageData) {
        throw new Error("Please upload a property image");
      }
      
      // Step 2: Upload complete property to IPFS
      setUploadStatus("Uploading metadata to IPFS...");
      const { imageCID, metadataCID, metadataURI } = await uploadCompletePropertyToIPFS(
        createData.metadata.imageData,
        {
          name: createData.metadata.name,
          address: createData.metadata.address,
          description: createData.metadata.description,
          propertyType: createData.metadata.propertyType,
          squareFeet: createData.metadata.squareFeet,
          yearBuilt: createData.metadata.yearBuilt,
        }
      );
      
      setMetadataIPFSHash(metadataCID);
      setUploadStatus("Upload complete! Creating listing on blockchain...");
      
      console.log("🎉 Property uploaded to IPFS!");
      console.log("Metadata URI for smart contract:", metadataURI);
      console.log("Image CID:", imageCID);
      
      // Step 3: Create listing on blockchain using PushBricksRegistry contract
      setUploadStatus("Connecting to Push Chain...");
      
      // Check if wallet is connected and Push Chain is initialized
      if (!isConnected || !walletAddress) {
        throw new Error("Please connect your wallet first");
      }
      
      if (!isInitialized) {
        throw new Error("Push Chain client not initialized. Please try again.");
      }
      
      // Initialize contract service
      const contractService = await createContractService();
      
      setUploadStatus("Validating contract configuration...");
      
      setUploadStatus("Preparing contract transaction...");
      
      // Convert pricing to contract format
      const pricing = convertPricingToContractFormat(createData.pricingChains);
      
      setUploadStatus("Creating listing on Push Chain...");
      
      // Create listing
      const tokenId = await contractService.createListing({
        to: createData.ownerAddress,
        uri: metadataURI,
        pricing: pricing,
      });
      
      setUploadStatus("Listing created successfully!");
      setTransactionHash(`Token ID: ${tokenId.toString()}`);
      
      console.log("🎉 Property listing created on blockchain!");
      console.log("Token ID:", tokenId.toString());
      
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        window.location.href = "/my-nfts";
      }, 3000);
      
    } catch (error) {
      console.error("Error creating listing:", error);
      setContractError((error as Error).message);
      setUploadStatus("Error: " + (error as Error).message);
      setIsLoading(false);
      
      // Show specific error message based on error type
      const errorMessage = (error as Error).message.toLowerCase();
      
      if (errorMessage.includes("user rejected") || errorMessage.includes("user denied")) {
        alert("Transaction was cancelled by user. Please try again.");
      } else if (errorMessage.includes("insufficient funds")) {
        alert("Insufficient funds for transaction. Please add more funds to your wallet.");
      } else if (errorMessage.includes("invalid") && errorMessage.includes("address")) {
        alert("Invalid contract address. Please check the contract configuration.");
      } else if (errorMessage.includes("contract address is not configured")) {
        alert("Contract address is not configured. Please contact support.");
      } else if (errorMessage.includes("abi is not loaded")) {
        alert("Contract ABI is not loaded. Please contact support.");
      } else if (errorMessage.includes("gas estimation failed") || errorMessage.includes("gas")) {
        alert("Gas estimation failed. This might be due to insufficient funds or network issues. Please ensure you have enough PC tokens and try again.");
      } else if (errorMessage.includes("wallet") || errorMessage.includes("connection")) {
        alert("Wallet connection issue. Please ensure your wallet is connected and try again.");
      } else if (errorMessage.includes("network")) {
        alert("Network error. Please check your internet connection and try again.");
      } else {
        alert(`Failed to create listing: ${(error as Error).message}`);
      }
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        {/* Page Header */}
        <section className="mb-10">
          <div className="inline-block mb-4 rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-1 text-xs font-black uppercase tracking-wider">
            Create Property Listing
          </div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Mint & List Your Property
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed opacity-90">
            Tokenize and list your real estate property with multi-chain pricing on Push Chain.
          </p>
        </section>

        {/* Wallet Connection Status */}
        {!isConnected && (
          <section className="mb-8">
            <div className="rounded-none border-2 border-border bg-red-100 p-6 shadow-[4px_4px_0_red-500]">
              <div className="flex items-start gap-4">
                <div className="rounded-none border-2 border-border bg-red-500 p-2">
                  <svg className="h-6 w-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold mb-1 text-red-700">Wallet Not Connected</h3>
                  <p className="text-sm leading-relaxed text-red-600">
                    Please connect your wallet to create property listings. Make sure you&apos;re connected to Push Chain network.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {isConnected && !isInitialized && (
          <section className="mb-8">
            <div className="rounded-none border-2 border-border bg-yellow-100 p-6 shadow-[4px_4px_0_yellow-500]">
              <div className="flex items-start gap-4">
                <div className="rounded-none border-2 border-border bg-yellow-500 p-2">
                  <svg className="h-6 w-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold mb-1 text-yellow-700">Initializing Push Chain...</h3>
                  <p className="text-sm leading-relaxed text-yellow-600">
                    Setting up Push Chain client. This may take a moment.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {pushChainError && (
          <section className="mb-8">
            <div className="rounded-none border-2 border-border bg-red-100 p-6 shadow-[4px_4px_0_red-500]">
              <div className="flex items-start gap-4">
                <div className="rounded-none border-2 border-border bg-red-500 p-2">
                  <svg className="h-6 w-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold mb-1 text-red-700">Push Chain Error</h3>
                  <p className="text-sm leading-relaxed text-red-600">{pushChainError}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Upload Status */}
        {uploadStatus && !showSuccess && (
          <div className="mb-6 rounded-none border-2 border-border bg-[var(--color-secondary)]/10 p-6 shadow-[4px_4px_0_var(--color-secondary)]">
            <div className="flex items-start gap-4">
              <div className="rounded-none border-2 border-border bg-[var(--color-secondary)] p-2">
                <svg
                  className="h-6 w-6 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold mb-1">Uploading to IPFS...</h3>
                <p className="text-sm leading-relaxed opacity-90">{uploadStatus}</p>
              </div>
            </div>
          </div>
        )}

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
                <p className="text-sm leading-relaxed opacity-90">Property listing created successfully on Push Chain! Redirecting to My NFTs...</p>
                {metadataIPFSHash && (
                  <div className="mt-3 rounded-none border-2 border-border bg-white p-3">
                    <p className="text-xs font-bold mb-1">IPFS Metadata Hash:</p>
                    <p className="text-xs font-mono break-all">{metadataIPFSHash}</p>
                    <p className="text-xs font-bold mt-2 mb-1">Metadata URI:</p>
                    <p className="text-xs font-mono break-all">ipfs://{metadataIPFSHash}</p>
                    {transactionHash && (
                      <>
                        <p className="text-xs font-bold mt-2 mb-1">Token ID:</p>
                        <p className="text-xs font-mono break-all">{transactionHash}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contract Error Message */}
        {contractError && !showSuccess && (
          <div className="mb-6 rounded-none border-2 border-border bg-red-500/20 p-6 shadow-[4px_4px_0_red-500]">
            <div className="flex items-start gap-4">
              <div className="rounded-none border-2 border-border bg-red-500 p-2">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold mb-1 text-red-700">Contract Error</h3>
                <p className="text-sm leading-relaxed text-red-600">{contractError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Listing Form */}
        <section className="rounded-none border-2 border-border bg-white p-8 shadow-[6px_6px_0_var(--color-primary)] md:p-12">
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-8">
              {/* Owner Information Section */}
              <div>
                <h3 className="text-lg font-extrabold mb-2 text-[var(--color-secondary)]">
                  Owner Information
                </h3>
                <div className="space-y-6">
                  {/* Owner Address */}
                  <div>
                    <label htmlFor="ownerAddress" className={labelClasses}>
                      Owner Address (to) *
                    </label>
                    <input
                      type="text"
                      id="ownerAddress"
                      name="ownerAddress"
                      required
                      value={createData.ownerAddress}
                      onChange={handleOwnerChange}
                      placeholder="0x..."
                      pattern="^0x[a-fA-F0-9]{40}$"
                      title="Must be a valid Ethereum address (0x followed by 40 hexadecimal characters)"
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Property Metadata Section */}
              <div>
                <h3 className="text-lg font-extrabold mb-2 text-[var(--color-secondary)]">
                  Property Metadata
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Property Name */}
                  <div>
                    <label htmlFor="name" className={labelClasses}>
                      Property Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={createData.metadata.name}
                      onChange={handleMetadataChange}
                      placeholder="e.g., Sunset Villa"
                      className={inputClasses}
                    />
                  </div>

                  {/* Property Type */}
                  <div>
                    <label htmlFor="propertyType" className={labelClasses}>
                      Property Type *
                    </label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      required
                      value={createData.metadata.propertyType}
                      onChange={handleMetadataChange}
                      className={inputClasses}
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                      <option value="land">Land</option>
                    </select>
                  </div>

                  {/* Property Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className={labelClasses}>
                      Property Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      value={createData.metadata.address}
                      onChange={handleMetadataChange}
                      placeholder="123 Main Street, City, State, ZIP"
                      className={inputClasses}
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label htmlFor="description" className={labelClasses}>
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={createData.metadata.description}
                      onChange={handleMetadataChange}
                      placeholder="Describe the property..."
                      rows={4}
                      className={inputClasses}
                    />
                  </div>

               

                  {/* Square Feet */}
                  <div>
                    <label htmlFor="squareFeet" className={labelClasses}>
                      Square Feet
                    </label>
                    <input
                      type="text"
                      id="squareFeet"
                      name="squareFeet"
                      value={createData.metadata.squareFeet}
                      onChange={handleMetadataChange}
                      placeholder="2500"
                      className={inputClasses}
                    />
                  </div>

                  {/* Year Built */}
                  <div>
                    <label htmlFor="yearBuilt" className={labelClasses}>
                      Year Built
                    </label>
                    <input
                      type="text"
                      id="yearBuilt"
                      name="yearBuilt"
                      value={createData.metadata.yearBuilt}
                      onChange={handleMetadataChange}
                      placeholder="2020"
                      className={inputClasses}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label htmlFor="imageUpload" className={labelClasses}>
                      Property Image
                    </label>
                    <div className="rounded-none border-2 border-border bg-[var(--color-accent)]/10 p-6">
                      {imagePreview ? (
                        <div className="relative">
                          <div className="relative h-64 w-full rounded-none border-2 border-border overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imagePreview}
                              alt="Property preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="mt-3 rounded-none border-2 border-border bg-white px-4 py-2 text-sm font-bold transition-colors hover:bg-red-500 hover:text-white"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center py-8 hover:bg-[var(--color-accent)]/20 transition-colors">
                          <svg
                            className="mb-3 h-12 w-12 opacity-50"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm font-bold uppercase tracking-wide opacity-70">
                            Click to Upload Image
                          </span>
                          <span className="mt-2 text-xs opacity-50">
                            JPG, PNG, GIF, WEBP (Max 10MB)
                          </span>
                          <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Structure Section */}
              <div>
                <h3 className="text-lg font-extrabold mb-2 text-[var(--color-secondary)]">
                  Multi-Chain Pricing
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <label className={labelClasses + " mb-0"}>
                    Pricing Structure (ListingPricing) *
                  </label>
                  <button
                    type="button"
                    onClick={addCreatePricingChain}
                    className="rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-1 text-xs font-black uppercase shadow-[3px_3px_0_var(--color-border)] transition-all active:translate-y-[1px] active:shadow-[2px_2px_0_var(--color-border)]"
                  >
                    + Add Chain
                  </button>
                </div>
                
                <div className="space-y-4">
                  {createData.pricingChains.map((chain, index) => (
                    <div
                      key={index}
                      className="rounded-none border-2 border-border bg-[var(--color-secondary)]/5 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black uppercase">Chain {index + 1}</span>
                        {createData.pricingChains.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCreatePricingChain(index)}
                            className="text-xs font-bold text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-6">
                        {/* Chain ID */}
                        <div>
                          <label className="block text-xs font-bold mb-1">Chain ID * (Use 42101 for Push Chain)</label>
                          <input
                            type="text"
                            required
                            value={chain.chainId}
                            onChange={(e) => handleCreatePricingChange(index, "chainId", e.target.value)}
                            placeholder="e.g., 42101 (Push Chain Testnet)"
                            className={inputClasses}
                          />
                        </div>

                        {/* Native Token Pricing Section */}
                        <div className="rounded-none border-2 border-border bg-blue-50/50 p-4">
                          <h4 className="text-sm font-bold mb-3 text-blue-800">Native Token Pricing (priceInPC)</h4>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <label className="block text-xs font-bold mb-1">Price (Native Token) *</label>
                              <input
                                type="text"
                                required
                                value={chain.nativePrice}
                                onChange={(e) => handleCreatePricingChange(index, "nativePrice", e.target.value)}
                                placeholder="e.g., 1000000000000000000"
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1">Currency * (PC for Push Chain)</label>
                              <select
                                value={chain.nativeCurrency}
                                onChange={(e) => handleCreatePricingChange(index, "nativeCurrency", e.target.value)}
                                className={inputClasses}
                              >
                                <option value="ETH">ETH</option>
                                <option value="PC">Push Chain Token</option>
                                <option value="MATIC">MATIC (Polygon)</option>
                                <option value="BNB">BNB (BSC)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1">Decimals *</label>
                              <input
                                type="text"
                                required
                                value={chain.nativeDecimals}
                                onChange={(e) => handleCreatePricingChange(index, "nativeDecimals", e.target.value)}
                                placeholder="e.g., 18"
                                className={inputClasses}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Stablecoin Pricing Section */}
                        <div className="rounded-none border-2 border-border bg-green-50/50 p-4">
                          <h4 className="text-sm font-bold mb-3 text-green-800">Stablecoin Pricing (priceInStablecoin)</h4>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <label className="block text-xs font-bold mb-1">Price (Stablecoin) *</label>
                              <input
                                type="text"
                                required
                                value={chain.stablecoinPrice}
                                onChange={(e) => handleCreatePricingChange(index, "stablecoinPrice", e.target.value)}
                                placeholder="e.g., 1000000"
                                className={inputClasses}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1">Stablecoin *</label>
                              <select
                                value={chain.stablecoinCurrency}
                                onChange={(e) => handleCreatePricingChange(index, "stablecoinCurrency", e.target.value)}
                                className={inputClasses}
                              >
                                <option value="USDC">USDC</option>
                                <option value="USDT">USDT</option>
                                <option value="DAI">DAI</option>
                                <option value="BUSD">BUSD</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1">Decimals *</label>
                              <input
                                type="text"
                                required
                                value={chain.stablecoinDecimals}
                                onChange={(e) => handleCreatePricingChange(index, "stablecoinDecimals", e.target.value)}
                                placeholder="e.g., 6"
                                className={inputClasses}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Mint & List Property"}
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-none border-2 border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>

        <Footer />
      </main>
    </>
  );
}
