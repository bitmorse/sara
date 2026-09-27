import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FileSearch } from "lucide-react";

import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useItems, useSchema } from "@/lib/query/hooks";
import { ObjectRow } from "./ObjectRow";

export interface DocumentViewProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Id of the row currently being edited (null = all read-only). */
  editingId?: string | null;
  onEdit?: (id: string) => void;
  /** Optional text filter over id/name. */
  filter?: string;
}

/**
 * The center document: a virtualized list of requirement "objects", each
 * rendering its markdown body inline (read-only by default; the edited row
 * shows the MDXEditor). Dynamic row measurement keeps large repos snappy.
 */
export function DocumentView({
  selectedId,
  onSelect,
  editingId,
  onEdit,
  filter,
}: DocumentViewProps) {
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
    estimateSize: () => 160,
    overscan: 6,
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
                selected={item.id === selectedId}
                editing={item.id === editingId}
                onSelect={() => onSelect(item.id)}
                onEdit={() => onEdit?.(item.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
