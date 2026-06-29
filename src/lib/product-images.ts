import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

import { products, type Product, type ProductWithImage } from "@/data/products";

function getPublicImagePath(image: string) {
  const cleanPath = image.replace(/^\/+/, "");

  return path.join(process.cwd(), "public", cleanPath);
}

export function hasProductImage(product: Product) {
  return existsSync(getPublicImagePath(product.image));
}

export function withImageState(product: Product): ProductWithImage {
  return {
    ...product,
    imageAvailable: hasProductImage(product),
  };
}

export function getProductsWithImageState() {
  return products.map(withImageState);
}

export function getProductWithImageState(slug: string) {
  const product = products.find((item) => item.slug === slug);

  return product ? withImageState(product) : undefined;
}
