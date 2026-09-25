import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown, FolderGit2, FolderPlus, Check } from "lucide-react";

import { DropdownMenu, DropdownItem, DropdownSeparator } from "./DropdownMenu";

const meta = { title: "Primitives/DropdownMenu", parameters: { layout: "centered" } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const ProjectSwitcher: Story = {
  render: () => (
    <DropdownMenu
      triggerClassName="flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
      trigger={
        <>
          <FolderGit2 className="size-3.5 text-muted-fg" /> smart-home
          <ChevronDown className="size-3 text-subtle-fg" />
        </>
      }
    >
      {(close) => (
        <>
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-subtle-fg">
            Recent projects
          </div>
          <DropdownItem icon={FolderGit2} onClick={close}>
            robot-arm
          </DropdownItem>
          <DropdownItem icon={FolderGit2} onClick={close} trailing={<span className="text-[10px] text-danger">missing</span>}>
            legacy-specs
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={Check} active onClick={close} trailing={<span className="text-[10px] text-subtle-fg">current</span>}>
            smart-home
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={FolderPlus} onClick={close}>
            Open other folder…
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  ),
};
