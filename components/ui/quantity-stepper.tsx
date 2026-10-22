"use client";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, label = "Quantity" }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className="inline-flex items-center rounded-full border border-line bg-surface"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:text-rose disabled:opacity-40"
      >
        <MinusIcon size={16} />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:text-rose disabled:opacity-40"
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
