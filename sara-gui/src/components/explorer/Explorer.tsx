import { useMemo } from "react";
import { ListTree, FolderGit2, GitPullRequestArrow } from "lucide-react";

import { Tabs } from "@/components/ui/Tabs";
import { LoadingState } from "@/components/ui/feedback";
import { useItems, useTree, useGitStatus } from "@/lib/query/hooks";
import { useUiStore, type LeftTab } from "@/store/ui";
import { ItemTree } from "./ItemTree";
import { FileTree } from "./FileTree";
import { SourceControlPanel } from "@/components/git/SourceControlPanel";

/** Left navigation: traceability outline, file tree, and source control. */
export function Explorer() {
  const { data: tree, isLoading } = useTree();
  const { data: items = [] } = useItems();
  const { data: gitStatus = [] } = useGitStatus();
  const { leftTab, setLeftTab, selectedItemId, select } = useUiStore();

  const pathToId = useMemo(
    () => new Map(items.map((it) => [it.filePath, it.id])),
    [items],
  );
  const selectedPath = items.find((it) => it.id === selectedItemId)?.filePath ?? null;

  return (
    <div className="flex h-full flex-col bg-surface">
      <Tabs<LeftTab>
        variant="underline"
        value={leftTab}
        onChange={setLeftTab}
        className="px-1"
        tabs={[
          { id: "outline", label: "Outline", icon: ListTree },
          { id: "files", label: "Files", icon: FolderGit2 },
          { id: "source-control", label: "Changes", icon: GitPullRequestArrow, count: gitStatus.length || undefined },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {leftTab === "outline" &&
          (isLoading ? (
            <LoadingState />
          ) : (
            <ItemTree nodes={tree ?? []} selectedId={selectedItemId} onSelect={select} />
          ))}

        {leftTab === "files" && (
          <FileTree
            paths={items.map((it) => it.filePath)}
            selectedPath={selectedPath}
            onSelect={(path) => {
              const id = pathToId.get(path);
              if (id) select(id);
            }}
          />
        )}

        {leftTab === "source-control" && (
          <SourceControlPanel
            selectedPath={selectedPath}
            onSelectFile={(path) => {
              const id = pathToId.get(path);
              if (id) select(id);
            }}
          />
        )}
      </div>
    </div>
  );
}
