import { useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface TooltipProps {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
}

const SIDE: Record<NonNullable<TooltipProps["side"]>, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

/**
 * Lightweight hover/focus tooltip (no portal). Suitable for dense chrome where
 * a full popover library would be overkill.
 */
export function Tooltip({ content, side = "top", children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-sm bg-surface-raised px-2 py-1 text-[11px] text-fg shadow-popover border border-border",
            SIDE[side],
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
