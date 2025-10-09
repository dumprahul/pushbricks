"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/footer";
import SiteHeader from "@/components/header";
import img1 from "../../../public/img1.webp";

// Mock user NFT data
const myCreatedNFTs = [
  {
    id: 1,
    name: "Sunset Villa #42",
    location: "Miami Beach, FL",
    price: "2.5 ETH",
    type: "sale",
    image: img1,
    status: "listed",
    views: 124,
    offers: 3,
  },
  {
    id: 2,
    name: "Downtown Loft #17",
    location: "New York, NY",
    price: "0.15 ETH/mo",
    type: "lease",
    image: img1,
    status: "leased",
    views: 89,
    offers: 0,
  },
];

const myOwnedNFTs = [
  {
    id: 3,
    name: "Beach House #89",
    location: "Malibu, CA",
    price: "5.8 ETH",
    purchaseDate: "2024-09-15",
    image: img1,
    tokenId: "#1234",
  },
  {
    id: 4,
    name: "Mountain Cabin #67",
    location: "Aspen, CO",
    price: "3.2 ETH",
    purchaseDate: "2024-08-22",
    image: img1,
    tokenId: "#5678",
  },
];

const myLeasedNFTs = [
  {
    id: 5,
    name: "Urban Studio #23",
    location: "San Francisco, CA",
    monthlyRate: "0.08 ETH/mo",
    leaseStart: "2024-10-01",
    leaseEnd: "2025-10-01",
    image: img1,
    daysRemaining: 357,
  },
  {
    id: 6,
    name: "Garden Apartment #31",
    location: "London, UK",
    monthlyRate: "0.12 ETH/mo",
    leaseStart: "2024-09-15",
    leaseEnd: "2025-03-15",
    image: img1,
    daysRemaining: 157,
  },
];

type TabType = "created" | "owned" | "leased";

export default function MyNFTsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("created");

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

        {/* Summary Stats */}
        <section className="mb-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-none border-2 border-border bg-white p-5 shadow-[6px_6px_0_var(--color-primary)]">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Created
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--color-primary)]">
                {myCreatedNFTs.length}
              </p>
              <p className="mt-1 text-xs opacity-70">Properties listed</p>
            </div>

            <div className="rounded-none border-2 border-border bg-white p-5 shadow-[6px_6px_0_var(--color-primary)]">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Owned
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--color-secondary)]">
                {myOwnedNFTs.length}
              </p>
              <p className="mt-1 text-xs opacity-70">Properties owned</p>
            </div>

            <div className="rounded-none border-2 border-border bg-white p-5 shadow-[6px_6px_0_var(--color-primary)]">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Leased
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--color-accent)]">
                {myLeasedNFTs.length}
              </p>
              <p className="mt-1 text-xs opacity-70">Active leases</p>
            </div>

            <div className="rounded-none border-2 border-border bg-white p-5 shadow-[6px_6px_0_var(--color-primary)]">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Total Value
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {(myOwnedNFTs.reduce((acc, nft) => acc + parseFloat(nft.price), 0)).toFixed(1)} ETH
              </p>
              <p className="mt-1 text-xs opacity-70">Portfolio value</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            {(["created", "owned", "leased"] as TabType[]).map((tab) => (
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
            <h2 className="mb-6 text-2xl font-extrabold">Properties I Created</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myCreatedNFTs.map((nft) => (
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
                    />
                    <div className={`absolute top-3 right-3 rounded-none border-2 border-border px-2 py-1 text-xs font-black uppercase ${
                      nft.status === "listed" 
                        ? "bg-[var(--color-accent)] text-foreground" 
                        : "bg-[var(--color-secondary)] text-white"
                    }`}>
                      {nft.status}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-extrabold">{nft.name}</h3>
                    <p className="mt-1 text-sm opacity-70">{nft.location}</p>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                          Price
                        </p>
                        <p className="text-base font-bold text-[var(--color-primary)]">
                          {nft.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                          Offers
                        </p>
                        <p className="text-base font-bold">
                          {nft.offers}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 rounded-none border-2 border-border bg-[var(--color-accent)]/10 px-3 py-2">
                      <span className="text-xs font-bold">Views:</span>
                      <span className="text-xs font-extrabold">{nft.views}</span>
                    </div>

                    <Link
                      href={`/marketplace/${nft.id}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
                    >
                      Manage Listing
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Owned NFTs Section */}
        {activeTab === "owned" && (
          <section>
            <h2 className="mb-6 text-2xl font-extrabold">Properties I Own</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myOwnedNFTs.map((nft) => (
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
                    />
                    <div className="absolute top-3 right-3 rounded-none border-2 border-border bg-[var(--color-secondary)] px-2 py-1 text-xs font-black uppercase text-white">
                      OWNED
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-extrabold">{nft.name}</h3>
                    <p className="mt-1 text-sm opacity-70">{nft.location}</p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between rounded-none border-2 border-border bg-[var(--color-secondary)]/10 px-3 py-2">
                        <span className="text-xs font-bold">Token ID:</span>
                        <span className="text-xs font-extrabold">{nft.tokenId}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-none border-2 border-border bg-[var(--color-accent)]/10 px-3 py-2">
                        <span className="text-xs font-bold">Purchase Price:</span>
                        <span className="text-xs font-extrabold text-[var(--color-primary)]">{nft.price}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-none border-2 border-border bg-[var(--color-primary)]/10 px-3 py-2">
                        <span className="text-xs font-bold">Purchase Date:</span>
                        <span className="text-xs font-extrabold">{nft.purchaseDate}</span>
                      </div>
                    </div>

                    <Link
                      href={`/marketplace/${nft.id}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-none border-2 border-border bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-foreground shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Leased NFTs Section */}
        {activeTab === "leased" && (
          <section>
            <h2 className="mb-6 text-2xl font-extrabold">Properties I&apos;m Leasing</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myLeasedNFTs.map((nft) => (
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
                    />
                    <div className="absolute top-3 right-3 rounded-none border-2 border-border bg-[var(--color-accent)] px-2 py-1 text-xs font-black uppercase text-foreground">
                      LEASED
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-extrabold">{nft.name}</h3>
                    <p className="mt-1 text-sm opacity-70">{nft.location}</p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between rounded-none border-2 border-border bg-[var(--color-accent)]/10 px-3 py-2">
                        <span className="text-xs font-bold">Monthly Rate:</span>
                        <span className="text-xs font-extrabold text-[var(--color-primary)]">{nft.monthlyRate}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-none border-2 border-border bg-[var(--color-primary)]/10 px-3 py-2">
                        <span className="text-xs font-bold">Lease Period:</span>
                        <span className="text-xs font-extrabold">{nft.leaseStart} - {nft.leaseEnd}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-none border-2 border-border bg-[var(--color-secondary)]/10 px-3 py-2">
                        <span className="text-xs font-bold">Days Remaining:</span>
                        <span className="text-xs font-extrabold text-[var(--color-secondary)]">{nft.daysRemaining}</span>
                      </div>
                    </div>

                    <Link
                      href={`/marketplace/${nft.id}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
                    >
                      Manage Lease
                    </Link>
                  </div>
                </div>
              ))}
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
              href="/analytics"
              className="inline-flex items-center justify-center rounded-none border-2 border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
            >
              View Analytics
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
