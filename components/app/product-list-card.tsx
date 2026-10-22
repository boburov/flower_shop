import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { QuickAddButton } from "@/components/app/quick-add-button";
import type { Product } from "@/lib/types";

/**
 * Horizontal catalogue card (reference style): name + size on the left, image on
 * the right, a compact "+ price" add button at the bottom-left.
 */
export function ProductListCard({ product }: { product: Product }) {
  return (
    <article className="glass-card relative flex items-stretch gap-3 rounded-[1.5rem] p-3">
      <div className="flex min-w-0 flex-1 flex-col py-1 pl-1">
        <Link href={`/product/${product.slug}`} className="min-w-0">
          <h3 className="font-display text-lg leading-tight text-ink">{product.name}</h3>
          <p className="mt-1 text-xs text-muted">
            {product.size ? `${product.size}, tanlangan` : product.categoryName}
          </p>
        </Link>
        <div className="mt-auto pt-3">
          <QuickAddButton product={product} />
        </div>
      </div>

      <Link
        href={`/product/${product.slug}`}
        aria-label={product.name}
        className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-2xl bg-blush sm:w-32"
      >
        <ProductImage
          src={product.imageUrl}
          alt={`${product.name} buketi`}
          fill
          sizes="128px"
        />
      </Link>
    </article>
  );
}
