import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-3xl text-ink">Bu sahifa so'lib qolibdi</h1>
      <p className="mx-auto mt-3 max-w-xs text-muted">
        Izlagan narsangizni topa olmadik — ammo gullarimiz hamon yangi.
      </p>
      <Link href="/" className={buttonClasses("primary", "lg", "mt-7")}>
        Bosh sahifaga
      </Link>
    </div>
  );
}
