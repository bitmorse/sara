import { useCallback, useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderGit2, FolderPlus, Trash2, Clock } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useRecentProjects, useForgetProject } from "@/lib/query/hooks";

/**
 * Chooses which repo the workbench opens: auto-opens the most-recent existing
 * project on launch, otherwise shows a chooser (recents + "open other"). One
 * project = one git repository = one sara.
 */
export function ProjectGate() {
  const { data: recents, isLoading } = useRecentProjects();
  const forget = useForgetProject();
  const [root, setRoot] = useState<string | null>(null);
  const [autoTried, setAutoTried] = useState(false);

  // On first load, auto-open the most-recent repo that still exists on disk.
  useEffect(() => {
    if (autoTried || isLoading || !recents) return;
    setAutoTried(true);
    const last = recents.find((r) => !r.missing);
    if (last) setRoot(last.root);
  }, [autoTried, isLoading, recents]);

  const pick = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Open a SARA project (git repository)",
      });
      if (typeof selected === "string") setRoot(selected);
    } catch {
      /* dialog unavailable (e.g. Storybook) — ignore */
    }
  }, []);

  if (root) {
    // Remount on root change so every query re-keys cleanly.
    return <AppShell key={root} root={root} onOpenProject={pick} onSelectProject={setRoot} />;
  }

  if (isLoading || !autoTried) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-fg">
        <LoadingState label="Loading…" />
      </div>
    );
  }

  const list = recents ?? [];
  if (list.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-fg">
        <EmptyState
          icon={FolderGit2}
          title="Open a project"
          description="One project = one git repository = one sara. Choose a repository folder to begin."
          action={<Button variant="primary" icon={FolderGit2} onClick={pick}>Open repository…</Button>}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background text-fg">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-subtle-fg">
          <Clock className="size-3.5" aria-hidden /> Recent projects
        </div>
        <ul className="space-y-0.5">
          {list.map((r) => (
            <li key={r.root} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent">
              <button
                className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:opacity-50"
                disabled={r.missing}
                onClick={() => setRoot(r.root)}
              >
                <FolderGit2 className="size-4 shrink-0 text-muted-fg" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-fg">{r.name}</span>
                  <span className="block truncate text-[10px] text-subtle-fg">{r.root}</span>
                </span>
                {r.missing && <span className="ml-auto text-[10px] text-danger">missing</span>}
              </button>
              <button
                className="hidden size-6 items-center justify-center rounded text-muted-fg hover:bg-surface hover:text-danger group-hover:flex"
                aria-label="Forget"
                title="Remove from recents"
                onClick={() => forget.mutate(r.root)}
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-border pt-3">
          <Button variant="secondary" icon={FolderPlus} className="w-full" onClick={pick}>
            Open other folder…
          </Button>
        </div>
      </div>
    </div>
  );
}
