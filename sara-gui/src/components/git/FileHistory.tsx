import { GitCommitHorizontal, History } from "lucide-react";

import { cn } from "@/lib/cn";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useFileHistory } from "@/lib/query/hooks";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = new Date("2026-09-24T12:00:00Z").getTime();
  const days = Math.floor((now - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export interface FileHistoryProps {
  path: string | null;
  selectedSha?: string | null;
  onSelectCommit?: (sha: string) => void;
}

/** Per-file commit history (backed by `git log --follow`). */
export function FileHistory({ path, selectedSha, onSelectCommit }: FileHistoryProps) {
  const { data: commits, isLoading } = useFileHistory(path);

  if (!path) {
    return <EmptyState icon={History} title="No file selected" description="Select an item to see its version history." />;
  }
  if (isLoading) return <LoadingState label="Loading history…" />;
  if (!commits?.length) {
    return <EmptyState icon={History} title="No history" description="This file has no commits yet." />;
  }

  return (
    <ol className="relative py-1">
      {commits.map((c, i) => {
        const selected = c.sha === selectedSha;
        return (
          <li key={c.sha}>
            <button
              onClick={() => onSelectCommit?.(c.sha)}
              className={cn(
                "flex w-full items-start gap-2 px-2.5 py-1.5 text-left text-xs transition-colors",
                selected ? "bg-primary/12" : "hover:bg-accent",
              )}
            >
              <span className="relative flex flex-col items-center pt-0.5">
                <GitCommitHorizontal className="size-3.5 text-muted-fg" aria-hidden />
                {i < commits.length - 1 && <span className="mt-0.5 h-6 w-px flex-1 bg-border" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-fg">{c.summary}</span>
                <span className="mt-0.5 flex items-center gap-2 text-[10px] text-subtle-fg">
                  <span className="font-mono">{c.shortSha}</span>
                  <span>{c.author}</span>
                  <span>{relativeTime(c.date)}</span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
