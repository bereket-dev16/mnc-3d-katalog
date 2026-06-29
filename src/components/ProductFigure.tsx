"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ProductWithImage } from "@/data/products";
import { ProductFallbackVisual } from "@/components/ProductFallbackVisual";

export type FigureRole = "center" | "left" | "right" | "back" | "hidden";

type ProductFigureProps = {
  modelReady?: boolean;
  product: ProductWithImage;
  role: FigureRole;
};

export function ProductFigure({
  modelReady = false,
  product,
  role,
}: ProductFigureProps) {
  const figureRef = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = product.imageAvailable && !imageFailed;
  const hasActiveModelReady = Boolean(product.model && role === "center" && modelReady);
  const hasDepthEffect = product.visualEffect === "tilt-depth" && !product.model;
  const isDepthEffectActive = hasDepthEffect && role === "center";
  const canTilt = isDepthEffectActive;

  const resetTilt = useCallback(() => {
    const element = figureRef.current;

    if (!element) return;

    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--glint-x", "50%");
    element.style.setProperty("--glint-y", "42%");
  }, []);

  const updateTilt = useCallback((clientX: number, clientY: number) => {
    const element = figureRef.current;

    if (!element) return;

    const x = clientX / Math.max(window.innerWidth, 1) - 0.5;
    const y = clientY / Math.max(window.innerHeight, 1) - 0.5;

    element.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
    element.style.setProperty("--tilt-y", `${(x * 10).toFixed(2)}deg`);
    element.style.setProperty("--glint-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    element.style.setProperty("--glint-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  }, []);

  useEffect(() => {
    if (!canTilt) resetTilt();
  }, [canTilt, resetTilt]);

  useEffect(() => {
    if (!canTilt) return undefined;

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;

      updateTilt(event.clientX, event.clientY);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", resetTilt);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", resetTilt);
    };
  }, [canTilt, resetTilt, updateTilt]);

  return (
    <div
      ref={figureRef}
      className="stage-item"
      data-depth-effect={isDepthEffectActive ? product.visualEffect : undefined}
      data-has-model={hasActiveModelReady ? "true" : undefined}
      data-model-ready={hasActiveModelReady ? "true" : undefined}
      data-role={role}
      aria-hidden={role !== "center" || hasActiveModelReady}
      style={
        {
          "--figure-accent": product.accentColor ?? "rgba(255,255,255,0.85)",
          "--tilt-x": "0deg",
          "--tilt-y": "0deg",
          "--glint-x": "50%",
          "--glint-y": "42%",
        } as CSSProperties
      }
      onPointerCancel={resetTilt}
    >
      <div className="stage-figure-glow" />
      <div className={isDepthEffectActive ? "stage-figure-shell stage-depth-stage" : "stage-figure-shell"}>
        <div className={isDepthEffectActive ? "stage-depth-card" : "stage-plain-card"}>
          {showImage ? (
            <Image
              src={product.image}
              alt={`${product.name} ürün görseli`}
              fill
              quality={100}
              priority={role === "center"}
              draggable={false}
              sizes={
                role === "center"
                  ? "(max-width: 768px) 74vw, 44vw"
                  : "(max-width: 768px) 32vw, 20vw"
              }
              className="stage-product-image select-none object-contain object-bottom drop-shadow-[0_54px_70px_rgba(0,0,0,0.32)]"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <ProductFallbackVisual product={product} />
          )}
        </div>
      </div>
    </div>
  );
}
