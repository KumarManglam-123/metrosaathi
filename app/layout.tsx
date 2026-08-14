import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#070a13",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "MetroSaathi — Bangalore Metro Route Finder & BMRCL Transit Guide",
  description:
    "Find the fastest routes, interchange points, station-to-station fares, and travel times across Bangalore's Namma Metro Purple, Green, and Yellow lines.",
  keywords: [
    "MetroSaathi",
    "Bangalore Metro",
    "Namma Metro",
    "BMRCL",
    "Metro Route Finder",
    "Purple Line",
    "Green Line",
    "Yellow Line",
    "Electronic City Metro",
    "Majestic Metro",
    "Bangalore Transit",
  ],
  authors: [{ name: "MetroSaathi" }],
  openGraph: {
    title: "MetroSaathi — Bangalore Metro Route Finder",
    description:
      "Interactive route finder, fare calculator, and visual map for Namma Metro (BMRCL) Purple, Green & Yellow lines.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="bg-[#070a13] text-slate-100 min-h-screen antialiased selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
