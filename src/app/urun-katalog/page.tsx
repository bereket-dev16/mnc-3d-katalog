import type { Metadata } from "next";

import { ProductStage } from "@/components/ProductStage";
import { getProductsWithImageState } from "@/lib/product-images";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "MNC Ürün Evreni",
  description:
    "MNC İlaç takviye edici gıda ürünleri için mobil öncelikli, interaktif ve SEO uyumlu ürün katalog deneyimi.",
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

export default function ProductCatalogPage() {
  const products = getProductsWithImageState();

  return <ProductStage products={products} />;
}
