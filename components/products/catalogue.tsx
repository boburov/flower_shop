"use client";

import { useMemo, useState } from "react";
import { SearchIcon, FilterIcon, CloseIcon } from "@/components/ui/icons";
import { ProductListCard } from "@/components/app/product-list-card";
import { ALL_CATEGORY, filterAndSortProducts, sortOptions } from "@/lib/catalogue";
import type { Category, Product, SortKey } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}

export function Catalogue({ products, categories, initialCategory }: Props) {
  const [category, setCategory] = useState<string>(
    initialCategory && categories.some((c) => c.slug === initialCategory)
      ? initialCategory
      : ALL_CATEGORY,
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(
    () => filterAndSortProducts(products, { category, search, sort }),
    [products, category, search, sort],
  );

  const isFiltered = category !== ALL_CATEGORY || search.trim() !== "" || sort !== "featured";
  const clearFilters = () => {
    setCategory(ALL_CATEGORY);
    setSearch("");
    setSort("featured");
    setShowFilters(false);
  };

  const chips = [{ slug: ALL_CATEGORY, name: "Hammasi" }, ...categories];

  return (
    <div className="px-4 pb-6">
      {/* Title + filter toggle */}
      <div className="flex items-center justify-between pt-4">
        <h1 className="font-display text-3xl text-ink">Katalog</h1>
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          aria-label="Saralash va qidiruv"
          aria-expanded={showFilters}
          className={cn(
            "grid h-11 w-11 place-items-center rounded-full transition-colors",
            showFilters || isFiltered ? "bg-ink text-cream" : "glass-card text-ink",
          )}
        >
          <FilterIcon size={20} />
        </button>
      </div>

      {/* Search + sort (collapsible) */}
      {showFilters && (
        <div className="mt-4 grid gap-3">
          <div className="relative">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buket yoki gul qidiring…"
              aria-label="Mahsulot qidirish"
              className="glass-card h-12 w-full rounded-full pl-11 pr-4 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-rose/40"
            />
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSort(opt.value)}
                aria-pressed={sort === opt.value}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-colors",
                  sort === opt.value ? "bg-rose/15 text-rose" : "glass-card text-muted hover:text-ink",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category chips */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {chips.map((chip) => {
          const active = category === chip.slug;
          return (
            <button
              key={chip.slug}
              type="button"
              onClick={() => setCategory(chip.slug)}
              aria-pressed={active}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active ? "bg-ink text-cream" : "glass-card text-ink hover:text-rose",
              )}
            >
              {chip.name}
            </button>
          );
        })}
      </div>

      {/* Results meta */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted" aria-live="polite">
          {results.length} ta natija
        </p>
        {isFiltered && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-sm font-medium text-rose"
          >
            <CloseIcon size={16} /> Tozalash
          </button>
        )}
      </div>

      {/* List or empty state */}
      <div className="mt-4">
        {results.length > 0 ? (
          <div className="grid gap-3">
            {results.map((product) => (
              <ProductListCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center rounded-[1.5rem] px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-blush text-rose">
              <SearchIcon size={28} />
            </span>
            <h3 className="mt-4 font-display text-xl text-ink">Hech narsa topilmadi</h3>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Qidiruvingizga mos buket topilmadi. Boshqa so'z kiriting yoki filtrlarni tozalang.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-cream"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
