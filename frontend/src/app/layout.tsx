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
    appPreview: false,
  },
  modal: {
    loginLayout: PushUI.CONSTANTS.LOGIN.LAYOUT.SIMPLE,
    connectedLayout: PushUI.CONSTANTS.CONNECTED.LAYOUT.HOVER,
    appPreview: false,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PushUniversalWalletProvider 
      config={walletConfig}
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
