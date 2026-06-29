import type { Metadata } from "next";
import "./globals.css";

import { getSiteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: siteConfig.name,
  title: {
    default: "MNC Ürün Evreni | İnteraktif Takviye Kataloğu",
    template: "%s | MNC Ürün Evreni",
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/urun-katalog",
  },
  openGraph: {
    title: "MNC Ürün Evreni",
    description: siteConfig.description,
    url: "/urun-katalog",
    siteName: siteConfig.name,
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
