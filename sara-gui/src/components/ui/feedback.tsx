import type { ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

/** Indeterminate spinner. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin text-muted-fg", className)} aria-hidden />;
}

/** Centered loading state for a panel. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-muted-fg">
      <Spinner className="size-5" />
      <span className="text-xs">{label}</span>
    </div>
  );
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Friendly empty/zero state for panels and lists. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex h-full flex-col items-center justify-center gap-3 p-8 text-center", className)}>
      {Icon && (
        <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-fg">
          <Icon className="size-5" aria-hidden />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        {description && <p className="max-w-xs text-xs text-muted-fg">{description}</p>}
      </div>
      {action}
    </div>
  );
}
