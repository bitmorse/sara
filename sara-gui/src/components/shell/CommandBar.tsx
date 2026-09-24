import { Search, ShieldCheck, GitCommitHorizontal, Plus, FileText, Share2, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Kbd } from "@/components/ui/Kbd";
import type { MainView } from "@/store/ui";

export interface CommandBarProps {
  view: MainView;
  onViewChange: (v: MainView) => void;
  search: string;
  onSearchChange: (q: string) => void;
  dirtyCount: number;
  onCheck?: () => void;
  onCommit?: () => void;
  onNewItem?: () => void;
}

/** Primary toolbar: view switch, global search, and workspace actions. */
export function CommandBar({
  view,
  onViewChange,
  search,
  onSearchChange,
  dirtyCount,
  onCheck,
  onCommit,
  onNewItem,
}: CommandBarProps) {
  return (
    <div
      className="flex items-center gap-3 border-b border-border bg-surface px-3"
      style={{ height: "var(--toolbar-height)" }}
    >
      <Tabs
        variant="segmented"
        value={view}
        onChange={onViewChange}
        className="shrink-0"
        tabs={[
          { id: "document", label: "Document", icon: FileText },
          { id: "traceability", label: "Traceability", icon: Share2 },
          { id: "reports", label: "Reports", icon: BarChart3 },
        ]}
      />

      <div className="relative mx-auto w-full max-w-md">
        <Input
          leading={<Search className="size-3.5" />}
          placeholder="Search items by id or name…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <Kbd keys={["⌘", "K"]} />
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button size="sm" variant="ghost" icon={Plus} onClick={onNewItem}>
          New
        </Button>
        <Button size="sm" variant="ghost" icon={ShieldCheck} onClick={onCheck}>
          Check
        </Button>
        <Button size="sm" variant="primary" icon={GitCommitHorizontal} onClick={onCommit}>
          Commit
          {dirtyCount > 0 && (
            <span className="ml-1 rounded-full bg-primary-fg/20 px-1.5 text-[10px] leading-4">
              {dirtyCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
