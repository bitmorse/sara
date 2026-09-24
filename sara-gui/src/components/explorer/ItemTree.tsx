import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";
import { typeVisual } from "@/lib/item-type-meta";
import type { TreeNode } from "@/types/domain";

export interface ItemTreeProps {
  nodes: TreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** DOORS-style numbered, collapsible traceability outline. */
export function ItemTree({ nodes, selectedId, onSelect }: ItemTreeProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const render = (node: TreeNode, depth: number): React.ReactNode => {
    const { icon: Icon, color } = typeVisual(node.item.type);
    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsed.has(node.item.id);
    const selected = node.item.id === selectedId;

    return (
      <div key={node.item.id} role="treeitem" aria-selected={selected} aria-expanded={hasChildren ? !isCollapsed : undefined}>
        <div
          onClick={() => onSelect(node.item.id)}
          className={cn(
            "group flex cursor-pointer items-center gap-1 pr-2 text-xs transition-colors",
            selected ? "bg-primary/12 text-fg" : "text-fg hover:bg-accent",
          )}
          style={{ height: "var(--row-height)", paddingLeft: `${depth * 10 + 4}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggle(node.item.id);
            }}
            className={cn("flex size-4 shrink-0 items-center justify-center rounded text-muted-fg", !hasChildren && "invisible")}
            aria-label={isCollapsed ? "Expand" : "Collapse"}
            tabIndex={-1}
          >
            <ChevronRight className={cn("size-3 transition-transform", !isCollapsed && "rotate-90")} />
          </button>

          <span className="shrink-0 pr-1 font-mono text-[10px] tabular-nums text-subtle-fg">
            {node.outline}
          </span>

          <Icon className="size-3.5 shrink-0" style={{ color: `var(--color-${color})` }} aria-hidden />

          <span className="shrink-0 font-mono text-[11px] text-muted-fg">{node.item.id}</span>
          <span className="truncate">{node.item.name}</span>
        </div>

        {hasChildren && !isCollapsed && node.children.map((child) => render(child, depth + 1))}
      </div>
    );
  };

  return (
    <div role="tree" className="py-1">
      {nodes.map((n) => render(n, 0))}
    </div>
  );
}
