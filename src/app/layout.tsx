import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "WSC Extreme Sports Arena",
  description:
    "AI-powered cabin scoring demo for WSC Extreme Sports Rage Room and Cabin Clash leaderboard.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WSC Arena",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/wsc-logo.svg"
                alt="WSC Extreme Sports"
                width={80}
                height={51}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/new-session"
                className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-400 transition-colors"
              >
                New Session
              </Link>
              <Link
                href="/leaderboard"
                className="text-xs font-semibold text-white/60 hover:text-white transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
