import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
import type { SortKey } from "@/lib/types";

const SORTS: SortKey[] = ["featured", "price-asc", "price-desc", "popularity"];

/**
 * GET /api/products?category=roses&search=peony&sort=price-asc
 * Server-side catalogue endpoint. The browser never touches the database directly.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const sortParam = searchParams.get("sort");
  const sort = sortParam && SORTS.includes(sortParam as SortKey) ? (sortParam as SortKey) : undefined;

  try {
    const products = await getProducts({ category, search, sort });
    return NextResponse.json(
      { products, count: products.length },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("[api/products] failed:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
