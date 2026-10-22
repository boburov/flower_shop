"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { QuickAddButton } from "@/components/app/quick-add-button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

/**
 * Swipeable hero: large product images that fade out at the bottom into the page
 * background, with a glass floating card (name + size) and a glass add button.
 */
export function HeroCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== active) setActive(index);
  };

  if (products.length === 0) return null;

  return (
    <section aria-label="Tanlangan buketlar">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {products.map((product, i) => (
          <div key={product.id} className="relative w-full shrink-0 snap-center">
            {/* Full-bleed image, faded out at the bottom */}
            <div className="hero-fade relative aspect-[3/4] w-full">
              <Link href={`/product/${product.slug}`} aria-label={product.name}>
                <ProductImage
                  src={product.imageUrl}
                  alt={`${product.name} buketi`}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 481px) 480px, 100vw"
                />
              </Link>
            </div>

            {/* Glass floating card over the lower part of the image */}
            <div className="absolute inset-x-4 bottom-[20%] flex items-stretch gap-3">
              <Link
                href={`/product/${product.slug}`}
                className="glass flex-1 rounded-2xl px-4 py-3"
              >
                <p className="font-display text-lg leading-tight text-ink">{product.name}</p>
                <p className="mt-0.5 text-xs text-ink/70">
                  {product.size ? `${product.size}, tanlangan` : product.categoryName}
                </p>
              </Link>
              <QuickAddButton product={product} variant="glass" className="shrink-0 px-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Dots, pulled up over the faded bottom */}
      {products.length > 1 && (
        <div className="relative z-10 -mt-[12%] flex items-center justify-center gap-1.5">
          {products.map((p, i) => (
            <span
              key={p.id}
              aria-hidden="true"
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-5 bg-rose" : "w-1.5 bg-ink/20",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
