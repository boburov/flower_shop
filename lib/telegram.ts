import { formatPrice } from "./config";
import { telegramConfig } from "./config";
import type { Product } from "./types";

/** Optional customer details captured in the order modal / basket. */
export interface CustomerDetails {
  name?: string;
  phone?: string;
  address?: string;
  note?: string;
}

export interface BasketLine {
  product: Pick<Product, "id" | "name" | "price" | "currency">;
  quantity: number;
  /** Optional selected variant label (e.g. a bouquet size), if ever added. */
  variant?: string;
}

/** Only include customer lines the shopper actually filled in. */
function customerBlock(customer?: CustomerDetails): string {
  if (!customer) return "";
  const lines: string[] = [];
  if (customer.name?.trim()) lines.push(`Ism: ${customer.name.trim()}`);
  if (customer.phone?.trim()) lines.push(`Telefon: ${customer.phone.trim()}`);
  if (customer.address?.trim()) lines.push(`Yetkazish manzili: ${customer.address.trim()}`);
  if (customer.note?.trim()) lines.push(`Izoh: ${customer.note.trim()}`);
  return lines.length ? `\n${lines.join("\n")}\n` : "";
}

/** Message for a single product order. */
export function buildProductOrderMessage(
  product: Pick<Product, "id" | "name" | "price" | "currency">,
  quantity: number,
  customer?: CustomerDetails,
  variant?: string,
): string {
  const lineTotal = product.price * quantity;
  return [
    "Assalomu alaykum! Men ushbu buketga buyurtma bermoqchiman.",
    "",
    `Mahsulot: ${product.name}`,
    variant ? `O'lcham: ${variant}` : null,
    `Narx: ${formatPrice(product.price, product.currency)}`,
    `Soni: ${quantity}`,
    quantity > 1 ? `Oraliq jami: ${formatPrice(lineTotal, product.currency)}` : null,
    `Mahsulot ID: ${product.id}`,
    customerBlock(customer),
    "Iltimos, buyurtmani rasmiylashtirishga yordam bering.",
  ]
    .filter((line) => line !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Message for the whole basket. */
export function buildBasketOrderMessage(
  lines: BasketLine[],
  customer?: CustomerDetails,
): string {
  const currency = lines[0]?.product.currency ?? "UZS";
  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  const itemLines = lines.map((l, i) => {
    const lineTotal = l.product.price * l.quantity;
    const variant = l.variant ? ` (${l.variant})` : "";
    return (
      `${i + 1}. ${l.product.name}${variant} — ` +
      `${formatPrice(l.product.price, l.product.currency)} × ${l.quantity} = ` +
      `${formatPrice(lineTotal, l.product.currency)} [ID: ${l.product.id}]`
    );
  });

  return [
    "Assalomu alaykum! Men buyurtma bermoqchiman.",
    "",
    ...itemLines,
    "",
    `Jami: ${formatPrice(total, currency)}`,
    customerBlock(customer),
    "Iltimos, buyurtmani rasmiylashtirishga yordam bering.",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Build the t.me deep link with a prefilled, URL-encoded message. */
export function telegramOrderUrl(message: string): string {
  return `${telegramConfig.baseUrl}?text=${encodeURIComponent(message)}`;
}

/** The universal fallback (no prefilled text). */
export const telegramFallbackUrl = telegramConfig.baseUrl;
