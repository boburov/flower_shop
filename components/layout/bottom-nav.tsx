"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { HomeIcon, CategoryIcon, BagIcon, UserIcon, type AppIconProps } from "@/components/ui/icons";
import { useBasket } from "@/components/basket/basket-provider";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  Icon: FC<AppIconProps>;
  match: (path: string) => boolean;
}

const tabs: Tab[] = [
  { href: "/", label: "Bosh sahifa", Icon: HomeIcon, match: (p) => p === "/" },
  { href: "/shop", label: "Katalog", Icon: CategoryIcon, match: (p) => p.startsWith("/shop") || p.startsWith("/product") },
  { href: "/basket", label: "Savat", Icon: BagIcon, match: (p) => p.startsWith("/basket") },
  { href: "/profile", label: "Profil", Icon: UserIcon, match: (p) => p.startsWith("/profile") },
];

export function BottomNav() {
  const pathname = usePathname();
  const { count, hydrated } = useBasket();

  return (
    <nav
      aria-label="Asosiy navigatsiya"
      className="sticky bottom-0 z-40 px-3 pb-3 pt-1"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="glass mx-auto flex max-w-[480px] items-stretch justify-around rounded-[1.75rem] px-2 py-2">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const isBasket = tab.href === "/basket";
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors",
                  active ? "text-rose" : "text-muted hover:text-ink",
                )}
              >
                <span className="relative">
                  <tab.Icon size={24} bold={active} />
                  {isBasket && hydrated && count > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
                      {count}
                    </span>
                  )}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
