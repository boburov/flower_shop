import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/lib/config";
import { BasketProvider } from "@/components/basket/basket-provider";
import { BottomNav } from "@/components/layout/bottom-nav";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["gullar", "buket", "pion", "atirgul", "gul yetkazib berish", "gul buyurtma"],
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-app-bg text-ink antialiased">
        <BasketProvider>
          <div className="app-shell">
            <main className="flex-1 pb-20">{children}</main>
            <BottomNav />
          </div>
        </BasketProvider>
      </body>
    </html>
  );
}
