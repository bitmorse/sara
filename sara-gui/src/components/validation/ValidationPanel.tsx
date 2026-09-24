import { CircleX, CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useValidation } from "@/lib/query/hooks";
import type { ValidationIssue } from "@/types/domain";

function IssueRow({ issue, onSelect }: { issue: ValidationIssue; onSelect?: (id: string) => void }) {
  const isError = issue.severity === "error";
  const Icon = isError ? CircleX : CircleAlert;
  return (
    <button
      onClick={() => issue.itemId && onSelect?.(issue.itemId)}
      className="flex w-full items-start gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent"
    >
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", isError ? "text-danger" : "text-warning")} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-fg">{issue.message}</span>
        <span className="mt-0.5 flex items-center gap-2 text-[10px] text-subtle-fg">
          <span className="rounded-xs bg-muted px-1 font-mono">{issue.rule}</span>
          {issue.itemId && <span className="font-mono text-primary">{issue.itemId}</span>}
        </span>
      </span>
    </button>
  );
}

/** Lists validation errors and warnings from `sara check`. */
export function ValidationPanel({ onSelect }: { onSelect?: (id: string) => void }) {
  const { data: report, isLoading } = useValidation(false);

  if (isLoading || !report) return <LoadingState label="Validating…" />;

  const errors = report.issues.filter((i) => i.severity === "error");
  const warnings = report.issues.filter((i) => i.severity === "warning");

  if (report.issues.length === 0) {
    return (
      <EmptyState
        icon={CircleCheck}
        title="Graph is valid"
        description={`${report.itemsChecked} items and ${report.relationshipsChecked} relationships checked.`}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-3 py-1.5 text-[11px]">
        <span className="inline-flex items-center gap-1 text-danger">
          <CircleX className="size-3" aria-hidden /> {errors.length} errors
        </span>
        <span className="inline-flex items-center gap-1 text-warning">
          <CircleAlert className="size-3" aria-hidden /> {warnings.length} warnings
        </span>
        <span className="ml-auto text-subtle-fg">{report.itemsChecked} items</span>
      </div>
      <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {[...errors, ...warnings].map((issue, i) => (
          <IssueRow key={i} issue={issue} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
