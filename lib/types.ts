/** Domain types shared across server queries, the API, and client components. */

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Whole-number amount in the shop currency (UZS). */
  price: number;
  currency: string;
  imageUrl: string | null;
  /** Descriptive size label (e.g. bouquet height). Does not affect price. */
  size: string | null;
  /** Category slug (denormalised for convenient filtering on the client). */
  categorySlug: string;
  categoryName: string;
  isFeatured: boolean;
  isBestseller: boolean;
  isAvailable: boolean;
  /** Higher = more popular; drives the "popularity" sort. */
  popularity: number;
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "popularity";

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: SortKey;
}
