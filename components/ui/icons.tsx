"use client";

/**
 * App icon set — Iconly (https://web.iconly.pro) via react-iconly.
 *
 * Iconly's prop type has no `className`, so each icon is wrapped in a span that
 * carries Tailwind classes (color, layout). The icon uses primaryColor
 * "currentColor", so it inherits the span's text color. Size is set via `size`.
 *
 * Iconly has no minus or flower glyph, so Minus and BrandMark are small custom
 * SVGs drawn in a matching rounded-stroke style.
 */
import {
  Home,
  Category,
  Bag,
  User,
  Location,
  Notification,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plus,
  TickSquare,
  Filter2,
  Search,
  CloseSquare,
  Delete,
  Send,
  Camera,
  TimeCircle,
  type IconProps,
} from "react-iconly";
import type { FC } from "react";
import { cn } from "@/lib/utils";

export interface AppIconProps {
  size?: number;
  className?: string;
  /** Use the filled "bold" Iconly set (e.g. active nav tab). */
  bold?: boolean;
}

function wrap(Icon: FC<IconProps>) {
  return function AppIcon({ size = 24, className, bold = false }: AppIconProps) {
    return (
      <span className={cn("inline-flex shrink-0", className)} aria-hidden="true">
        <Icon
          set={bold ? "bold" : "light"}
          stroke={bold ? "bold" : "regular"}
          primaryColor="currentColor"
          size={size}
        />
      </span>
    );
  };
}

export const HomeIcon = wrap(Home);
export const CategoryIcon = wrap(Category);
export const BagIcon = wrap(Bag);
export const UserIcon = wrap(User);
export const LocationIcon = wrap(Location);
export const NotificationIcon = wrap(Notification);
export const ChevronDownIcon = wrap(ChevronDown);
export const ChevronLeftIcon = wrap(ChevronLeft);
export const ChevronRightIcon = wrap(ChevronRight);
export const ArrowRightIcon = wrap(ArrowRight);
export const PlusIcon = wrap(Plus);
export const TickIcon = wrap(TickSquare);
export const FilterIcon = wrap(Filter2);
export const SearchIcon = wrap(Search);
export const CloseIcon = wrap(CloseSquare);
export const DeleteIcon = wrap(Delete);
export const SendIcon = wrap(Send);
export const CameraIcon = wrap(Camera);
export const TimeIcon = wrap(TimeCircle);

/** Custom minus (Iconly has none) — matches the rounded-stroke style. */
export function MinusIcon({ size = 24, className }: AppIconProps) {
  return (
    <span className={cn("inline-flex shrink-0", className)} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M6 12h12" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Brand flower mark (Iconly has no flower) — an original simple bloom. */
export function BrandMark({ size = 24, className }: AppIconProps) {
  return (
    <span className={cn("inline-flex shrink-0", className)} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        <g stroke="currentColor" strokeWidth={1.6} fill="none">
          <ellipse cx="12" cy="6.4" rx="2.3" ry="3" />
          <ellipse cx="12" cy="17.6" rx="2.3" ry="3" />
          <ellipse cx="6.4" cy="12" rx="3" ry="2.3" />
          <ellipse cx="17.6" cy="12" rx="3" ry="2.3" />
        </g>
      </svg>
    </span>
  );
}
