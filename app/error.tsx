"use client";

import { buttonClasses } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="px-4 py-24 text-center">
      <p className="eyebrow">Xatolik</p>
      <h1 className="mt-3 font-display text-3xl text-ink">Nimadir noto'g'ri ketdi</h1>
      <p className="mx-auto mt-3 max-w-xs text-muted">
        Sahifani yuklashda kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.
      </p>
      <button type="button" onClick={reset} className={buttonClasses("primary", "lg", "mt-7")}>
        Qaytadan urinish
      </button>
    </div>
  );
}
