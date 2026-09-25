import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export interface DropdownMenuProps {
  /** Trigger content (rendered inside the toggle button — do not pass a button). */
  trigger: ReactNode;
  /** Panel content; receives a `close` callback for items to dismiss the menu. */
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  triggerClassName?: string;
  className?: string;
}

/** Lightweight dropdown: toggle button + popover, outside-click / Esc to close. */
export function DropdownMenu({ trigger, children, align = "start", triggerClassName, className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-1 min-w-56 rounded-md border border-border bg-surface-raised p-1 shadow-popover",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps {
  icon?: LucideIcon;
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  /** Right-aligned trailing content (e.g. a secondary action or hint). */
  trailing?: ReactNode;
  disabled?: boolean;
}

/** A standard clickable row inside a DropdownMenu panel. */
export function DropdownItem({ icon: Icon, children, onClick, active, trailing, disabled }: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
        "hover:bg-accent focus-visible:bg-accent disabled:opacity-40",
        active ? "text-fg" : "text-muted-fg",
      )}
    >
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </button>
  );
}

/** Thin divider between menu groups. */
export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
