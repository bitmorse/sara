import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import { ItemTypeBadge } from "@/components/ui/Badge";
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
  onDoneEdit: () => void;
}

/**
 * One requirement "object": a numbered ID gutter, the heading, its frontmatter
 * attributes, and the markdown body rendered inline (read-only by default).
 * Single-click selects; double-click edits that row's body in place with focus.
 */
export function ObjectRow({
  item,
  index,
  typeName,
  selected,
  editing,
  onSelect,
  onEdit,
  onDoneEdit,
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
        "group flex cursor-text gap-2.5 border-b border-border px-2 py-2 transition-colors",
        // Editing keeps the same subtle selected surface — no box/ring pops in.
        selected || editing ? "bg-primary/[0.05]" : "hover:bg-accent/40",
      )}
    >
      {/* ID gutter */}
      <div className="flex w-10 shrink-0 flex-col items-end pt-px">
        <span className="font-mono text-[11px] tabular-nums text-subtle-fg">{index + 1}</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <ItemTypeBadge typeId={item.type} displayName={typeName} />
          <span className="font-mono text-[11px] text-muted-fg">{item.id}</span>
          <h3 className="text-[13px] font-semibold text-fg">{item.name}</h3>
        </div>

        {item.description && (
          <p className="text-[13px] leading-snug text-muted-fg">{item.description}</p>
        )}

        {item.attributes.map((attr) => (
          <p key={attr.name} className="text-[13px] leading-snug">
            <span className="font-medium text-muted-fg">{attr.displayName}: </span>
            <span className="text-fg">
              {Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}
            </span>
          </p>
        ))}

        <ItemBody itemId={item.id} editing={editing} onDone={onDoneEdit} />
      </div>
    </div>
  );
}
