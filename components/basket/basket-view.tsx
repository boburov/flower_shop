"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeleteIcon, SendIcon, BagIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { buttonClasses } from "@/components/ui/button";
import { useBasket } from "@/components/basket/basket-provider";
import { formatPrice } from "@/lib/config";
import {
  buildBasketOrderMessage,
  telegramOrderUrl,
  telegramFallbackUrl,
  type CustomerDetails,
  type BasketLine,
} from "@/lib/telegram";

export function BasketView() {
  const { items, subtotal, hydrated, setQuantity, removeItem, clear } = useBasket();
  const [showDetails, setShowDetails] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails>({});

  const lines: BasketLine[] = useMemo(
    () =>
      items.map((i) => ({
        product: { id: i.id, name: i.name, price: i.price, currency: i.currency },
        quantity: i.quantity,
      })),
    [items],
  );

  const checkoutUrl = useMemo(
    () => telegramOrderUrl(buildBasketOrderMessage(lines, customer)),
    [lines, customer],
  );

  const currency = items[0]?.currency ?? "UZS";
  const field =
    "mt-1 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm text-ink " +
    "placeholder:text-muted/70 focus:border-rose focus:bg-surface focus:outline-none";

  if (!hydrated) {
    return <div className="px-4 py-20 text-center text-muted">Savat yuklanmoqda…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="glass-card mx-4 flex flex-col items-center justify-center rounded-[1.5rem] px-6 py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-blush text-rose">
          <BagIcon size={32} />
        </span>
        <h2 className="mt-5 font-display text-2xl text-ink">Savatingiz bo'sh</h2>
        <p className="mt-2 max-w-xs text-sm text-muted">
          Bir nechta buket qo'shing — ular shu yerda paydo bo'lib, bitta Telegram xabarida birga
          buyurtma qilinadi.
        </p>
        <Link href="/shop" className={buttonClasses("primary", "lg", "mt-6")}>
          Gullarni ko'rish <ArrowRightIcon size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Items */}
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="glass-card flex gap-3 rounded-[1.5rem] p-3"
          >
            <Link
              href={`/product/${item.slug}`}
              className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-blush"
            >
              <ProductImage src={item.imageUrl} alt={item.name} fill sizes="80px" />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-base leading-tight text-ink">
                    <Link href={`/product/${item.slug}`}>{item.name}</Link>
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatPrice(item.price, item.currency)} / dona
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`${item.name} o'chirish`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-blush hover:text-rose"
                >
                  <DeleteIcon size={16} />
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between pt-2">
                <QuantityStepper value={item.quantity} onChange={(q) => setQuantity(item.id, q)} />
                <span className="font-display text-base text-ink">
                  {formatPrice(item.price * item.quantity, item.currency)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={clear}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-rose"
      >
        <DeleteIcon size={16} /> Savatni tozalash
      </button>

      {/* Summary */}
      <div className="glass-card mt-5 rounded-[1.5rem] p-5">
        <h2 className="font-display text-xl text-ink">Buyurtma xulosasi</h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Mahsulotlar</dt>
            <dd>{formatPrice(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Yetkazish</dt>
            <dd>Telegramda kelishiladi</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">Jami</span>
          <span className="font-display text-2xl text-ink">{formatPrice(subtotal, currency)}</span>
        </div>

        {/* Optional details */}
        <div className="mt-5 rounded-2xl border border-line bg-cream/60 p-4">
          <button
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            aria-expanded={showDetails}
            className="flex w-full items-center justify-between text-sm font-medium text-ink"
          >
            Ma'lumotlaringizni qo'shing (ixtiyoriy)
            <span className="text-muted">{showDetails ? "Yashirish" : "Qo'shish"}</span>
          </button>
          {showDetails && (
            <div className="mt-3 grid gap-3">
              <label className="block text-xs font-medium text-muted">
                Ismingiz
                <input
                  type="text"
                  className={field}
                  value={customer.name ?? ""}
                  onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                  placeholder="masalan, Dilnoza"
                />
              </label>
              <label className="block text-xs font-medium text-muted">
                Telefon raqami
                <input
                  type="tel"
                  inputMode="tel"
                  className={field}
                  value={customer.phone ?? ""}
                  onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="masalan, +998 ..."
                />
              </label>
              <label className="block text-xs font-medium text-muted">
                Yetkazib berish manzili
                <input
                  type="text"
                  className={field}
                  value={customer.address ?? ""}
                  onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
                  placeholder="Ko'cha, uy, xonadon"
                />
              </label>
              <label className="block text-xs font-medium text-muted">
                Floristga xabar
                <textarea
                  rows={2}
                  className={field}
                  value={customer.note ?? ""}
                  onChange={(e) => setCustomer((c) => ({ ...c, note: e.target.value }))}
                  placeholder="Yetkazish sanasi, tabrik matni va h.k."
                />
              </label>
            </div>
          )}
        </div>

        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "lg", "mt-5 w-full")}
        >
          <SendIcon size={16} /> Telegram orqali buyurtma
        </a>
        <p className="mt-3 text-center text-xs text-muted">
          Mavjudlik, yetkazish va to'lov chatda tasdiqlanadi.{" "}
          <a
            href={telegramFallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-rose underline underline-offset-2"
          >
            Chat ochilmayaptimi?
          </a>
        </p>
      </div>
    </div>
  );
}
