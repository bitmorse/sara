import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search, ListTree, FolderGit2, GitPullRequestArrow } from "lucide-react";

import { Input } from "./Input";
import { Tabs } from "./Tabs";
import { Tooltip } from "./Tooltip";
import { Kbd } from "./Kbd";
import { SplitPane } from "./SplitPane";
import { IconButton } from "./IconButton";
import { EmptyState, LoadingState, Spinner } from "./feedback";
import { FileQuestion } from "lucide-react";

const meta = { title: "Primitives/Controls" } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Inputs: Story = {
  parameters: { layout: "centered" },
  render: () => (
    <div className="w-72 space-y-3">
      <Input placeholder="Plain input" />
      <Input leading={<Search className="size-3.5" />} placeholder="With icon" />
      <Input disabled placeholder="Disabled" />
    </div>
  ),
};

export const TabStrips: Story = {
  parameters: { layout: "centered" },
  render: () => {
    const [seg, setSeg] = useState("outline");
    const [und, setUnd] = useState("outline");
    return (
      <div className="w-96 space-y-6">
        <Tabs
          variant="segmented"
          value={seg}
          onChange={setSeg}
          tabs={[
            { id: "outline", label: "Outline", icon: ListTree },
            { id: "files", label: "Files", icon: FolderGit2 },
            { id: "changes", label: "Changes", icon: GitPullRequestArrow, count: 4 },
          ]}
        />
        <Tabs
          variant="underline"
          value={und}
          onChange={setUnd}
          tabs={[
            { id: "outline", label: "Outline", icon: ListTree },
            { id: "files", label: "Files", icon: FolderGit2 },
          ]}
        />
      </div>
    );
  },
};

export const TooltipsAndKbd: Story = {
  parameters: { layout: "centered" },
  render: () => (
    <div className="flex items-center gap-6">
      <Tooltip content="Toggle theme">
        <IconButton icon={Search} label="Search" />
      </Tooltip>
      <Kbd keys={["⌘", "K"]} />
      <Kbd keys={["⌘", "⇧", "P"]} />
    </div>
  ),
};

export const Feedback: Story = {
  parameters: { layout: "centered" },
  render: () => (
    <div className="flex items-start gap-6">
      <Spinner />
      <div className="h-40 w-56 rounded-md border border-border">
        <LoadingState />
      </div>
      <div className="h-40 w-64 rounded-md border border-border">
        <EmptyState icon={FileQuestion} title="Nothing here" description="Select an item to begin." />
      </div>
    </div>
  ),
};

export const ResizableSplit: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="h-80">
      <SplitPane
        first={<div className="flex h-full items-center justify-center bg-surface text-xs text-muted-fg">Drag the divider →</div>}
        second={<div className="flex h-full items-center justify-center bg-background text-xs text-muted-fg">Second pane</div>}
      />
    </div>
  ),
};
