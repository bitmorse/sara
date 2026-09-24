import { useMemo, useState } from "react";
import { ChevronRight, Folder, FolderOpen, FileText } from "lucide-react";

import { cn } from "@/lib/cn";

interface DirNode {
  name: string;
  path: string;
  dirs: Map<string, DirNode>;
  files: { name: string; path: string }[];
}

function buildDirs(paths: string[]): DirNode {
  const root: DirNode = { name: "", path: "", dirs: new Map(), files: [] };
  for (const p of [...paths].sort()) {
    const parts = p.split("/");
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      const path = parts.slice(0, i + 1).join("/");
      if (!cur.dirs.has(seg)) cur.dirs.set(seg, { name: seg, path, dirs: new Map(), files: [] });
      cur = cur.dirs.get(seg)!;
    }
    cur.files.push({ name: parts[parts.length - 1], path: p });
  }
  return root;
}

export interface FileTreeProps {
  /** Repo-relative markdown paths. */
  paths: string[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

/** Filesystem view of the repo's markdown files. */
export function FileTree({ paths, selectedPath, onSelect }: FileTreeProps) {
  const root = useMemo(() => buildDirs(paths), [paths]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (p: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });

  const renderDir = (dir: DirNode, depth: number): React.ReactNode => {
    const open = !collapsed.has(dir.path);
    return (
      <div key={dir.path || "root"}>
        {dir.name && (
          <div
            onClick={() => toggle(dir.path)}
            className="flex cursor-pointer items-center gap-1 pr-2 text-xs text-fg hover:bg-accent"
            style={{ height: "var(--row-height)", paddingLeft: `${depth * 12 + 4}px` }}
          >
            <ChevronRight className={cn("size-3 shrink-0 text-muted-fg transition-transform", open && "rotate-90")} />
            {open ? (
              <FolderOpen className="size-3.5 shrink-0 text-muted-fg" aria-hidden />
            ) : (
              <Folder className="size-3.5 shrink-0 text-muted-fg" aria-hidden />
            )}
            <span className="truncate">{dir.name}</span>
          </div>
        )}
        {open && (
          <>
            {[...dir.dirs.values()].map((d) => renderDir(d, dir.name ? depth + 1 : depth))}
            {dir.files.map((f) => {
              const selected = f.path === selectedPath;
              return (
                <div
                  key={f.path}
                  onClick={() => onSelect(f.path)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1 pr-2 text-xs transition-colors",
                    selected ? "bg-primary/12 text-fg" : "text-fg hover:bg-accent",
                  )}
                  style={{
                    height: "var(--row-height)",
                    paddingLeft: `${(dir.name ? depth + 1 : depth) * 12 + 20}px`,
                  }}
                >
                  <FileText className="size-3.5 shrink-0 text-muted-fg" aria-hidden />
                  <span className="truncate">{f.name}</span>
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  };

  return <div className="py-1">{renderDir(root, 0)}</div>;
}
