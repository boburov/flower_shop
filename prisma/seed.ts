/**
 * Seeds the database with sample categories and products.
 *
 * Run with: npm run db:seed   (requires a real DATABASE_URL / DIRECT_URL).
 * Idempotent — safe to re-run; it upserts by slug.
 */
import { PrismaClient } from "@prisma/client";
import { seedCategories, seedProducts } from "../lib/data/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding categories...");
  const categoryIdBySlug = new Map<string, string>();

  for (const category of seedCategories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, imageUrl: category.imageUrl },
      create: { name: category.name, slug: category.slug, imageUrl: category.imageUrl },
    });
    categoryIdBySlug.set(category.slug, record.id);
  }
  console.log(`   ✓ ${seedCategories.length} categories`);

  console.log("🌸 Seeding products...");
  for (const product of seedProducts) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(
        `Product "${product.slug}" references unknown category "${product.categorySlug}".`,
      );
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
        size: product.size,
        isFeatured: product.isFeatured,
        isBestseller: product.isBestseller,
        isAvailable: product.isAvailable,
        popularity: product.popularity,
        categoryId,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
        size: product.size,
        isFeatured: product.isFeatured,
        isBestseller: product.isBestseller,
        isAvailable: product.isAvailable,
        popularity: product.popularity,
        categoryId,
      },
    });
  }
  console.log(`   ✓ ${seedProducts.length} products`);
  console.log("✅ Seed complete.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
