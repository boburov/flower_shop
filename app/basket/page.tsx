import type { Metadata } from "next";
import { BasketView } from "@/components/basket/basket-view";

export const metadata: Metadata = {
  title: "Savat",
  description: "Tanlagan buketlaringizni ko'rib chiqing va butun buyurtmani Telegram orqali yuboring.",
};

export default function BasketPage() {
  return (
    <div className="pb-6">
      <header className="px-4 pt-4">
        <h1 className="font-display text-3xl text-ink">Savat</h1>
        <p className="mt-1 text-sm text-muted">
          Tanlovingizni ko'rib chiqing va bitta Telegram xabarida buyurtma bering.
        </p>
      </header>
      <div className="mt-5">
        <BasketView />
      </div>
    </div>
  );
}
