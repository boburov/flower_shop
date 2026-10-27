import { HomeHeader } from "@/components/app/home-header";
import { HeroCarousel } from "@/components/app/hero-carousel";
import { HomeCollections } from "@/components/app/home-collections";
import { getProducts, getHeroProducts } from "@/lib/products";
import { getShopLocation } from "@/lib/settings";

// The catalogue and the shop location are edited from the admin bot at runtime,
// so this page must never be frozen into build-time HTML. It is cached for a
// minute and refreshed in the background; the bot also revalidates it on demand
// (see app/api/revalidate/route.ts) so admin edits show up immediately.
export const revalidate = 60;

export default async function HomePage() {
  const [hero, products, location] = await Promise.all([
    getHeroProducts(4),
    getProducts(),
    getShopLocation(),
  ]);

  return (
    <div className="pb-6">
      <div className="relative">
        <HomeHeader city={location.city} area={location.area} mapsUrl={location.mapsUrl} />
        <HeroCarousel products={hero} />
      </div>
      <HomeCollections products={products} />
    </div>
  );
}
