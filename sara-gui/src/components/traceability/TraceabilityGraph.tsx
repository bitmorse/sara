import { useState } from "react";
import { ArrowUpDown, Share2 } from "lucide-react";

import { Tabs } from "@/components/ui/Tabs";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useIpc } from "@/lib/ipc/context";
import { useQuery } from "@tanstack/react-query";
import { MermaidDiagram } from "@/components/markdown/MermaidDiagram";
import type { RelationDirection } from "@/types/domain";

/** Renders a traversal as an interactive Mermaid flowchart. */
export function TraceabilityGraph({ itemId }: { itemId: string | null }) {
  const ipc = useIpc();
  const [direction, setDirection] = useState<RelationDirection>("upstream");
  const { data: code, isLoading } = useQuery({
    queryKey: ["mermaid", itemId, direction],
    queryFn: () => ipc.mermaid(itemId!, { direction }),
    enabled: !!itemId,
  });

  if (!itemId) {
    return <EmptyState icon={Share2} title="No item selected" description="Select an item to see its traceability graph." />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-fg">
          Traceability of <span className="font-mono text-primary">{itemId}</span>
        </span>
        <Tabs<RelationDirection>
          variant="segmented"
          value={direction}
          onChange={setDirection}
          className="ml-auto"
          tabs={[
            { id: "upstream", label: "Upstream", icon: ArrowUpDown },
            { id: "downstream", label: "Downstream", icon: ArrowUpDown },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-6">
        {isLoading || !code ? <LoadingState /> : <MermaidDiagram code={code} />}
      </div>
    </div>
  );
}
