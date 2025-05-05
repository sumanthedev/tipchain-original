"use client";

import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import "@burnt-labs/ui/dist/index.css";
import Navbar from "@/components/Navbar";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-space',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.className} bg-[#0a0e17] text-gray-100`}>
        <AbstraxionProvider
          config={{
            treasury: "xion134a45fcu88dtp7a6cqa8d2zj4cphs803cyx3qnpvrlvk4spqtuuqkvrdhp",
            gasPrice: "0.01uxion",
            rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
            restUrl: "https://api.xion-testnet-2.burnt.com:443",
          }}
        >
          <Providers>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <footer className="py-6 border-t border-[#1d293e] mt-12">
                <div className="max-w-6xl mx-auto px-6">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="bg-indigo-600 text-white p-2 rounded-xl rotate-3 transform mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">TipChain</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      © {new Date().getFullYear()} Tip Chain - Built on XION
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </Providers>
        </AbstraxionProvider>
      </body>
    </html>
  );
}
