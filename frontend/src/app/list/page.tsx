"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/footer";
import SiteHeader from "@/components/header";

type PropertyType = "buy" | "lease";

export default function ListPropertyPage() {
  const [propertyType, setPropertyType] = useState<PropertyType>("buy");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
    description: "",
    sqft: "",
    apy: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        {/* Page Header */}
        <section className="mb-10">
          <div className="inline-block mb-4 rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-1 text-xs font-black uppercase tracking-wider">
            Tokenize Your Property
          </div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            List Your Property
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed opacity-90">
            Transform your real estate into tokenized assets on Push Chain.
          </p>
        </section>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 rounded-none border-2 border-border bg-[var(--color-secondary)] p-4 shadow-[6px_6px_0_var(--color-border)]">
            <p className="text-sm font-bold text-white">
              ✓ Property listed successfully! Redirecting to marketplace...
            </p>
          </div>
        )}

        {/* Form Modal/Card */}
        <section className="rounded-none border-2 border-border bg-white p-6 shadow-[8px_8px_0_var(--color-primary)] md:p-10">
          <form onSubmit={handleSubmit}>
            {/* Property Type Selection */}
            <div className="mb-8">
              <label className="mb-3 block text-sm font-bold uppercase tracking-wide">
                Listing Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPropertyType("buy")}
                  className={`flex-1 rounded-none border-2 border-border px-6 py-3 text-sm font-bold uppercase transition-all ${
                    propertyType === "buy"
                      ? "bg-[var(--color-primary)] text-white shadow-[4px_4px_0_var(--color-border)]"
                      : "bg-white text-foreground hover:bg-[var(--color-secondary)] hover:text-white"
                  }`}
                >
                  For Sale
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType("lease")}
                  className={`flex-1 rounded-none border-2 border-border px-6 py-3 text-sm font-bold uppercase transition-all ${
                    propertyType === "lease"
                      ? "bg-[var(--color-primary)] text-white shadow-[4px_4px_0_var(--color-border)]"
                      : "bg-white text-foreground hover:bg-[var(--color-secondary)] hover:text-white"
                  }`}
                >
                  For Lease
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <label className="mb-3 block text-sm font-bold uppercase tracking-wide">
                Property Image
              </label>
              <div className="rounded-none border-2 border-border bg-[var(--color-accent)]/10 p-6">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Property preview"
                      width={600}
                      height={400}
                      className="h-64 w-full rounded-none border-2 border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="mt-3 rounded-none border-2 border-border bg-white px-4 py-2 text-sm font-bold transition-colors hover:bg-red-500 hover:text-white"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center py-8">
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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Property Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Property Name */}
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-bold uppercase tracking-wide">
                  Property Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Sunset Villa #42"
                  required
                  className="w-full rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="mb-2 block text-sm font-bold uppercase tracking-wide">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Miami Beach, FL"
                  required
                  className="w-full rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="mb-2 block text-sm font-bold uppercase tracking-wide">
                  Price {propertyType === "lease" && "(per month)"}
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder={propertyType === "buy" ? "e.g., 2.5 ETH" : "e.g., 0.15 ETH/mo"}
                  required
                  className="w-full rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* APY (only for lease) */}
              {propertyType === "lease" && (
                <div>
                  <label htmlFor="apy" className="mb-2 block text-sm font-bold uppercase tracking-wide">
                    Expected APY (%)
                  </label>
                  <input
                    type="text"
                    id="apy"
                    name="apy"
                    value={formData.apy}
                    onChange={handleInputChange}
                    placeholder="e.g., 8.5"
                    className="w-full rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              )}

              {/* Square Feet */}
              <div>
                <label htmlFor="sqft" className="mb-2 block text-sm font-bold uppercase tracking-wide">
                  Square Feet
                </label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  placeholder="e.g., 2500"
                  required
                  className="w-full rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className="mb-2 block text-sm font-bold uppercase tracking-wide">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your property..."
                rows={4}
                required
                className="w-full rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="flex-1 rounded-none border-2 border-border bg-[var(--color-accent)] px-6 py-3 text-sm font-black uppercase shadow-[4px_4px_0_var(--color-primary)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-primary)] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-primary)]"
              >
                List Property
              </button>
              <Link
                href="/marketplace"
                className="flex-1 inline-flex items-center justify-center rounded-none border-2 border-border bg-white px-6 py-3 text-sm font-bold uppercase transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>

        {/* Info Cards */}
        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-none border-2 border-border bg-white p-5 shadow-[4px_4px_0_var(--color-primary)]">
            <div className="mb-2 inline-block rounded-none border-2 border-border bg-[var(--color-primary)] px-2 py-1 text-xs font-black text-white">
              STEP 1
            </div>
            <h3 className="mt-3 text-base font-extrabold">Property Details</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-70">
              Fill in basic information about your property
            </p>
          </div>

          <div className="rounded-none border-2 border-border bg-white p-5 shadow-[4px_4px_0_var(--color-primary)]">
            <div className="mb-2 inline-block rounded-none border-2 border-border bg-[var(--color-secondary)] px-2 py-1 text-xs font-black text-white">
              STEP 2
            </div>
            <h3 className="mt-3 text-base font-extrabold">Tokenization</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-70">
              We&apos;ll mint your property as an NFT on Push Chain
            </p>
          </div>

          <div className="rounded-none border-2 border-border bg-white p-5 shadow-[4px_4px_0_var(--color-primary)]">
            <div className="mb-2 inline-block rounded-none border-2 border-border bg-[var(--color-accent)] px-2 py-1 text-xs font-black">
              STEP 3
            </div>
            <h3 className="mt-3 text-base font-extrabold">Go Live</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-70">
              Your property appears on the marketplace
            </p>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

