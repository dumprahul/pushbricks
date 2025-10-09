"use client";

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import logo from "../../public/logo.svg"

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative top-0 z-50 rounded-none border-b-2 border-border bg-white shadow-[6px_6px_0_var(--color-primary)]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="Push Bricks home" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="Push Bricks logo"
            width={36}
            height={36}
            priority
          />
          <span className="font-sans text-sm font-semibold tracking-tight">Push Bricks</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4 text-sm font-semibold">
          <Link href="/marketplace" className="transition-colors hover:text-[var(--color-primary)]">
            Marketplace
          </Link>
          <Link href="/my-nfts" className="transition-colors hover:text-[var(--color-secondary)]">
            My NFTs
          </Link>
          <Link href="/list" className="transition-colors hover:text-[var(--color-secondary)]">
            List Property
          </Link>
          <Link 
            href="" 
            className="rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-1.5 text-xs font-black uppercase transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-border)] shadow-[3px_3px_0_var(--color-border)]"
          >
            Connect wallet
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden rounded-none border-2 border-border bg-[var(--color-primary)] p-2 text-white shadow-[3px_3px_0_var(--color-border)] transition-all active:translate-y-[1px] active:shadow-[2px_2px_0_var(--color-border)]"
          aria-label="Toggle menu"
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
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-border bg-white">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3">
            <Link 
              href="/marketplace" 
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-bold transition-colors hover:bg-[var(--color-primary)] hover:text-white"
            >
              Marketplace
            </Link>
            <Link 
              href="/my-nfts" 
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-bold transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
            >
              My NFTs
            </Link>
            <Link 
              href="/list" 
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-none border-2 border-border bg-white px-4 py-3 text-sm font-bold transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
            >
              List Property
            </Link>
            <Link 
              href="" 
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-none border-2 border-border bg-[var(--color-accent)] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)]"
            >
              Connect wallet
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
