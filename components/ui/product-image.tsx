"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveImageUrl, imageConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  /** Use `fill` layout (parent must be positioned + sized). */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Next.js Image with a graceful fallback. If the configured image fails to load
 * (e.g. a VPS hiccup), it swaps to the local placeholder instead of a broken icon.
 * SVG sources are served unoptimized (the optimizer rejects SVG by default).
 */
export function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
}: Props) {
  const resolved = resolveImageUrl(src);
  const [current, setCurrent] = useState(resolved);
  const isSvg = current.toLowerCase().endsWith(".svg");

  const common = {
    src: current,
    priority,
    unoptimized: isSvg,
    onError: () => {
      if (current !== imageConfig.fallback) setCurrent(imageConfig.fallback);
    },
    className: cn("object-cover", className),
  };

  if (fill) {
    return <Image alt={alt} {...common} fill sizes={sizes ?? "100vw"} />;
  }
  return <Image alt={alt} {...common} width={width ?? 800} height={height ?? 1000} sizes={sizes} />;
}
