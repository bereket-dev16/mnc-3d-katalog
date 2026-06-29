import type { ProductWithImage } from "@/data/products";

type ProductFallbackVisualProps = {
  product: ProductWithImage;
};

export function ProductFallbackVisual({ product }: ProductFallbackVisualProps) {
  return (
    <div className="relative flex h-full w-full items-end justify-center pb-[3%]">
      <div
        className="absolute bottom-[1%] h-[10%] w-[58%] rounded-[50%] opacity-42 blur-2xl"
        style={{ backgroundColor: product.accentColor ?? "white" }}
      />
      <div className="relative h-[84%] w-[min(62%,18rem)] max-w-[18rem]">
        <div className="absolute inset-x-[10%] bottom-[2%] h-[8%] rounded-[50%] bg-black/24 blur-lg" />
        <div className="stage-packaging relative h-full w-full overflow-hidden rounded-[22px] border border-white/32 bg-white/10 shadow-[0_42px_90px_rgba(0,0,0,0.26)] backdrop-blur-[2px]">
          <div
            className="absolute inset-x-0 top-0 h-[7%] opacity-80"
            style={{ backgroundColor: product.accentColor ?? "white" }}
          />
          <div className="absolute inset-3 rounded-[18px] border border-white/22" />
          <div className="absolute inset-x-[18%] top-[16%] h-px bg-white/60" />
          <div className="absolute inset-x-[12%] top-[24%] h-[32%] rounded-full bg-white/14 blur-2xl" />
          <div className="absolute inset-x-[24%] bottom-[13%] h-[8%] rounded-full bg-white/18 blur-xl" />
        </div>
      </div>
    </div>
  );
}
