import type { Meta, StoryObj } from "@storybook/react-vite";

import { TitleBar } from "./TitleBar";
import type { RecentProject, WorkspaceInfo } from "@/types/domain";

const workspace: WorkspaceInfo = {
  root: "/Users/you/projects/smart-home",
  name: "smart-home",
  branch: { name: "main", ahead: 2, behind: 0, detached: false },
};

const recents: RecentProject[] = [
  { root: "/Users/you/projects/smart-home", name: "smart-home", lastOpenedAt: "2026-09-24T11:00:00Z", missing: false },
  { root: "/Users/you/projects/robot-arm", name: "robot-arm", lastOpenedAt: "2026-09-20T09:30:00Z", missing: false },
  { root: "/Users/you/projects/legacy-specs", name: "legacy-specs", lastOpenedAt: "2026-08-02T14:12:00Z", missing: true },
];

const meta = {
  title: "Shell/TitleBar",
  component: TitleBar,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TitleBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRecents: Story = {
  args: {
    workspace,
    theme: "light",
    recents,
    currentRoot: workspace.root,
    onToggleTheme: () => {},
    onSelectProject: () => {},
    onOpenOther: () => {},
  },
};
