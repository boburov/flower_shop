/**
 * Central configuration for the flower boutique.
 *
 * Everything that is business-specific or that a shop owner might want to change
 * lives here so it can be edited in one place. Unknown real-world details
 * (phone, exact address, Instagram URL) are left as clearly-marked placeholders
 * on purpose — fill them in before going live.
 */

export const siteConfig = {
  name: "Bloomé",
  tagline: "Gullar butigi",
  /** Do'kon joylashuvi — header'da ko'rsatiladi. O'z manzilingiz bilan almashtiring. */
  location: {
    city: "Toshkent",
    area: "Chilonzor tumani", // TODO: aniq manzil/tuman bilan almashtiring
  },
  /** Short description used for SEO / Open Graph. */
  description:
    "Bloomé — tug'ilgan kun, yubiley va eng muhim lahzalar uchun nafis, mavsumiy buketlar tayyorlaydigan gullar butigi. Telegram orqali oson buyurtma bering.",
  /** Public site URL — update to your real domain for correct Open Graph links. */
  url: "https://bloome.example",
  locale: "uz",
} as const;

/**
 * Telegram ordering.
 *
 * NEXT_PUBLIC_TELEGRAM_USERNAME is safe to expose (it is a public username, not a
 * secret). The bot token is a server-only secret and must NEVER appear here.
 */
export const telegramConfig = {
  username: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? "boburov_sh",
  /** Base deep-link with no message — used as the universal fallback. */
  get baseUrl() {
    return `https://t.me/${this.username}`;
  },
} as const;

/**
 * Image delivery.
 *
 * In development, images are local files under /public/images/flowers and
 * `imageBaseUrl` is empty (paths are used as-is). In production you can serve the
 * flower photography as plain static files from your VPS: set NEXT_PUBLIC_IMAGE_BASE_URL
 * to e.g. "https://img.yourflowershop.uz" and store VPS-relative paths on products.
 * See docs/IMAGES.md for the full workflow.
 */
export const imageConfig = {
  baseUrl: process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "") ?? "",
  /** Fallback shown when a product image is missing or fails to load. */
  fallback: "/images/flowers/placeholder.svg",
} as const;

/**
 * Resolve a stored image path to a usable URL.
 * - Absolute URLs (http/https) are returned untouched.
 * - Root-relative paths (/images/...) are treated as local public assets.
 * - Everything else is prefixed with the configured image base URL (your VPS).
 */
export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return imageConfig.fallback;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return path;
  if (imageConfig.baseUrl) return `${imageConfig.baseUrl}/${path.replace(/^\//, "")}`;
  return `/${path.replace(/^\//, "")}`;
}

/**
 * Currency / price formatting. UZS has no sub-unit in everyday use, so prices are
 * whole numbers formatted with a thin space as the thousands separator.
 */
export const currencyConfig = {
  code: "UZS",
  symbol: "UZS",
} as const;

/** Grouped number only, e.g. "350 000" — for compact UI like add buttons. */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(amount)).replace(/,/g, " ");
}

export function formatPrice(amount: number, currency: string = currencyConfig.code): string {
  return `${formatAmount(amount)} ${currency}`;
}

/** Contact + social — placeholders. Replace before launch; do not invent real data. */
export const contactConfig = {
  telegram: `@${telegramConfig.username}`,
  telegramUrl: telegramConfig.baseUrl,
  instagram: "#", // TODO: haqiqiy Instagram havolasi bilan almashtiring
  instagramHandle: "@yourflowershop", // TODO: almashtiring
  email: "hello@bloome.example", // TODO: almashtiring
  /** Ish vaqti — namunaviy matn. */
  hours: "Dush–Yak, 9:00 – 21:00",
  /** Yetkazib berish — umumiy matn; ishga tushirishdan oldin aniq manzil qo'shing. */
  area: "Shahar bo'ylab o'sha kuniyoq yetkazib berish",
} as const;

/** App bottom-tab navigation. */
export const navLinks = [
  { label: "Bosh sahifa", href: "/" },
  { label: "Katalog", href: "/shop" },
  { label: "Savat", href: "/basket" },
  { label: "Profil", href: "/profile" },
] as const;

export type SiteConfig = typeof siteConfig;
