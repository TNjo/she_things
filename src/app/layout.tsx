import type { Metadata, Viewport } from "next";
import { Anton, Instrument_Sans, Reenie_Beanie } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/StoreProvider";

// Loud condensed display + friendly grotesk + a genuinely messy hand scrawl
const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const hand = Reenie_Beanie({ subsets: ["latin"], weight: "400", variable: "--font-hand", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "She Things — earrings with a little drama", template: "%s · She Things" },
  description: "Hoops, huggies, pearls and real gold – earrings and jewellery handpicked in Colombo. Pay in 3 with Koko or Mintpay. Island-wide delivery.",
  openGraph: { type: "website", siteName: "She Things", locale: "en_LK" },
};

export const viewport: Viewport = {
  themeColor: "#F7F3EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${hand.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
      </head>
      {/* browser extensions (e.g. Grammarly) inject attributes on <body> */}
      <body suppressHydrationWarning>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
