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

const animationMs = 560;

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

function getNeighborModelPreloadOrder(
  products: ProductWithImage[],
  activeIndex: number,
) {
  const orderedModels: string[] = [];
  const seen = new Set<string>();

  function addModelAt(index: number) {
    const product = products[(index + products.length) % products.length];
    const model = product?.model;

    if (!model || seen.has(model)) return;

    seen.add(model);
    orderedModels.push(model);
  }

  addModelAt(activeIndex - 1);
  addModelAt(activeIndex + 1);
  addModelAt(activeIndex + 2);

  return orderedModels;
}

export function ProductStage({ products }: ProductStageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [readyModels, setReadyModels] = useState<Record<string, true>>({});
  const [shouldAutoRotateModel, setShouldAutoRotateModel] = useState(false);
  const lockRef = useRef(false);
  const pointerStartX = useRef<number | null>(null);
  const preloadedModelsRef = useRef<Set<string>>(new Set());
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

  const preloadModel = useCallback((model: string | undefined) => {
    if (!model || preloadedModelsRef.current.has(model)) return;

    preloadedModelsRef.current.add(model);
    useGLTF.preload(model);
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
    const desktopQuery = window.matchMedia(
      "(min-width: 900px) and (hover: hover) and (pointer: fine)",
    );
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updateAutoRotatePreference = () => {
      setShouldAutoRotateModel(
        desktopQuery.matches && !reducedMotionQuery.matches,
      );
    };

    updateAutoRotatePreference();
    desktopQuery.addEventListener("change", updateAutoRotatePreference);
    reducedMotionQuery.addEventListener("change", updateAutoRotatePreference);

    return () => {
      desktopQuery.removeEventListener("change", updateAutoRotatePreference);
      reducedMotionQuery.removeEventListener(
        "change",
        updateAutoRotatePreference,
      );
    };
  }, []);

  useEffect(() => {
    preloadModel(activeProduct.model);

    const idleIds: number[] = [];
    const timeoutIds: number[] = [];
    const queue = getNeighborModelPreloadOrder(products, activeIndex);
    const idleWindow = window as IdleWindow;

    const scheduleNext = (index: number) => {
      const model = queue[index];

      if (!model) return;

      const preloadQueuedModel = () => {
        preloadModel(model);

        const timeoutId = window.setTimeout(() => {
          scheduleNext(index + 1);
        }, 360);

        timeoutIds.push(timeoutId);
      };

      if (idleWindow.requestIdleCallback) {
        const idleId = idleWindow.requestIdleCallback(preloadQueuedModel, {
          timeout: 1800,
        });

        idleIds.push(idleId);

        return;
      }

      const timeoutId = window.setTimeout(preloadQueuedModel, 420);
      timeoutIds.push(timeoutId);
    };

    scheduleNext(0);

    return () => {
      idleIds.forEach((idleId) => idleWindow.cancelIdleCallback?.(idleId));
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [activeIndex, activeProduct.model, preloadModel, products]);

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
        {products.map((product, index) => {
          const role = getRole(index, activeIndex, products.length);

          if (role === "hidden") return null;

          return (
            <ProductFigure
              key={product.slug}
              modelReady={activeProduct.slug === product.slug && activeModelReady}
              product={product}
              role={role}
            />
          );
        })}

        <div
          className="stage-model-slot"
          data-active={activeProduct.model ? "true" : "false"}
          data-ready={activeModelReady ? "true" : "false"}
        >
          <ProductModelViewer
            autoRotate={shouldAutoRotateModel}
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
