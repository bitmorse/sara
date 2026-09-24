import type { Meta, StoryObj } from "@storybook/react-vite";

import { ValidationPanel } from "./validation/ValidationPanel";
import { CoverageReportView } from "./reports/CoverageReportView";
import { TraceabilityGraph } from "./traceability/TraceabilityGraph";
import { Panel } from "@/stories/withStore";

const meta = { title: "Panels/Analysis" } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Validation: Story = {
  render: () => (
    <Panel width={520} height={360}>
      <ValidationPanel />
    </Panel>
  ),
};

export const Coverage: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="h-screen overflow-auto bg-background">
      <CoverageReportView />
    </div>
  ),
};

export const Traceability: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="h-screen bg-background">
      <TraceabilityGraph itemId="SYSARCH-001" />
    </div>
  ),
};
