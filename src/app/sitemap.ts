import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();

  return [
    {
      url: `${baseUrl}/urun-katalog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
