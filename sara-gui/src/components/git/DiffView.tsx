import { cn } from "@/lib/cn";
import type { FileDiff } from "@/types/domain";

const LINE_BG: Record<string, string> = {
  add: "bg-diff-add",
  remove: "bg-diff-remove",
  hunk: "bg-muted",
  meta: "bg-muted",
  context: "",
};

const GUTTER: Record<string, string> = {
  add: "text-success",
  remove: "text-danger",
  context: "text-subtle-fg",
  hunk: "text-subtle-fg",
  meta: "text-subtle-fg",
};

/** Unified diff renderer with line numbers and add/remove tinting. */
export function DiffView({ diff }: { diff: FileDiff }) {
  if (diff.binary) {
    return (
      <div className="p-6 text-center text-xs text-muted-fg">Binary file — no textual diff.</div>
    );
  }

  return (
    <div className="min-h-0 overflow-auto font-mono text-[12px] leading-5">
      <div className="sticky top-0 z-10 border-b border-border bg-surface px-3 py-1.5 text-[11px] text-muted-fg">
        {diff.path}
      </div>
      <table className="w-full border-collapse">
        <tbody>
          {diff.lines.map((line, i) => {
            const prefix = line.kind === "add" ? "+" : line.kind === "remove" ? "-" : " ";
            return (
              <tr key={i} className={cn(LINE_BG[line.kind])}>
                <td className={cn("w-10 select-none px-1 text-right align-top tabular-nums", GUTTER[line.kind])}>
                  {line.oldNo ?? ""}
                </td>
                <td className={cn("w-10 select-none px-1 text-right align-top tabular-nums", GUTTER[line.kind])}>
                  {line.newNo ?? ""}
                </td>
                <td className="w-4 select-none px-1 text-center align-top text-subtle-fg">{line.kind === "hunk" ? "" : prefix}</td>
                <td
                  className={cn(
                    "whitespace-pre-wrap break-all py-0 pr-3 align-top",
                    line.kind === "add" && "text-fg",
                    line.kind === "remove" && "text-fg",
                    line.kind === "hunk" && "text-info",
                    line.kind === "context" && "text-muted-fg",
                  )}
                >
                  {line.text}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
