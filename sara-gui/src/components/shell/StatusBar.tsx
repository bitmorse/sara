import { GitBranch, CircleCheck, CircleAlert, CircleX, Pencil, Eye } from "lucide-react";

import { cn } from "@/lib/cn";
import type { BranchInfo, ValidationReport } from "@/types/domain";

export interface StatusBarProps {
  branch: BranchInfo;
  dirtyCount: number;
  validation?: Pick<ValidationReport, "valid"> & { errors: number; warnings: number };
  user?: string;
  editing?: boolean;
}

/** Bottom status strip: branch, dirty files, validation summary, user, mode. */
export function StatusBar({ branch, dirtyCount, validation, user, editing }: StatusBarProps) {
  return (
    <footer
      className="flex items-center justify-between gap-3 border-t border-border bg-surface px-3 text-[11px] text-muted-fg"
      style={{ height: "var(--statusbar-height)" }}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1">
          <GitBranch className="size-3" aria-hidden />
          {branch.name}
          {branch.ahead > 0 && <span className="text-subtle-fg">↑{branch.ahead}</span>}
          {branch.behind > 0 && <span className="text-subtle-fg">↓{branch.behind}</span>}
        </span>
        <span className={cn(dirtyCount > 0 ? "text-warning" : "text-muted-fg")}>
          {dirtyCount} change{dirtyCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {validation &&
          (validation.valid ? (
            <span className="inline-flex items-center gap-1 text-success">
              <CircleCheck className="size-3" aria-hidden /> valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              {validation.errors > 0 && (
                <span className="inline-flex items-center gap-1 text-danger">
                  <CircleX className="size-3" aria-hidden /> {validation.errors}
                </span>
              )}
              {validation.warnings > 0 && (
                <span className="inline-flex items-center gap-1 text-warning">
                  <CircleAlert className="size-3" aria-hidden /> {validation.warnings}
                </span>
              )}
            </span>
          ))}
        <span className="inline-flex items-center gap-1">
          {editing ? (
            <>
              <Pencil className="size-3" aria-hidden /> editing
            </>
          ) : (
            <>
              <Eye className="size-3" aria-hidden /> reading
            </>
          )}
        </span>
        {user && <span className="text-subtle-fg">{user}</span>}
      </div>
    </footer>
  );
}
