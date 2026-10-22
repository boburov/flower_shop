import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-rose text-white shadow-soft hover:bg-rose-dark hover:shadow-lift active:scale-[0.98]",
  secondary: "border border-line bg-surface text-ink hover:border-rose hover:text-rose",
  ghost: "text-ink hover:bg-blush",
  dark: "bg-ink text-cream hover:bg-ink/90 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

type ButtonAsButton = ComponentPropsWithoutRef<"button"> & {
  href?: undefined;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

type ButtonAsLink = ComponentPropsWithoutRef<typeof Link> & {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = buttonClasses(variant, size, className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}
