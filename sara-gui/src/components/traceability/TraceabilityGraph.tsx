import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";
import { ArrowUpDown, Share2 } from "lucide-react";

import { Tabs } from "@/components/ui/Tabs";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useIpc } from "@/lib/ipc/context";
import { useQuery } from "@tanstack/react-query";
import { useIsDark } from "@/lib/use-theme";
import type { RelationDirection } from "@/types/domain";

function MermaidDiagram({ code }: { code: string }) {
  const isDark = useIsDark();
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "_");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "neutral",
      securityLevel: "strict",
      flowchart: { htmlLabels: true, curve: "basis" },
    });
    mermaid
      .render(`m_${id}`, code)
      .then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [code, id, isDark]);

  if (error) return <p className="p-4 text-xs text-danger">{error}</p>;
  return <div ref={ref} className="flex justify-center [&_svg]:max-w-full" />;
}

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
