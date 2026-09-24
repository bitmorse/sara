import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import { typeVisual } from "@/lib/item-type-meta";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-fg",
  primary: "bg-primary/12 text-primary",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  info: "bg-info-subtle text-info",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** A compact status/label pill. */
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-none",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

export interface ItemTypeBadgeProps {
  typeId: string;
  displayName?: string;
  /** Icon-only (used in dense rows/tree). */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Type indicator with the type's Lucide icon and design-token accent color.
 * Color is applied via the `--color-type-*` CSS var (not a dynamic Tailwind
 * class) so arbitrary schema types stay build-safe.
 */
export function ItemTypeBadge({ typeId, displayName, iconOnly, className }: ItemTypeBadgeProps) {
  const { icon: Icon, color } = typeVisual(typeId);
  const accent = `var(--color-${color})`;
  const label = displayName ?? typeId.replaceAll("_", " ");

  if (iconOnly) {
    return (
      <span
        className={cn("inline-flex size-4 items-center justify-center", className)}
        title={label}
        style={{ color: accent }}
      >
        <Icon className="size-3.5" aria-hidden />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-none",
        className,
      )}
      style={{ color: accent, backgroundColor: `color-mix(in oklch, ${accent} 14%, transparent)` }}
    >
      <Icon className="size-3" aria-hidden />
      {label}
    </span>
  );
}
