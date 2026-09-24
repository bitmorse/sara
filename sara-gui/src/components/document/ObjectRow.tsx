import { cn } from "@/lib/cn";
import { ItemTypeBadge } from "@/components/ui/Badge";
import type { ItemDetail } from "@/types/domain";

export interface ObjectRowProps {
  item: ItemDetail;
  index: number;
  typeName?: string;
  selected: boolean;
  onSelect: () => void;
  /** Rendered in place of the static body when this row is being edited. */
  editorSlot?: React.ReactNode;
}

/**
 * One requirement "object" in the document view — the DOORS analogue: a numbered
 * ID gutter, the heading (name), the descriptive body, and inline attribute
 * labels (e.g. `Specification:` …). Selecting a row can swap the body for an
 * inline markdown editor via `editorSlot`.
 */
export function ObjectRow({ item, index, typeName, selected, onSelect, editorSlot }: ObjectRowProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex cursor-pointer gap-3 border-b border-border px-2 py-2.5 transition-colors",
        selected ? "bg-primary/[0.06]" : "hover:bg-accent/50",
      )}
    >
      {/* ID gutter */}
      <div className="flex w-12 shrink-0 flex-col items-end pt-0.5">
        <span className="font-mono text-[11px] tabular-nums text-subtle-fg">{index + 1}</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <ItemTypeBadge typeId={item.type} displayName={typeName} />
          <span className="font-mono text-[11px] text-muted-fg">{item.id}</span>
          <h3 className="text-sm font-semibold text-fg">{item.name}</h3>
        </div>

        {editorSlot ? (
          editorSlot
        ) : (
          <>
            {item.description && (
              <p className="text-[13px] leading-relaxed text-muted-fg">{item.description}</p>
            )}
            {item.attributes.map((attr) => (
              <p key={attr.name} className="text-[13px] leading-relaxed text-fg">
                <span className="font-semibold text-muted-fg underline decoration-border underline-offset-2">
                  {attr.displayName}:
                </span>{" "}
                {Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
