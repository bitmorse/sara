import { PanelRight, History } from "lucide-react";

import { Tabs } from "@/components/ui/Tabs";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { ItemInspector } from "@/components/inspector/ItemInspector";
import { TraceabilityPanel } from "@/components/inspector/TraceabilityPanel";
import { FileHistory } from "@/components/git/FileHistory";
import { DiffView } from "@/components/git/DiffView";
import { useIpc } from "@/lib/ipc/context";
import { useItem } from "@/lib/query/hooks";
import { useQuery } from "@tanstack/react-query";
import { useUiStore } from "@/store/ui";

function HistoryPanel({ itemId }: { itemId: string | null }) {
  const ipc = useIpc();
  const { data: item } = useItem(itemId);
  const path = item?.filePath ?? null;
  const { data: diff, isLoading } = useQuery({
    queryKey: ["diff", path],
    queryFn: () => ipc.gitDiffFile(path!, { kind: "working" }, { kind: "ref", ref: "HEAD" }),
    enabled: !!path,
  });

  if (!itemId) {
    return <EmptyState icon={History} title="No item selected" description="Select an item to view its version history." />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="max-h-[45%] shrink-0 overflow-y-auto border-b border-border">
        <FileHistory path={path} />
      </div>
      <div className="min-h-0 flex-1">
        {isLoading ? <LoadingState /> : diff ? <DiffView diff={diff} /> : null}
      </div>
    </div>
  );
}

/** Right dock: metadata Inspector or per-file History + diff. */
export function RightPanel() {
  const { rightPanel, setRightPanel, selectedItemId } = useUiStore();

  return (
    <aside className="flex h-full flex-col border-l border-border bg-surface">
      <Tabs
        variant="underline"
        value={rightPanel === "history" ? "history" : "inspector"}
        onChange={(v) => setRightPanel(v)}
        className="px-1"
        tabs={[
          { id: "inspector", label: "Inspector", icon: PanelRight },
          { id: "history", label: "History", icon: History },
        ]}
      />
      <div className="min-h-0 flex-1">
        {rightPanel === "history" ? (
          <HistoryPanel itemId={selectedItemId} />
        ) : (
          <ItemInspector itemId={selectedItemId} extra={(item) => <TraceabilityPanel itemId={item.id} />} />
        )}
      </div>
    </aside>
  );
}
