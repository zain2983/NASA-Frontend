import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased dark`}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur animate-in slide-in-from-top-2 duration-300">
            <Navbar />
          </header>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
