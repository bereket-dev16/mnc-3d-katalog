"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";

import type { ProductWithImage } from "@/data/products";
import { ProductFigure, type FigureRole } from "@/components/ProductFigure";
import { ProductModelViewer } from "@/components/ProductModelViewer";
import { ProductOverlayInfo } from "@/components/ProductOverlayInfo";

type ProductStageProps = {
  products: ProductWithImage[];
};

const animationMs = 720;

type IdleWindow = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number },
  ) => number;
};

function getRole(index: number, activeIndex: number, total: number): FigureRole {
  const left = (activeIndex + total - 1) % total;
  const right = (activeIndex + 1) % total;
  const back = (activeIndex + 2) % total;

  if (index === activeIndex) return "center";
  if (index === left) return "left";
  if (index === right) return "right";
  if (index === back) return "back";

  return "hidden";
}

function getModelPreloadOrder(products: ProductWithImage[], activeIndex: number) {
  const orderedModels: string[] = [];
  const seen = new Set<string>();

  function addModelAt(index: number) {
    const product = products[(index + products.length) % products.length];
    const model = product?.model;

    if (!model || seen.has(model)) return;

    seen.add(model);
    orderedModels.push(model);
  }

  addModelAt(activeIndex);
  addModelAt(activeIndex - 1);
  addModelAt(activeIndex + 1);

  products.forEach((product) => {
    if (!product.model || seen.has(product.model)) return;

    seen.add(product.model);
    orderedModels.push(product.model);
  });

  return orderedModels;
}

export function ProductStage({ products }: ProductStageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [readyModels, setReadyModels] = useState<Record<string, true>>({});
  const lockRef = useRef(false);
  const pointerStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotionRef = useRef(false);

  const activeProduct = products[activeIndex];
  const activeModelReady = Boolean(
    activeProduct.model && readyModels[activeProduct.model],
  );

  const releaseLock = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(
      () => {
        lockRef.current = false;
        setIsAnimating(false);
      },
      reducedMotionRef.current ? 80 : animationMs,
    );
  }, []);

  const navigate = useCallback(
    (direction: "next" | "prev") => {
      if (lockRef.current) return;

      lockRef.current = true;
      setIsAnimating(true);
      setActiveIndex((current) => {
        const step = direction === "next" ? 1 : -1;

        return (current + step + products.length) % products.length;
      });
      releaseLock();
    },
    [products.length, releaseLock],
  );

  const handleModelReady = useCallback((src: string) => {
    setReadyModels((current) => {
      if (current[src]) return current;

      return {
        ...current,
        [src]: true,
      };
    });
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    pointerStartX.current = event.clientX;
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    if (pointerStartX.current === null) return;

    const distance = event.clientX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(distance) < 44) return;

    navigate(distance > 0 ? "prev" : "next");
  }

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = query.matches;

    const handleChange = () => {
      reducedMotionRef.current = query.matches;
    };

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const preloadModels = () => {
      getModelPreloadOrder(products, activeIndex).forEach((model) => {
        useGLTF.preload(model);
      });
    };
    const idleWindow = window as IdleWindow;

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(preloadModels, {
        timeout: 1200,
      });

      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(preloadModels, 120);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, products]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") navigate("prev");
      if (event.key === "ArrowRight") navigate("next");
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <main
      className="product-stage relative w-full overflow-hidden text-white"
      style={
        {
          "--stage-bg": activeProduct.bgColor,
          "--stage-panel": activeProduct.panelColor ?? activeProduct.bgColor,
          "--stage-accent": activeProduct.accentColor ?? "rgba(255,255,255,0.86)",
        } as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStartX.current = null;
      }}
    >
      <h1 className="sr-only">MNC Ürün Evreni</h1>

      <div className="stage-grain absolute inset-0 pointer-events-none z-0" />
      <div className="stage-light absolute inset-0 pointer-events-none z-0" />
      <div className="stage-floor absolute inset-x-0 bottom-0 pointer-events-none z-[2]" />

      <p className="stage-brand">MNC İLAÇ</p>

      <div className="stage-ghost-layer" aria-hidden="true">
        {products.map((product, index) => (
          <div
            key={product.slug}
            className="stage-ghost"
            data-active={index === activeIndex}
          >
            {product.ghostText}
          </div>
        ))}
      </div>

      <section className="stage-carousel" aria-label="Ürün seçim sahnesi">
        {products.map((product, index) => (
          <ProductFigure
            key={product.slug}
            modelReady={activeProduct.slug === product.slug && activeModelReady}
            product={product}
            role={getRole(index, activeIndex, products.length)}
          />
        ))}

        <div
          className="stage-model-slot"
          data-active={activeProduct.model ? "true" : "false"}
          data-ready={activeModelReady ? "true" : "false"}
        >
          <ProductModelViewer
            isReady={activeModelReady}
            label={activeProduct.name}
            onReady={handleModelReady}
            src={activeProduct.model}
          />
        </div>
      </section>

      <ProductOverlayInfo
        product={activeProduct}
        isAnimating={isAnimating}
        onPrevious={() => navigate("prev")}
        onNext={() => navigate("next")}
      />
    </main>
  );
}
