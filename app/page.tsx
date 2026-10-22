import { HomeHeader } from "@/components/app/home-header";
import { HeroCarousel } from "@/components/app/hero-carousel";
import { HomeCollections } from "@/components/app/home-collections";
import { getProducts, getHeroProducts } from "@/lib/products";
import { getShopLocation } from "@/lib/settings";

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
