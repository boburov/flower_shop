"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type TabKey = "popular" | "bouquets" | "compositions";

const tabs: { key: TabKey; label: string }[] = [
  { key: "popular", label: "Mashhur" },
  { key: "bouquets", label: "Buketlar" },
  { key: "compositions", label: "Kompozitsiyalar" },
];

export function HomeCollections({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<TabKey>("popular");

  const items = useMemo(() => {
    switch (tab) {
      case "bouquets":
        return products.filter((p) =>
          ["mixed-bouquets", "romantic-bouquets"].includes(p.categorySlug),
        );
      case "compositions":
        return products.filter((p) => ["dahlias", "tulips", "peonies"].includes(p.categorySlug));
      case "popular":
      default:
        return [...products].sort((a, b) => b.popularity - a.popularity);
    }
  }, [products, tab]);

  return (
    <section className="mt-6 px-4">
      {/* Tabs */}
      <div className="no-scrollbar flex gap-5 overflow-x-auto" role="tablist" aria-label="To'plamlar">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 pb-1 font-display text-xl transition-colors",
              tab === t.key ? "text-ink" : "text-muted/70 hover:text-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Circle thumbnails */}
      <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-1">
        {items.slice(0, 10).map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="flex w-24 shrink-0 flex-col items-center gap-2 text-center"
          >
            <div className="relative aspect-square w-24 overflow-hidden rounded-full border border-line bg-blush">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="96px"
                className="transition-transform duration-500 active:scale-105"
              />
            </div>
            <span className="line-clamp-2 text-xs font-medium leading-tight text-ink">
              {product.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/shop"
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-rose"
      >
        Katalogni ochish <ArrowRightIcon size={16} />
      </Link>
    </section>
  );
}
