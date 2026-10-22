/**
 * Single source of truth for sample catalogue data (Uzbek).
 *
 * Used by BOTH:
 *  - prisma/seed.ts (to populate Neon PostgreSQL), and
 *  - lib/products.ts (as a fallback when no database is configured, so the site
 *    runs with zero setup).
 *
 * Prices are believable demo values in UZS. `size` is a descriptive label only
 * (e.g. bouquet height) — it does not change the price. Replace with real
 * inventory later.
 */

export interface SeedCategory {
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  categorySlug: string;
  size: string | null;
  isFeatured: boolean;
  isBestseller: boolean;
  isAvailable: boolean;
  popularity: number;
}

export const seedCategories: SeedCategory[] = [
  { name: "Atirgullar", slug: "roses", imageUrl: "/images/flowers/classic-red-roses.svg" },
  { name: "Pionlar", slug: "peonies", imageUrl: "/images/flowers/pink-peonies.svg" },
  { name: "Lolalar", slug: "tulips", imageUrl: "/images/flowers/tulips-chrysanthemums.svg" },
  { name: "Dahliyalar", slug: "dahlias", imageUrl: "/images/flowers/peonies-dahlias.svg" },
  { name: "Aralash buketlar", slug: "mixed-bouquets", imageUrl: "/images/flowers/spring-garden.svg" },
  { name: "Tug'ilgan kun", slug: "birthday-flowers", imageUrl: "/images/flowers/sunset-colours.svg" },
  { name: "Romantik buketlar", slug: "romantic-bouquets", imageUrl: "/images/flowers/pastel-rose.svg" },
];

export const seedProducts: SeedProduct[] = [
  {
    slug: "pink-peonies",
    name: "Pushti pionlar",
    description: "Yumshoq pushti pionlar — shoyi lenta bilan bog'langan bizning belgili buketimiz.",
    price: 350000,
    currency: "UZS",
    imageUrl: "/images/flowers/pink-peonies.svg",
    categorySlug: "peonies",
    size: "55-67 sm",
    isFeatured: true,
    isBestseller: true,
    isAvailable: true,
    popularity: 98,
  },
  {
    slug: "classic-red-roses",
    name: "Klassik qizil atirgullar",
    description: "Yigirma beshta baxmal qizil atirgul — abadiy, romantik va har doim o'rinli.",
    price: 420000,
    currency: "UZS",
    imageUrl: "/images/flowers/classic-red-roses.svg",
    categorySlug: "roses",
    size: "50-60 sm",
    isFeatured: true,
    isBestseller: true,
    isAvailable: true,
    popularity: 95,
  },
  {
    slug: "tulips-with-chrysanthemums",
    name: "Lola va xrizantema",
    description: "Lola va yengil xrizantemalardan iborat yorqin bahorgi aralashma.",
    price: 265000,
    currency: "UZS",
    imageUrl: "/images/flowers/tulips-chrysanthemums.svg",
    categorySlug: "tulips",
    size: "45-57 sm",
    isFeatured: true,
    isBestseller: false,
    isAvailable: true,
    popularity: 80,
  },
  {
    slug: "peonies-with-dahlias",
    name: "Pion va dahliya",
    description: "Yumshoq pionlar bilan ta'sirli dahliyalar — bog'dan yig'ilgandek kompozitsiya.",
    price: 480000,
    currency: "UZS",
    imageUrl: "/images/flowers/peonies-dahlias.svg",
    categorySlug: "dahlias",
    size: "57-64 sm",
    isFeatured: true,
    isBestseller: true,
    isAvailable: true,
    popularity: 88,
  },
  {
    slug: "pastel-rose-bouquet",
    name: "Pastel atirgul buketi",
    description: "To'y, taklif va shirin lahzalar uchun pushti va krem bog' atirgullari.",
    price: 390000,
    currency: "UZS",
    imageUrl: "/images/flowers/pastel-rose.svg",
    categorySlug: "romantic-bouquets",
    size: "52-60 sm",
    isFeatured: true,
    isBestseller: false,
    isAvailable: true,
    popularity: 76,
  },
  {
    slug: "spring-garden-bouquet",
    name: "Bahorgi bog' buketi",
    description: "Mavsumiy gullar, ko'katlar va nozik to'ldiruvchilardan yangi aralashma.",
    price: 300000,
    currency: "UZS",
    imageUrl: "/images/flowers/spring-garden.svg",
    categorySlug: "mixed-bouquets",
    size: "50-62 sm",
    isFeatured: true,
    isBestseller: false,
    isAvailable: true,
    popularity: 72,
  },
  {
    slug: "white-elegance",
    name: "Oq nafislik",
    description: "Sof oq atirgul va lizantuslar — kamtarin, nafis va unutilmas.",
    price: 450000,
    currency: "UZS",
    imageUrl: "/images/flowers/white-elegance.svg",
    categorySlug: "romantic-bouquets",
    size: "55-65 sm",
    isFeatured: true,
    isBestseller: true,
    isAvailable: true,
    popularity: 84,
  },
  {
    slug: "sunset-colours",
    name: "Shom ranglari",
    description: "Yozgi oqshomdek jilolanadigan marjon, shaftoli va kahrabo ranglari.",
    price: 360000,
    currency: "UZS",
    imageUrl: "/images/flowers/sunset-colours.svg",
    categorySlug: "birthday-flowers",
    size: "50-60 sm",
    isFeatured: true,
    isBestseller: false,
    isAvailable: true,
    popularity: 70,
  },
  {
    slug: "birthday-brights",
    name: "Tug'ilgan kun yorqinligi",
    description: "Kimningdir tug'ilgan kunini yoritadigan quvnoq, rang-barang buket.",
    price: 320000,
    currency: "UZS",
    imageUrl: "/images/flowers/birthday-brights.svg",
    categorySlug: "birthday-flowers",
    size: "48-58 sm",
    isFeatured: false,
    isBestseller: false,
    isAvailable: true,
    popularity: 64,
  },
  {
    slug: "blush-tulips",
    name: "Nozik lolalar",
    description: "Yumshoq pushti lolalardan iborat katta quchoq — sodda va zamonaviy.",
    price: 240000,
    currency: "UZS",
    imageUrl: "/images/flowers/blush-tulips.svg",
    categorySlug: "tulips",
    size: "40-50 sm",
    isFeatured: false,
    isBestseller: false,
    isAvailable: true,
    popularity: 58,
  },
  {
    slug: "crimson-dahlia-bouquet",
    name: "Qirmizi dahliya buketi",
    description: "To'q qirmizi va bordo dahliyalar — dadil va nafis sovg'a.",
    price: 410000,
    currency: "UZS",
    imageUrl: "/images/flowers/crimson-dahlia.svg",
    categorySlug: "dahlias",
    size: "52-62 sm",
    isFeatured: false,
    isBestseller: false,
    isAvailable: true,
    popularity: 62,
  },
  {
    slug: "eternal-red-roses",
    name: "Abadiy qizil atirgullar",
    description: "Ellikta uzun poyali qizil atirgul — go'zal qutida buyuk romantik imo-ishora.",
    price: 890000,
    currency: "UZS",
    imageUrl: "/images/flowers/eternal-red-roses.svg",
    categorySlug: "roses",
    size: "60-70 sm",
    isFeatured: false,
    isBestseller: true,
    isAvailable: true,
    popularity: 90,
  },
];
