import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** Accessible label — required since there's no visible text. */
  label: string;
  size?: "sm" | "md";
  active?: boolean;
}

const SIZES = { sm: "size-6", md: "size-8" } as const;

/** A square, icon-only button for toolbars and dense chrome. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, size = "md", active, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-muted-fg transition-colors",
        "hover:bg-accent hover:text-fg focus-visible:outline-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active && "bg-accent text-fg",
        SIZES[size],
        className,
      )}
      {...props}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
    </button>
  );
});
