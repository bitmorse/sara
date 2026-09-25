import { ChevronDown, GitBranch, Moon, Sun, FolderGit2, FolderPlus, Check } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/cn";
import type { RecentProject, WorkspaceInfo } from "@/types/domain";

export interface TitleBarProps {
  workspace: WorkspaceInfo;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  recents?: RecentProject[];
  currentRoot?: string;
  onSelectProject?: (root: string) => void;
  onOpenOther?: () => void;
}

/**
 * Slim application header: brand mark, a recent-projects switcher (one project =
 * one repo = one sara), branch, and theme toggle.
 */
export function TitleBar({
  workspace,
  theme,
  onToggleTheme,
  recents = [],
  currentRoot,
  onSelectProject,
  onOpenOther,
}: TitleBarProps) {
  const others = recents.filter((r) => r.root !== currentRoot);

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

      <DropdownMenu
        align="start"
        triggerClassName="group flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent"
        trigger={
          <>
            <FolderGit2 className="size-3.5 text-muted-fg" aria-hidden />
            <span className="truncate font-medium text-fg">{workspace.name}</span>
            <span className="inline-flex items-center gap-1 text-muted-fg">
              <GitBranch className="size-3" aria-hidden />
              {workspace.branch.name}
            </span>
            <ChevronDown className="size-3 text-subtle-fg" aria-hidden />
          </>
        }
      >
        {(close) => (
          <>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-subtle-fg">
              Recent projects
            </div>
            {others.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-subtle-fg">No other recent projects</div>
            )}
            {others.map((r) => (
              <DropdownItem
                key={r.root}
                icon={FolderGit2}
                onClick={() => {
                  onSelectProject?.(r.root);
                  close();
                }}
                trailing={
                  r.missing ? (
                    <span className="text-[10px] text-danger">missing</span>
                  ) : undefined
                }
              >
                <span className="text-fg">{r.name}</span>
                <span className={cn("ml-1.5 text-[10px] text-subtle-fg")}>{r.root}</span>
              </DropdownItem>
            ))}
            <DropdownSeparator />
            <DropdownItem
              icon={Check}
              active
              onClick={close}
              trailing={<span className="text-[10px] text-subtle-fg">current</span>}
            >
              <span className="text-fg">{workspace.name}</span>
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              icon={FolderPlus}
              onClick={() => {
                onOpenOther?.();
                close();
              }}
            >
              Open other folder…
            </DropdownItem>
          </>
        )}
      </DropdownMenu>

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
