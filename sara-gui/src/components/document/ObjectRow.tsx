import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/Tooltip";
import { ItemBody } from "./ItemBody";
import type { ItemDetail } from "@/types/domain";

export interface ObjectRowProps {
  item: ItemDetail;
  index: number;
  typeName?: string;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

/**
 * One requirement "object": a numbered gutter, the item ID (hover for type,
 * title, attributes and file path), and the markdown body rendered inline
 * (read-only by default). Everything else lives in the body or the Inspector so
 * the list stays scannable. Single-click selects; double-click edits in place.
 */
export function ObjectRow({
  item,
  index,
  typeName,
  selected,
  editing,
  onSelect,
  onEdit,
}: ObjectRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Bring the row into view when it enters edit mode.
  useEffect(() => {
    if (editing) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [editing]);

  return (
    <div
      ref={ref}
      onClick={onSelect}
      onDoubleClick={onEdit}
      className={cn(
        "group flex cursor-text gap-2.5 border-b border-border border-l-2 border-l-transparent px-2 py-2 transition-colors",
        // Neutral selected/editing surface + an accent rail — legible without a blue wash.
        selected || editing ? "bg-accent border-l-primary" : "hover:bg-accent/40",
      )}
    >
      {/* Row number gutter */}
      <div className="flex w-10 shrink-0 flex-col items-end pt-px">
        <span className="font-mono text-[11px] tabular-nums text-subtle-fg">{index + 1}</span>
      </div>

      {/* Content — just the ID (hover for the rest), then the body. */}
      <div className="min-w-0 flex-1 space-y-1">
        <Tooltip
          side="right"
          content={
            <div className="max-w-xs space-y-1 whitespace-normal">
              {typeName && (
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-fg">
                  {typeName}
                </div>
              )}
              <div className="text-[12px] font-semibold text-fg">{item.name}</div>
              {item.description && <div className="text-[11px] text-muted-fg">{item.description}</div>}
              {item.attributes.map((attr) => (
                <div key={attr.name} className="text-[11px]">
                  <span className="font-medium text-muted-fg">{attr.displayName}: </span>
                  <span className="text-fg">
                    {Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}
                  </span>
                </div>
              ))}
              <div className="pt-0.5 font-mono text-[10px] text-subtle-fg">{item.filePath}</div>
            </div>
          }
        >
          <span className="font-mono text-[13px] font-semibold tabular-nums text-fg">{item.id}</span>
        </Tooltip>

        <ItemBody itemId={item.id} editing={editing} />
      </div>
    </div>
  );
}
