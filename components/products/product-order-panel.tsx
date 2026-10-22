"use client";

import { useMemo, useState } from "react";
import { SendIcon, BagIcon, TickIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { buttonClasses } from "@/components/ui/button";
import { useBasket } from "@/components/basket/basket-provider";
import { formatPrice } from "@/lib/config";
import {
  buildProductOrderMessage,
  telegramOrderUrl,
  telegramFallbackUrl,
  type CustomerDetails,
} from "@/lib/telegram";
import type { Product } from "@/lib/types";

/** Inline ordering panel used on the product detail page. */
export function ProductOrderPanel({ product }: { product: Product }) {
  const { addItem } = useBasket();
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails>({});
  const [added, setAdded] = useState(false);

  const message = useMemo(
    () => buildProductOrderMessage(product, quantity, customer, product.size ?? undefined),
    [product, quantity, customer],
  );
  const total = product.price * quantity;

  const field =
    "mt-1 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm text-ink " +
    "placeholder:text-muted/70 focus:border-rose focus:bg-surface focus:outline-none";

  const handleAddToBasket = () => {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="glass-card rounded-[1.5rem] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Miqdori</span>
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-cream/60 p-4">
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

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">Jami</span>
        <span className="font-display text-xl text-ink">{formatPrice(total, product.currency)}</span>
      </div>

      <div className="mt-4 grid gap-2">
        <a
          href={telegramOrderUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "lg")}
        >
          <SendIcon size={16} /> Telegram orqali buyurtma
        </a>
        <button type="button" onClick={handleAddToBasket} className={buttonClasses("secondary", "md")}>
          {added ? (
            <>
              <TickIcon size={16} className="text-sage" /> Savatga qo'shildi
            </>
          ) : (
            <>
              <BagIcon size={16} /> Savatga qo'shish
            </>
          )}
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        Telegram ochilishi buyurtmani avtomatik yubormaydi — xabarni o'zingiz ko'rib yuborasiz.{" "}
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
  );
}
