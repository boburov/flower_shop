import "server-only";

import { prisma, hasDatabase } from "./prisma";
import { siteConfig } from "./config";

export const LOCATION_CITY_KEY = "location_city";
export const LOCATION_AREA_KEY = "location_area";
export const LOCATION_MAPS_KEY = "location_maps";

export interface ShopLocation {
  city: string;
  area: string;
  /** Always a usable Google Maps URL (from a saved link/coords, or a text search). */
  mapsUrl: string;
}

/**
 * Turn a saved maps value into a usable Google Maps URL:
 *  - a full http(s) link is used as-is,
 *  - "lat,lng" coordinates open a pin,
 *  - anything else (or empty) becomes a map search of the address text.
 */
export function buildMapsUrl(city: string, area: string, raw?: string): string {
  const base = "https://www.google.com/maps/search/?api=1&query=";
  const v = raw?.trim();
  if (v) {
    if (/^https?:\/\//i.test(v)) return v;
    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(v)) return base + encodeURIComponent(v.replace(/\s+/g, ""));
    return base + encodeURIComponent(v);
  }
  const query = [area, city].filter((s) => s && s.trim()).join(", ") || city;
  return base + encodeURIComponent(query);
}

/**
 * Shop location shown in the home header. Editable from the admin bot (stored in
 * the Setting table); falls back to the value in lib/config.ts.
 */
export async function getShopLocation(): Promise<ShopLocation> {
  const fallback = siteConfig.location;
  let city: string = fallback.city;
  let area: string = fallback.area;
  let maps: string | undefined;

  if (hasDatabase()) {
    try {
      const rows = await prisma.setting.findMany({
        where: { key: { in: [LOCATION_CITY_KEY, LOCATION_AREA_KEY, LOCATION_MAPS_KEY] } },
      });
      const map = new Map(rows.map((r) => [r.key, r.value]));
      city = map.get(LOCATION_CITY_KEY)?.trim() || fallback.city;
      area = map.get(LOCATION_AREA_KEY)?.trim() || fallback.area;
      maps = map.get(LOCATION_MAPS_KEY)?.trim() || undefined;
    } catch (error) {
      console.error("[settings] getShopLocation failed, using config fallback:", error);
    }
  }

  return { city, area, mapsUrl: buildMapsUrl(city, area, maps) };
}
