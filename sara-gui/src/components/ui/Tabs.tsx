import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  /** Optional trailing count badge. */
  count?: number;
}

export interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** `segmented` = pill group; `underline` = bottom border indicator. */
  variant?: "segmented" | "underline";
  className?: string;
}

/** Accessible tab strip. Generic over the tab id union. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  variant = "underline",
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-stretch",
        variant === "segmented" && "gap-0.5 rounded-md bg-muted p-0.5",
        variant === "underline" && "gap-1 border-b border-border",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium transition-colors",
              variant === "segmented" &&
                cn(
                  "flex-1 justify-center rounded-sm px-2.5 py-1",
                  active ? "bg-surface text-fg shadow-xs" : "text-muted-fg hover:text-fg",
                ),
              variant === "underline" &&
                cn(
                  "-mb-px border-b-2 px-2.5 py-2",
                  active
                    ? "border-primary text-fg"
                    : "border-transparent text-muted-fg hover:text-fg",
                ),
            )}
          >
            {Icon && <Icon className="size-3.5" aria-hidden />}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 text-[10px] leading-4",
                  active ? "bg-muted text-muted-fg" : "bg-muted text-subtle-fg",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
