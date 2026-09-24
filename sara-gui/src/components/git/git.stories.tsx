import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SourceControlPanel } from "./SourceControlPanel";
import { DiffView } from "./DiffView";
import { FileHistory } from "./FileHistory";
import { sampleDiff } from "@/fixtures/smart-home";
import { Panel } from "@/stories/withStore";

const meta = { title: "Git/Source Control" } satisfies Meta;
export default meta;
type Story = StoryObj;

export const SourceControl: Story = {
  render: () => {
    const [sel, setSel] = useState<string | null>("system_requirements/SYSREQ-LATENCY.md");
    return (
      <Panel width={340} height={560}>
        <SourceControlPanel selectedPath={sel} onSelectFile={setSel} />
      </Panel>
    );
  },
};

export const Diff: Story = {
  render: () => (
    <Panel width={720} height={400}>
      <DiffView diff={sampleDiff} />
    </Panel>
  ),
};

export const History: Story = {
  render: () => (
    <Panel width={360} height={400}>
      <FileHistory path="system_requirements/SYSREQ-LATENCY.md" />
    </Panel>
  ),
};
