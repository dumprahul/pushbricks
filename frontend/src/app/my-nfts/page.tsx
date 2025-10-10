"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/footer";
import SiteHeader from "@/components/header";
import img1 from "../../../public/img1.webp";

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
  type: string;
  image: StaticImageData;
  status: string;
  views: number;
  offers: number;
  ownerAddress: string;
  metadataUri: string;
  pricingChains: ChainPricing[];
  active: boolean;
}

// Mock user NFT data
const myCreatedNFTs: PropertyNFT[] = [
  {
    id: 1,
    tokenId: "1234",
    name: "Sunset Villa #42",
    location: "Miami Beach, FL",
    price: "2.5 ETH",
    type: "sale",
    image: img1,
    status: "listed",
    views: 124,
    offers: 3,
    ownerAddress: "0x1234567890123456789012345678901234567890",
    metadataUri: "ipfs://QmExample123",
    pricingChains: [
      { chainId: "1", price: "2500000000000000000", currency: "ETH", decimals: "18" },
    ],
    active: true,
  },
  {
    id: 2,
    tokenId: "5678",
    name: "Downtown Loft #17",
    location: "New York, NY",
    price: "0.15 ETH/mo",
    type: "lease",
    image: img1,
    status: "leased",
    views: 89,
    offers: 0,
    ownerAddress: "0x1234567890123456789012345678901234567890",
    metadataUri: "ipfs://QmExample456",
    pricingChains: [
      { chainId: "1", price: "150000000000000000", currency: "ETH", decimals: "18" },
    ],
    active: false,
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

const myRentedNFTs = [
  {
    id: 7,
    name: "Coastal Villa #12",
    location: "Santa Monica, CA",
    monthlyRate: "0.25 ETH/mo",
    rentStart: "2024-09-01",
    rentEnd: "2025-09-01",
    image: img1,
    daysRemaining: 325,
    renter: "0xabcd...1234",
  },
  {
    id: 8,
    name: "City Penthouse #56",
    location: "Chicago, IL",
    monthlyRate: "0.18 ETH/mo",
    rentStart: "2024-10-15",
    rentEnd: "2025-04-15",
    image: img1,
    daysRemaining: 187,
    renter: "0xef12...5678",
  },
];

type TabType = "created" | "owned" | "leased" | "rented";
type ModalType = "update" | "toggle" | null;

export default function MyNFTsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("created");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyNFT | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Update form state
  const [updatePricingChains, setUpdatePricingChains] = useState<ChainPricing[]>([]);

  // Toggle form state
  const [toggleActive, setToggleActive] = useState(false);

  const inputClasses = "w-full rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2";
  const labelClasses = "block text-sm font-bold mb-2 uppercase tracking-wide";

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
    setUpdatePricingChains([...updatePricingChains, { chainId: "", price: "", currency: "", decimals: "18" }]);
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
                Rented
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--color-border)]">
                {myRentedNFTs.length}
              </p>
              <p className="mt-1 text-xs opacity-70">Active rents</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            {(["created", "owned", "leased","rented"] as TabType[]).map((tab) => (
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

        {/* Rented NFTs Section */}
        {activeTab === "rented" && (
          <section>
            <h2 className="mb-6 text-2xl font-extrabold">Properties I&apos;m Renting Out</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myRentedNFTs.map((nft) => (
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
                      RENTED
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
                        <span className="text-xs font-bold">Rent Period:</span>
                        <span className="text-xs font-extrabold">{nft.rentStart} - {nft.rentEnd}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-none border-2 border-border bg-[var(--color-secondary)]/10 px-3 py-2">
                        <span className="text-xs font-bold">Days Remaining:</span>
                        <span className="text-xs font-extrabold text-[var(--color-secondary)]">{nft.daysRemaining}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-none border-2 border-border bg-[var(--color-accent)]/10 px-3 py-2">
                        <span className="text-xs font-bold">Renter:</span>
                        <span className="text-xs font-extrabold font-mono">{nft.renter}</span>
                      </div>
                    </div>

                    <Link
                      href={`/marketplace/${nft.id}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-none border-2 border-border bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-border)]"
                    >
                      Manage Rental
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
