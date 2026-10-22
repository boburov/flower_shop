import "server-only";

import { prisma, hasDatabase } from "./prisma";
import { seedProducts, seedCategories } from "./data/seed-data";
import { filterAndSortProducts } from "./catalogue";
import type { Category, Product, ProductFilters } from "./types";

/**
 * Server-side catalogue queries.
 *
 * Reads from Neon via Prisma when a real DATABASE_URL is set; otherwise falls
 * back to the bundled seed data so the site runs with zero configuration. All DB
 * access is server-only — the browser never talks to PostgreSQL directly.
 *
 * The catalogue is small (a boutique, not a marketplace), so filtering/sorting is
 * applied in-memory via the shared `filterAndSortProducts` helper. This keeps the
 * database and fallback paths behaviourally identical. For large inventories,
 * push the filters down into the Prisma query instead.
 */

const categoryNameBySlug = new Map(seedCategories.map((c) => [c.slug, c.name]));

function seedToProduct(p: (typeof seedProducts)[number]): Product {
  return {
    id: p.slug,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    currency: p.currency,
    imageUrl: p.imageUrl,
    size: p.size,
    categorySlug: p.categorySlug,
    categoryName: categoryNameBySlug.get(p.categorySlug) ?? p.categorySlug,
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    isAvailable: p.isAvailable,
    popularity: p.popularity,
  };
}

/** Shape returned by the Prisma query below (product with its category joined). */
type DbProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  size: string | null;
  isFeatured: boolean;
  isBestseller: boolean;
  isAvailable: boolean;
  popularity: number;
  category: { slug: string; name: string };
};

function dbToProduct(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    currency: p.currency,
    imageUrl: p.imageUrl,
    size: p.size,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    isAvailable: p.isAvailable,
    popularity: p.popularity,
  };
}

/** Load all available products from the DB, or the seed fallback on any failure. */
async function loadAllProducts(): Promise<Product[]> {
  if (hasDatabase()) {
    try {
      const rows = await prisma.product.findMany({
        where: { isAvailable: true },
        include: { category: { select: { slug: true, name: true } } },
        orderBy: { popularity: "desc" },
      });
      if (rows.length > 0) return rows.map(dbToProduct);
    } catch (error) {
      console.error("[products] Database query failed, using seed fallback:", error);
    }
  }
  return seedProducts.filter((p) => p.isAvailable).map(seedToProduct);
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const all = await loadAllProducts();
  return filterAndSortProducts(all, filters);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const all = await loadAllProducts();
  return all.filter((p) => p.isFeatured).slice(0, limit);
}

export async function getBestsellers(limit = 4): Promise<Product[]> {
  const all = await loadAllProducts();
  return all
    .filter((p) => p.isBestseller)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Products for the home hero. Prefers bestsellers, then featured, then any
 * available product — so the dashboard is never empty, even when an admin has
 * added their own products without flagging them.
 */
export async function getHeroProducts(limit = 4): Promise<Product[]> {
  const all = await loadAllProducts();
  const bestsellers = all.filter((p) => p.isBestseller).sort((a, b) => b.popularity - a.popularity);
  if (bestsellers.length > 0) return bestsellers.slice(0, limit);
  const featured = all.filter((p) => p.isFeatured);
  if (featured.length > 0) return featured.slice(0, limit);
  return all.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await loadAllProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getAllProductSlugs(): Promise<string[]> {
  const all = await loadAllProducts();
  return all.map((p) => p.slug);
}

export async function getCategories(): Promise<Category[]> {
  if (hasDatabase()) {
    try {
      const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
      if (rows.length > 0) {
        return rows.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl,
        }));
      }
    } catch (error) {
      console.error("[products] Category query failed, using seed fallback:", error);
    }
  }
  return seedCategories.map((c) => ({
    id: c.slug,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
  }));
}
