import { useState } from "react";
import { GitCommitHorizontal, RefreshCw, Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { EmptyState } from "@/components/ui/feedback";
import { useGitStatus, useStage, useCommit } from "@/lib/query/hooks";
import type { FileStatus } from "@/types/domain";
import { ChangeRow } from "./ChangeRow";

export interface SourceControlPanelProps {
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

/** VS Code-style Source Control: message box, staged & unstaged groups, commit. */
export function SourceControlPanel({ selectedPath, onSelectFile }: SourceControlPanelProps) {
  const { data: files = [] } = useGitStatus();
  const stage = useStage();
  const commit = useCommit();
  const [message, setMessage] = useState("");

  const staged = files.filter((f) => f.staged);
  const unstaged = files.filter((f) => !f.staged);
  const canCommit = staged.length > 0 && message.trim().length > 0;

  const group = (title: string, list: FileStatus[], action?: React.ReactNode) =>
    list.length > 0 && (
      <div>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-subtle-fg">
            {title} — {list.length}
          </span>
          {action}
        </div>
        {list.map((f) => (
          <ChangeRow
            key={f.path}
            file={f}
            selected={f.path === selectedPath}
            onSelect={() => onSelectFile(f.path)}
            onToggleStage={() => stage.mutate({ paths: [f.path], stage: !f.staged })}
          />
        ))}
      </div>
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-subtle-fg">
          Source Control
        </span>
        <IconButton icon={RefreshCw} label="Refresh" size="sm" />
      </div>

      <div className="space-y-1.5 border-b border-border px-2 pb-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Message (conventional commit, e.g. feat(sysreq): …)"
          className="w-full resize-none rounded-md border border-input bg-surface px-2 py-1.5 text-xs text-fg placeholder:text-subtle-fg focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring"
        />
        <Button
          size="sm"
          variant="primary"
          icon={GitCommitHorizontal}
          className="w-full"
          disabled={!canCommit}
          loading={commit.isPending}
          onClick={() =>
            commit.mutate(message, {
              onSuccess: () => setMessage(""),
            })
          }
        >
          Commit {staged.length > 0 && `(${staged.length})`}
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <EmptyState icon={Check} title="No changes" description="Your working tree is clean." />
        ) : (
          <>
            {group(
              "Staged Changes",
              staged,
              staged.length > 0 && (
                <button
                  onClick={() => stage.mutate({ paths: staged.map((f) => f.path), stage: false })}
                  className="text-[10px] text-muted-fg hover:text-fg"
                >
                  Unstage all
                </button>
              ),
            )}
            {group(
              "Changes",
              unstaged,
              unstaged.length > 0 && (
                <button
                  onClick={() => stage.mutate({ paths: unstaged.map((f) => f.path), stage: true })}
                  className="text-[10px] text-muted-fg hover:text-fg"
                >
                  Stage all
                </button>
              ),
            )}
          </>
        )}
      </div>
    </div>
  );
}
