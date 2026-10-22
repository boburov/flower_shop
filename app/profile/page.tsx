import type { Metadata } from "next";
import Link from "next/link";
import type { FC } from "react";
import {
  BrandMark,
  SendIcon,
  CameraIcon,
  TimeIcon,
  LocationIcon,
  BagIcon,
  ChevronRightIcon,
  type AppIconProps,
} from "@/components/ui/icons";
import { siteConfig, contactConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Profil",
  description: "Bloomé gullar butigi haqida ma'lumot, ish vaqti va bog'lanish usullari.",
};

export default function ProfilePage() {
  const contactRows: {
    Icon: FC<AppIconProps>;
    label: string;
    value: string;
    href: string;
    external: boolean;
  }[] = [
    {
      Icon: SendIcon,
      label: "Telegram",
      value: contactConfig.telegram,
      href: contactConfig.telegramUrl,
      external: true,
    },
    {
      Icon: CameraIcon,
      label: "Instagram",
      value: contactConfig.instagramHandle,
      href: contactConfig.instagram,
      external: true,
    },
  ];

  const infoRows: { Icon: FC<AppIconProps>; label: string; value: string }[] = [
    { Icon: TimeIcon, label: "Ish vaqti", value: contactConfig.hours },
    { Icon: LocationIcon, label: "Yetkazib berish", value: contactConfig.area },
  ];

  return (
    <div className="px-4 pb-6">
      {/* Brand */}
      <header className="flex flex-col items-center pt-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-rose/12 text-rose">
          <BrandMark size={32} />
        </span>
        <h1 className="mt-3 font-display text-2xl text-ink">{siteConfig.name}</h1>
        <p className="text-sm text-muted">{siteConfig.tagline}</p>
      </header>

      {/* About */}
      <section className="glass-card mt-6 rounded-[1.5rem] p-5">
        <h2 className="font-display text-lg text-ink">Biz haqimizda</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Bloomé — kichik butik studiya. Har bir buket qo'lda, e'tibor bilan yig'iladi. Biz mavsumiy
          gullar bilan ishlaymiz va buyurtmani imkon qadar sodda qilamiz — bir Telegram xabari
          yetarli.
        </p>
      </section>

      {/* Contact */}
      <section className="glass-card mt-4 overflow-hidden rounded-[1.5rem]">
        {contactRows.map((row, i) => (
          <a
            key={row.label}
            href={row.href}
            target={row.external ? "_blank" : undefined}
            rel={row.external ? "noopener noreferrer" : undefined}
            className={`flex items-center gap-3 px-5 py-4 transition-colors hover:bg-blush/50 ${
              i > 0 ? "border-t border-line" : ""
            }`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-blush text-rose">
              <row.Icon size={16} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink">{row.label}</span>
              <span className="block text-xs text-muted">{row.value}</span>
            </span>
            <ChevronRightIcon size={16} className="text-muted" />
          </a>
        ))}
      </section>

      {/* Info */}
      <section className="glass-card mt-4 overflow-hidden rounded-[1.5rem]">
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center gap-3 px-5 py-4 ${i > 0 ? "border-t border-line" : ""}`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-blush text-rose">
              <row.Icon size={16} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink">{row.label}</span>
              <span className="block text-xs text-muted">{row.value}</span>
            </span>
          </div>
        ))}
      </section>

      {/* CTA */}
      <Link
        href="/basket"
        className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-ink/90"
      >
        <BagIcon size={16} /> Savatni ochish
      </Link>

      <p className="mt-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} {siteConfig.name}. Barcha huquqlar himoyalangan.
      </p>
    </div>
  );
}
