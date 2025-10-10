"use client";
import type React from "react"
import "./globals.css"
import { Suspense } from "react"
import { Space_Grotesk } from "next/font/google"
import {
  PushUniversalWalletProvider,
  PushUI,
} from '@pushchain/ui-kit';

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

const walletConfig = {
  uid: 'pushbricks-wallet',
  network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
  login: {
    email: true,
    google: true,
    wallet: {
      enabled: true,
    },
    appPreview: true,
  },
  modal: {
    loginLayout: PushUI.CONSTANTS.LOGIN.LAYOUT.SPLIT,
    connectedLayout: PushUI.CONSTANTS.CONNECTED.LAYOUT.HOVER,
    appPreview: true,
  },
};

const appMetadata = {
  logoUrl: 'https://imgs.search.brave.com/vCgGf_GUzoftox-myJ37vgid25WVYX12g0AFBGkwup8/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly9wdXNo/Lm9yZy9hc3NldHMv/d2Vic2l0ZS9kb2Nz/aHViL1B1c2hMb2dv/QmxhY2tAM3gucG5n', // Using your Push Bricks logo
  title: 'Push Bricks',
  description: 'Tokenize. Lease. Borrow.',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PushUniversalWalletProvider 
      config={walletConfig}
      app={appMetadata}
      themeOverrides={{
        '--pw-core-bg-primary-color': '#FFFFFF33',
      }}
    >
      <html lang="en" className={`${spaceGrotesk.variable} antialiased`}>
        <body className="font-sans">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </body>
      </html>
    </PushUniversalWalletProvider>

  )
}
