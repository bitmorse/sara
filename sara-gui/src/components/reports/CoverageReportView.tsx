import { useSchema } from "@/lib/query/hooks";
import { useIpc } from "@/lib/ipc/context";
import { useQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components/ui/feedback";
import { typeVisual } from "@/lib/item-type-meta";
import type { TypeCoverage } from "@/types/domain";

function CoverageBar({ percent }: { percent: number }) {
  const tone = percent >= 80 ? "var(--success)" : percent >= 40 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: tone }} />
    </div>
  );
}

function TypeRow({ row, name }: { row: TypeCoverage; name: string }) {
  const { icon: Icon, color } = typeVisual(row.type);
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-2">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 shrink-0" style={{ color: `var(--color-${color})` }} aria-hidden />
        <span className="text-xs text-fg">{name}</span>
        <span className="text-[11px] text-subtle-fg">
          {row.complete}/{row.total}
        </span>
      </div>
      <span className="text-right font-mono text-[11px] tabular-nums text-muted-fg">
        {Math.round(row.coveragePercent)}%
      </span>
      <div className="col-span-2">
        <CoverageBar percent={row.coveragePercent} />
      </div>
    </div>
  );
}

/** Coverage report: overall gauge + per-type traceability coverage. */
export function CoverageReportView() {
  const ipc = useIpc();
  const { data: schema } = useSchema();
  const { data: report, isLoading } = useQuery({
    queryKey: ["coverage"],
    queryFn: () => ipc.coverageReport(),
  });

  if (isLoading || !report) return <LoadingState label="Generating report…" />;

  const typeName = (id: string) => schema?.itemTypes.find((t) => t.id === id)?.displayName ?? id;
  const overall = Math.round(report.overallCoverage * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-6 rounded-lg border border-border bg-surface p-5">
        <div className="text-center">
          <div className="text-4xl font-semibold tabular-nums text-fg">{overall}%</div>
          <div className="text-[11px] uppercase tracking-wide text-subtle-fg">overall</div>
        </div>
        <div className="flex-1 space-y-2">
          <CoverageBar percent={overall} />
          <p className="text-xs text-muted-fg">
            {report.completeItems} of {report.totalItems} items are fully traced to their neighbours.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface px-5 py-2">
        <h3 className="py-2 text-[10px] font-semibold uppercase tracking-wide text-subtle-fg">
          Coverage by type
        </h3>
        <div className="divide-y divide-border">
          {report.byType.map((row) => (
            <TypeRow key={row.type} row={row} name={typeName(row.type)} />
          ))}
        </div>
      </div>
    </div>
  );
}
