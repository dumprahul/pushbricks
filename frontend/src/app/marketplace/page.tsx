"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/footer";
import SiteHeader from "@/components/header";
import img1 from "../../../public/img1.webp";
// Mock NFT data
const nftProperties = [
  {
    id: 1,
    name: "Sunset Villa #42",
    location: "Miami Beach, FL",
    price: "2.5 ETH",
    type: "buy",
    image: img1,
    apy: null,
    yield: null,
    sqft: 3200,
    description: "Stunning beachfront villa with panoramic ocean views. Features modern amenities, infinity pool, and direct beach access. Perfect for luxury living.",
    tokenId: "#8921",
    owner: "0x742d...3a91",
  },
  {
    id: 2,
    name: "Downtown Loft #17",
    location: "New York, NY",
    price: "0.15 ETH/mo",
    type: "lease",
    image: img1,
    apy: "8.5%",
    yield: "Monthly",
    sqft: 1800,
    description: "Modern industrial loft in the heart of downtown. High ceilings, exposed brick, and floor-to-ceiling windows with city views.",
    tokenId: "#4521",
    owner: "0x892a...7b42",
  },
  {
    id: 3,
    name: "Beach House #89",
    location: "Malibu, CA",
    price: "5.8 ETH",
    type: "buy",
    image: img1,
    apy: null,
    yield: null,
    sqft: 4500,
    description: "Exclusive Malibu beach house with private access to pristine beaches. Designed by renowned architect with sustainable materials.",
    tokenId: "#1234",
    owner: "0x523c...9d81",
  },
  {
    id: 4,
    name: "Urban Studio #23",
    location: "San Francisco, CA",
    price: "0.08 ETH/mo",
    type: "lease",
    image: img1,
    apy: "6.2%",
    yield: "Monthly",
    sqft: 650,
    description: "Compact and efficient studio in tech district. Perfect for young professionals. Walking distance to major tech campuses.",
    tokenId: "#7821",
    owner: "0x341b...2c55",
  },
  {
    id: 5,
    name: "Penthouse Suite #5",
    location: "Dubai, UAE",
    price: "12.3 ETH",
    type: "buy",
    image: img1,
    apy: null,
    yield: null,
    sqft: 6800,
    description: "Ultra-luxury penthouse with 360-degree views of Dubai skyline. Private elevator, rooftop terrace, and world-class amenities.",
    tokenId: "#9001",
    owner: "0x123a...4f67",
  },
  
];

type FilterType = "all" | "buy" | "lease";

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedProperty, setSelectedProperty] = useState<typeof nftProperties[0] | null>(null);

  const filteredNFTs = nftProperties.filter((nft) => {
    if (activeFilter === "all") return true;
    return nft.type === activeFilter;
  });

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

        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            {(["all", "buy", "lease"] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-none border-2 border-border px-6 py-2.5 text-sm font-bold uppercase tracking-wide transition-all ${
                  activeFilter === filter
                    ? "bg-[var(--color-accent)] text-white shadow-[4px_4px_0_var(--color-border)]"
                    : "bg-white text-foreground hover:bg-[var(--color-secondary)] hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* NFT Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNFTs.map((nft) => (
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
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                      Price
                    </p>
                    <p className="text-base font-bold text-[var(--color-primary)]">
                      {nft.price}
                    </p>
                  </div>
                  {nft.apy && (
                    <div className="text-right">
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
                  onClick={() => setSelectedProperty(nft)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Stats Dashboard */}
        <section className="mt-16">
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
              <p className="mt-3 text-3xl font-extrabold">{nftProperties.length}</p>
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
      {selectedProperty && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedProperty(null)}
        >
          <div 
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-none border-4 border-border bg-white "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProperty(null)}
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
                <div className="rounded-none border-2 border-border bg-[var(--color-primary)]/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60">Price</p>
                  <p className="mt-1 text-2xl font-extrabold text-[var(--color-primary)]">
                    {selectedProperty.price}
                  </p>
                </div>

                {selectedProperty.apy && (
                  <div className="rounded-none border-2 border-border bg-[var(--color-secondary)]/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-60">APY</p>
                    <p className="mt-1 text-2xl font-extrabold text-[var(--color-secondary)]">
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

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="flex-1 rounded-none border-2 border-border bg-[var(--color-accent)] px-6 py-3 text-sm font-black uppercase shadow-[6px_6px_0_var(--color-primary)] transition-all active:translate-y-[2px] active:shadow-[4px_4px_0_var(--color-primary)] hover:translate-y-[1px] hover:shadow-[5px_5px_0_var(--color-primary)]">
                  {selectedProperty.type === "buy" ? "Make Offer" : "Lease Now"}
                </button>
                <button className="flex-1 rounded-none border-2 border-border bg-white px-6 py-3 text-sm font-bold uppercase transition-colors hover:bg-[var(--color-secondary)] hover:text-white">
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

