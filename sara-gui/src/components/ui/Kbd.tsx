import { cn } from "@/lib/cn";

/** Renders a keyboard shortcut hint, e.g. <Kbd keys={["⌘","S"]} />. */
export function Kbd({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex h-4 min-w-4 items-center justify-center rounded-xs border border-border bg-muted px-1 font-sans text-[10px] font-medium text-muted-fg"
        >
          {k}
        </kbd>
      ))}
    </span>
  );
}
