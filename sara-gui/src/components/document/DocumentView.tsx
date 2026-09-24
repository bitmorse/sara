import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FileSearch } from "lucide-react";

import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useItems, useSchema } from "@/lib/query/hooks";
import type { ItemDetail } from "@/types/domain";
import { ObjectRow } from "./ObjectRow";

export interface DocumentViewProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Optional text filter over id/name. */
  filter?: string;
  /** Renders the inline editor for the currently-selected row. */
  renderEditor?: (item: ItemDetail) => React.ReactNode;
}

/**
 * The center document: a virtualized list of requirement "objects". Uses
 * TanStack Virtual with dynamic row measurement so long specifications and the
 * inline editor don't blow up scroll performance across large repos.
 */
export function DocumentView({ selectedId, onSelect, filter, renderEditor }: DocumentViewProps) {
  const { data: items, isLoading } = useItems();
  const { data: schema } = useSchema();
  const parentRef = useRef<HTMLDivElement>(null);

  const q = filter?.trim().toLowerCase();
  const rows = (items ?? []).filter(
    (it) => !q || it.id.toLowerCase().includes(q) || it.name.toLowerCase().includes(q),
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96,
    overscan: 8,
    getItemKey: (i) => rows[i].id,
  });

  if (isLoading) return <LoadingState />;
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title={q ? "No matching items" : "No items"}
        description={q ? "Try a different search." : "This project has no items yet."}
      />
    );
  }

  const typeName = (id: string) => schema?.itemTypes.find((t) => t.id === id)?.displayName;

  return (
    <div ref={parentRef} className="h-full overflow-y-auto">
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((v) => {
          const item = rows[v.index];
          const selected = item.id === selectedId;
          return (
            <div
              key={v.key}
              data-index={v.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${v.start}px)` }}
            >
              <ObjectRow
                item={item}
                index={v.index}
                typeName={typeName(item.type)}
                selected={selected}
                onSelect={() => onSelect(item.id)}
                editorSlot={selected && renderEditor ? renderEditor(item) : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
