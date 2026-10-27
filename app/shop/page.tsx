import type { Metadata } from "next";
import { Catalogue } from "@/components/products/catalogue";
import { getProducts, getCategories } from "@/lib/products";

// Admin-bot edits must reach the catalogue without a rebuild.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Katalog",
  description:
    "Yangi buketlarimizning to'liq to'plami — atirgul, pion, lola, dahliya va mavsumiy kompozitsiyalar. Saralang, qidiring va Telegram orqali buyurtma bering.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, products, categories] = await Promise.all([
    searchParams,
    getProducts(),
    getCategories(),
  ]);

  return <Catalogue products={products} categories={categories} initialCategory={category} />;
}
