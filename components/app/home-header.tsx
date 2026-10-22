import Link from "next/link";
import { LocationIcon, ChevronDownIcon, NotificationIcon } from "@/components/ui/icons";

/**
 * Liquid-glass home header, floated over the top of the hero image.
 * Tapping the location opens the shop's spot in Google Maps.
 * Location is editable from the admin bot (see getShopLocation).
 */
export function HomeHeader({
  city,
  area,
  mapsUrl,
}: {
  city: string;
  area: string;
  mapsUrl: string;
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 pt-4">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${city}${area ? ", " + area : ""} — Google Maps'da ochish`}
        className="glass flex min-w-0 items-center gap-2 rounded-full py-2 pl-3 pr-4 text-ink transition-transform active:scale-[0.98]"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose/15 text-rose">
          <LocationIcon size={16} />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1">
            <span className="truncate text-sm font-semibold leading-tight">{city}</span>
            <ChevronDownIcon size={14} className="text-ink/60" />
          </span>
          <span className="block truncate text-[11px] leading-tight text-ink/70">
            {area || "Google Maps'da ko'rish"}
          </span>
        </span>
      </a>

      <Link
        href="/profile"
        aria-label="Bildirishnomalar"
        className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink"
      >
        <NotificationIcon size={20} />
      </Link>
    </header>
  );
}
