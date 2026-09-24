import { ArrowUp, ArrowDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { typeVisual } from "@/lib/item-type-meta";
import { useTraversal } from "@/lib/query/hooks";
import type { RelationDirection, TraversalNode } from "@/types/domain";

function Chain({ itemId, direction }: { itemId: string; direction: RelationDirection }) {
  const { data } = useTraversal(itemId, { direction });
  const nodes = (data?.nodes ?? []).filter((n) => n.depth > 0);

  if (nodes.length === 0) {
    return <p className="px-1 py-1 text-[11px] text-subtle-fg">None</p>;
  }

  return (
    <ul className="space-y-0.5">
      {nodes.map((n: TraversalNode) => {
        const { icon: Icon, color } = typeVisual(n.type);
        return (
          <li
            key={n.id}
            className="flex items-center gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-accent"
            style={{ paddingLeft: `${(n.depth - 1) * 12 + 4}px` }}
          >
            <Icon className="size-3.5 shrink-0" style={{ color: `var(--color-${color})` }} aria-hidden />
            <span className="font-mono text-[11px] text-muted-fg">{n.id}</span>
            <span className="truncate text-fg">{n.name}</span>
            {n.relation && (
              <span className="ml-auto shrink-0 text-[10px] text-subtle-fg">{n.relation}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Upstream & downstream traceability chains for an item. */
export function TraceabilityPanel({ itemId }: { itemId: string }) {
  return (
    <div className="space-y-3">
      <div>
        <div className={cn("mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-subtle-fg")}>
          <ArrowUp className="size-3" aria-hidden /> Upstream
        </div>
        <Chain itemId={itemId} direction="upstream" />
      </div>
      <div>
        <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-subtle-fg">
          <ArrowDown className="size-3" aria-hidden /> Downstream
        </div>
        <Chain itemId={itemId} direction="downstream" />
      </div>
    </div>
  );
}
