import Image from 'next/image'
import React from 'react'
import logo from "../../public/logo.svg"

function Footer() {
  return (
    <div>
        <footer className="mt-14 rounded-none border-2 border-border bg-[var(--color-footer)] p-6 text-[var(--color-footer-foreground)]">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="Push Bricks logo" className="h-8 w-8 text-white" width={32} height={32} />
            <span className="text-sm font-bold uppercase tracking-wide">Push Bricks</span>
          </div>
          <p className="text-xs opacity-80">© {new Date().getFullYear()} Push Bricks. Built on Push Chain.</p>
        </div>
      </footer>
    </div>
  )
}

export default Footer
