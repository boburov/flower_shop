import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getAllProductSlugs } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const slugs = await getAllProductSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/shop`, priority: 0.9 },
    { url: `${base}/basket`, priority: 0.3 },
    { url: `${base}/profile`, priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/product/${slug}`,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
