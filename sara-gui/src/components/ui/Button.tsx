import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Leading icon. */
  icon?: LucideIcon;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover shadow-xs disabled:bg-muted disabled:text-muted-fg",
  secondary:
    "bg-muted text-fg hover:bg-accent border border-border disabled:text-muted-fg",
  ghost: "text-fg hover:bg-accent disabled:text-muted-fg",
  outline: "border border-border text-fg hover:bg-accent disabled:text-muted-fg",
  danger: "bg-danger text-danger-fg hover:opacity-90 shadow-xs",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-sm",
  md: "h-8 px-3 text-[13px] gap-2 rounded-md",
};

/** The primary action control. Neutral, ghost, outline and danger variants. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon: Icon, loading, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none",
        "focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="size-3.5" aria-hidden />
      )}
      {children}
    </button>
  );
});
