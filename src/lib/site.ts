export const siteConfig = {
  name: "MNC Ürün Evreni",
  brand: "MNC İLAÇ",
  description:
    "MNC İlaç takviye edici gıda ürünleri için modern, mobil öncelikli ve interaktif ürün katalog deneyimi.",
};

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  const url = configuredUrl ?? "http://localhost:3000";
  const withProtocol = url.startsWith("http") ? url : `https://${url}`;

  return withProtocol.replace(/\/$/, "");
}
