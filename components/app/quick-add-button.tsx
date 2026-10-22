"use client";

import { useState } from "react";
import { PlusIcon, TickIcon } from "@/components/ui/icons";
import { useBasket } from "@/components/basket/basket-provider";
import { formatAmount } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

/**
 * Compact "+ price" add-to-basket button, matching the reference app's pill.
 * Quick add; the full Telegram order lives on the product page and basket.
 */
export function QuickAddButton({
  product,
  variant = "light",
  className,
}: {
  product: Product;
  variant?: "light" | "dark" | "glass";
  className?: string;
}) {
  const { addItem } = useBasket();
  const [added, setAdded] = useState(false);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={`${product.name} savatga qo'shish`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all active:scale-95",
        variant === "dark" && "bg-ink text-cream hover:bg-ink/90",
        variant === "glass" && "glass text-ink",
        variant === "light" && "bg-sand text-ink shadow-soft hover:bg-blush",
        className,
      )}
    >
      {added ? <TickIcon size={16} className="text-sage" /> : <PlusIcon size={16} />}
      <span className="tabular-nums">{formatAmount(product.price)}</span>
    </button>
  );
}
