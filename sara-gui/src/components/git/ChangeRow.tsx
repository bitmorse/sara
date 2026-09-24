import { Plus, Minus } from "lucide-react";

import { cn } from "@/lib/cn";
import type { FileStatus } from "@/types/domain";
import { CHANGE_META, splitPath } from "./statusMeta";

export interface ChangeRowProps {
  file: FileStatus;
  selected?: boolean;
  onSelect?: () => void;
  onToggleStage?: () => void;
}

/** One changed file in the Source Control list, with a hover stage/unstage action. */
export function ChangeRow({ file, selected, onSelect, onToggleStage }: ChangeRowProps) {
  const meta = CHANGE_META[file.kind];
  const { dir, base } = splitPath(file.path);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex cursor-pointer items-center gap-2 px-2 text-xs transition-colors",
        selected ? "bg-primary/12" : "hover:bg-accent",
      )}
      style={{ height: "var(--row-height)" }}
    >
      <span className="min-w-0 flex-1 truncate">
        <span className={cn("text-fg", file.kind === "deleted" && "line-through opacity-70")}>{base}</span>
        {dir && <span className="ml-1.5 text-[10px] text-subtle-fg">{dir}</span>}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStage?.();
        }}
        className="hidden size-5 items-center justify-center rounded text-muted-fg hover:bg-surface hover:text-fg group-hover:flex"
        aria-label={file.staged ? "Unstage" : "Stage"}
        title={file.staged ? "Unstage" : "Stage"}
      >
        {file.staged ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
      </button>

      <span
        className="w-3 text-center font-mono text-[11px] font-semibold"
        style={{ color: meta.color }}
        title={meta.label}
      >
        {meta.letter}
      </span>
    </div>
  );
}
