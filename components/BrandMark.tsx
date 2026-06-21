"use client";

/**
 * BrandMark — the Candor wordmark + glyph.
 * Centralised so the brand name only needs to change in ONE place.
 * To rename the product, edit `components/BrandMark.tsx` and the
 * `metadata.title` in `app/layout.tsx` — nothing else references the name directly.
 */
export const PRODUCT_NAME = "Candor";

export function BrandMark({
  size = "md",
  onClick,
}: {
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  const dims = size === "sm" ? "w-7 h-7 text-[11px]" : "w-9 h-9 text-sm";
  const text = size === "sm" ? "text-base" : "text-lg";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div
        className={`${dims} rounded-[7px] bg-rust flex items-center justify-center font-display italic font-medium text-paper shrink-0`}
        aria-hidden="true"
      >
        C
      </div>
      <span className={`font-display ${text} tracking-tight text-text-primary`}>
        {PRODUCT_NAME}
      </span>
    </div>
  );
}
