import { ArrowUpRight } from "lucide-react";

import type { ProductWithImage } from "@/data/products";
import { ProductControls } from "@/components/ProductControls";

type ProductOverlayInfoProps = {
  product: ProductWithImage;
  isAnimating: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function ProductOverlayInfo({
  product,
  isAnimating,
  onPrevious,
  onNext,
}: ProductOverlayInfoProps) {
  const href = product.externalUrl || "#";
  const hasExternalUrl = Boolean(product.externalUrl);

  return (
    <section className="stage-info-layer" aria-label="Seçili ürün bilgisi">
      <div className="stage-info-stack">
        <div className="stage-info-copy">
          <p className="stage-kicker">
            Aktif Ürün
          </p>
          <h2 className="stage-product-name">{product.name}</h2>
          <p className="stage-product-description">
            {product.shortDescription}
          </p>
          <p className="stage-disclaimer">
            Takviye edici gıdadır. İlaç değildir.
          </p>
        </div>

        <div className="stage-action-row">
          <ProductControls
            onPrevious={onPrevious}
            onNext={onNext}
            disabled={isAnimating}
          />
          <a
            href={href}
            target={hasExternalUrl ? "_blank" : undefined}
            rel={hasExternalUrl ? "noreferrer" : undefined}
            aria-label={`${product.name} ürün sayfasını aç`}
            aria-disabled={!hasExternalUrl}
            className="stage-mobile-cta"
          >
            <ArrowUpRight aria-hidden="true" className="size-5" />
          </a>
        </div>
      </div>

      <a
        href={href}
        target={hasExternalUrl ? "_blank" : undefined}
        rel={hasExternalUrl ? "noreferrer" : undefined}
        aria-label={`${product.name} ürün sayfasını aç`}
        aria-disabled={!hasExternalUrl}
        className="stage-desktop-cta group"
      >
        <span className="sr-only">Ürünü İncele</span>
        <span>Ürünü İncele</span>
        <ArrowUpRight
          aria-hidden="true"
          className="stage-desktop-cta-icon"
        />
      </a>
    </section>
  );
}
