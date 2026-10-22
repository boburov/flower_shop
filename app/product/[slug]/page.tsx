import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";
import { ProductOrderPanel } from "@/components/products/product-order-panel";
import { ProductListCard } from "@/components/app/product-list-card";
import { getProductBySlug, getAllProductSlugs, getProducts } from "@/lib/products";
import { resolveImageUrl, formatPrice } from "@/lib/config";

// The catalogue is known at build time, so any slug not produced by
// generateStaticParams is a genuine 404 (correct status for SEO/crawlers).
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Buket topilmadi" };

  const image = resolveImageUrl(product.imageUrl);
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      images: [{ url: image, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts({ category: product.categorySlug }))
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="pb-6">
      {/* Image with back button */}
      <div className="relative aspect-square overflow-hidden bg-blush">
        <ProductImage
          src={product.imageUrl}
          alt={`${product.name} buketi`}
          fill
          priority
          sizes="(min-width: 481px) 480px, 100vw"
        />
        <Link
          href="/shop"
          aria-label="Orqaga"
          className="glass absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full text-ink"
        >
          <ChevronLeftIcon size={20} />
        </Link>
        <Link
          href={`/shop?category=${product.categorySlug}`}
          className="glass absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-medium text-ink"
        >
          {product.categoryName}
        </Link>
      </div>

      {/* Details */}
      <div className="px-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight text-ink">{product.name}</h1>
            {product.size && <p className="mt-1 text-sm text-muted">{product.size}, tanlangan</p>}
          </div>
          <span className="shrink-0 font-display text-2xl text-rose">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>

        <p className="mt-4 text-[15px] leading-relaxed text-muted">{product.description}</p>

        <ul className="mt-5 space-y-2 text-sm text-muted">
          <li>• Yetkazib berish kuni florist tomonidan qo'lda yig'iladi</li>
          <li>• Mavsumiy, yangi kesilgan gullardan tanlangan</li>
          <li>• Qadoq va shoyi lenta bilan bezatilgan</li>
        </ul>

        <div className="mt-6">
          <ProductOrderPanel product={product} />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10 px-4">
          <h2 className="font-display text-xl text-ink">O'xshash buketlar</h2>
          <div className="mt-4 grid gap-3">
            {related.map((p) => (
              <ProductListCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
