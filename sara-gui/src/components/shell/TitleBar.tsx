import { ChevronDown, GitBranch, Moon, Sun, FolderGit2 } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import type { WorkspaceInfo } from "@/types/domain";

export interface TitleBarProps {
  workspace: WorkspaceInfo;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenProject?: () => void;
}

/**
 * Slim application header: brand mark, project switcher (one project = one repo
 * = one sara), branch, and theme toggle. Sits above the toolbar.
 */
export function TitleBar({ workspace, theme, onToggleTheme, onOpenProject }: TitleBarProps) {
  return (
    <header
      className="flex items-center justify-between gap-3 border-b border-border bg-surface px-2.5"
      style={{ height: "var(--titlebar-height)" }}
    >
      <div className="flex items-center gap-2">
        <div className="flex size-5 items-center justify-center rounded bg-primary text-primary-fg">
          <span className="text-[11px] font-bold">S</span>
        </div>
        <span className="text-xs font-semibold tracking-tight text-fg">SARA</span>
      </div>

      <button
        onClick={onOpenProject}
        className="group flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent"
      >
        <FolderGit2 className="size-3.5 text-muted-fg" aria-hidden />
        <span className="truncate font-medium text-fg">{workspace.name}</span>
        <span className="inline-flex items-center gap-1 text-muted-fg">
          <GitBranch className="size-3" aria-hidden />
          {workspace.branch.name}
        </span>
        <ChevronDown className="size-3 text-subtle-fg" aria-hidden />
      </button>

      <div className="flex items-center gap-1">
        <Tooltip content={theme === "dark" ? "Light theme" : "Dark theme"}>
          <IconButton
            icon={theme === "dark" ? Sun : Moon}
            label="Toggle theme"
            size="sm"
            onClick={onToggleTheme}
          />
        </Tooltip>
      </div>
    </header>
  );
}
