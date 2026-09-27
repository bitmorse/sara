import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SplitPane } from "@/components/ui/SplitPane";
import { TitleBar } from "./TitleBar";
import { CommandBar } from "./CommandBar";
import { StatusBar } from "./StatusBar";
import { RightPanel } from "./RightPanel";
import { Explorer } from "@/components/explorer/Explorer";
import { DocumentView } from "@/components/document/DocumentView";
import { TraceabilityGraph } from "@/components/traceability/TraceabilityGraph";
import { CoverageReportView } from "@/components/reports/CoverageReportView";
import { Button } from "@/components/ui/Button";
import { LoadingState, EmptyState } from "@/components/ui/feedback";
import { FolderGit2 } from "lucide-react";
import { useIpc } from "@/lib/ipc/context";
import {
  useGitStatus,
  useValidation,
  useRecentProjects,
  useRememberProject,
} from "@/lib/query/hooks";
import { useThemeController } from "@/lib/use-theme";
import { useUiStore } from "@/store/ui";
import { REPO_ROOT } from "@/fixtures/smart-home";

export interface AppShellProps {
  /** Repository root to open (one repo = one project = one sara). */
  root?: string;
  /** Pick a different repo via the OS dialog (real app only). */
  onOpenProject?: () => void;
  /** Switch to a known recent repo by root. */
  onSelectProject?: (root: string) => void;
}

/** The complete application layout: chrome + three-pane workbench. */
export function AppShell({ root = REPO_ROOT, onOpenProject, onSelectProject }: AppShellProps) {
  const ipc = useIpc();
  const [theme, toggleTheme] = useThemeController();
  const {
    mainView,
    setMainView,
    selectedItemId,
    select,
    editing,
    setEditing,
    inspectorCollapsed,
    toggleInspector,
  } = useUiStore();
  const [search, setSearch] = useState("");

  // Keyboard: ⌘E edit selected · Esc exit edit · ⌘I toggle inspector.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        useUiStore.getState().setEditing(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        const s = useUiStore.getState();
        if (s.selectedItemId) s.setEditing(!s.editing);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        useUiStore.getState().toggleInspector();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Load the graph into the backend before any read hook runs (the mock's
  // loadGraph just returns fixtures, so Storybook is unaffected).
  const load = useQuery({
    queryKey: ["load", root],
    queryFn: () => ipc.loadGraph([root]),
  });

  const { data: workspace } = useQuery({
    queryKey: ["workspace", root],
    queryFn: () => ipc.openWorkspace(root),
    enabled: load.isSuccess,
  });
  const { data: gitStatus = [] } = useGitStatus();
  const { data: validation } = useValidation(false);
  const { data: recents = [] } = useRecentProjects();
  const remember = useRememberProject();

  // Record the repo as most-recently-used once it has loaded.
  useEffect(() => {
    if (load.isSuccess) remember.mutate(root);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load.isSuccess, root]);

  if (load.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingState label="Opening project…" />
      </div>
    );
  }
  if (load.isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <EmptyState
          icon={FolderGit2}
          title="Couldn't open project"
          description={String((load.error as Error)?.message ?? load.error)}
          action={onOpenProject ? <Button variant="primary" onClick={onOpenProject}>Open a project…</Button> : undefined}
        />
      </div>
    );
  }

  const main =
    mainView === "document" ? (
      <DocumentView
        selectedId={selectedItemId}
        editingId={editing ? selectedItemId : null}
        filter={search}
        onSelect={(id) => {
          if (id !== selectedItemId) setEditing(false);
          select(id);
        }}
        onEdit={(id) => {
          select(id);
          setEditing(true);
        }}
      />
    ) : mainView === "traceability" ? (
      <TraceabilityGraph itemId={selectedItemId} />
    ) : (
      <CoverageReportView />
    );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-fg">
      {workspace && (
        <TitleBar
          workspace={workspace}
          theme={theme}
          onToggleTheme={toggleTheme}
          recents={recents}
          currentRoot={root}
          onSelectProject={onSelectProject}
          onOpenOther={onOpenProject}
        />
      )}
      <CommandBar
        view={mainView}
        onViewChange={setMainView}
        search={search}
        onSearchChange={setSearch}
        dirtyCount={gitStatus.length}
        onCommit={() => useUiStore.getState().setLeftTab("source-control")}
        inspectorCollapsed={inspectorCollapsed}
        onToggleInspector={toggleInspector}
      />

      <div className="min-h-0 flex-1">
        <SplitPane
          direction="horizontal"
          initialSize={300}
          minFirst={220}
          first={<Explorer />}
          second={
            inspectorCollapsed ? (
              <div className="h-full bg-background">{main}</div>
            ) : (
              <SplitPane
                direction="horizontal"
                initialSize={720}
                minFirst={360}
                minSecond={280}
                first={<div className="h-full bg-background">{main}</div>}
                second={<RightPanel />}
              />
            )
          }
        />
      </div>

      <StatusBar
        branch={workspace?.branch ?? { name: "—", ahead: 0, behind: 0, detached: false }}
        dirtyCount={gitStatus.length}
        validation={
          validation && {
            valid: validation.valid,
            errors: validation.issues.filter((i) => i.severity === "error").length,
            warnings: validation.issues.filter((i) => i.severity === "warning").length,
          }
        }
        user="sam@octanis.ch"
        editing={editing}
      />
    </div>
  );
}
