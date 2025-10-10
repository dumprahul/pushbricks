"use client";

import { useState } from "react";
import Footer from "@/components/footer";
import SiteHeader from "@/components/header";
import Link from "next/link";

interface ChainPricing {
  chainId: string;
  price: string;
  currency: string;
  decimals: string;
}

interface PropertyMetadata {
  name: string;
  address: string;
  description: string;
  propertyType: string;
  squareFeet: string;
  imageUrl: string;
}

interface CreateListingData {
  ownerAddress: string;
  metadata: PropertyMetadata;
  pricingChains: ChainPricing[];
}

export default function ListPropertyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Create Listing State
  const [createData, setCreateData] = useState<CreateListingData>({
    ownerAddress: "",
    metadata: {
      name: "",
      address: "",
      description: "",
      propertyType: "residential",
      squareFeet: "",
      imageUrl: "",
    },
    pricingChains: [{ chainId: "", price: "", currency: "", decimals: "18" }],
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

  const handleCreatePricingChange = (index: number, field: keyof ChainPricing, value: string) => {
    const newPricing = [...createData.pricingChains];
    newPricing[index][field] = value;
    setCreateData((prev) => ({ ...prev, pricingChains: newPricing }));
  };

  const addCreatePricingChain = () => {
    setCreateData((prev) => ({
      ...prev,
      pricingChains: [...prev.pricingChains, { chainId: "", price: "", currency: "", decimals: "18" }],
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
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Redirect to My NFTs page
      window.location.href = "/my-nfts";
    }, 2000);
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
                <p className="text-sm leading-relaxed opacity-90">Property minted and listed successfully! Redirecting to My NFTs...</p>
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
                    <p className="mt-1 text-xs opacity-70">Should match the current owner or authorized account</p>
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


                  {/* Image URL */}
                  <div>
                    <label htmlFor="imageUrl" className={labelClasses}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={createData.metadata.imageUrl}
                      onChange={handleMetadataChange}
                      placeholder="https://example.com/image.jpg"
                      className={inputClasses}
                    />
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
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold mb-1">Chain ID *</label>
                          <input
                            type="text"
                            required
                            value={chain.chainId}
                            onChange={(e) => handleCreatePricingChange(index, "chainId", e.target.value)}
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
                            onChange={(e) => handleCreatePricingChange(index, "price", e.target.value)}
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
                            onChange={(e) => handleCreatePricingChange(index, "currency", e.target.value)}
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
                            onChange={(e) => handleCreatePricingChange(index, "decimals", e.target.value)}
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
