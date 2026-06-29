"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

type ProductControlsProps = {
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
};

export function ProductControls({
  onPrevious,
  onNext,
  disabled = false,
}: ProductControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Önceki ürünü göster"
        onClick={onPrevious}
        disabled={disabled}
        className="grid size-12 place-items-center rounded-full border-2 border-white/82 bg-white/0 text-white shadow-[0_18px_44px_rgba(0,0,0,0.22)] backdrop-blur-sm transition duration-300 hover:scale-105 hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-45 sm:size-14 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <ArrowLeft aria-hidden="true" className="size-5 sm:size-6" />
      </button>
      <button
        type="button"
        aria-label="Sonraki ürünü göster"
        onClick={onNext}
        disabled={disabled}
        className="grid size-12 place-items-center rounded-full border-2 border-white/82 bg-white/0 text-white shadow-[0_18px_44px_rgba(0,0,0,0.22)] backdrop-blur-sm transition duration-300 hover:scale-105 hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-45 sm:size-14 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <ArrowRight aria-hidden="true" className="size-5 sm:size-6" />
      </button>
    </div>
  );
}
