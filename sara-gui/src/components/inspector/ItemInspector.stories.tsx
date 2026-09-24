import type { Meta, StoryObj } from "@storybook/react-vite";

import { ItemInspector } from "./ItemInspector";
import { TraceabilityPanel } from "./TraceabilityPanel";
import { Panel } from "@/stories/withStore";

const meta = {
  title: "Inspector/ItemInspector",
  component: ItemInspector,
} satisfies Meta<typeof ItemInspector>;

export default meta;
type Story = StoryObj;

export const Requirement: Story = {
  render: () => (
    <Panel width={340} height={640}>
      <ItemInspector itemId="SYSREQ-002" extra={(item) => <TraceabilityPanel itemId={item.id} />} />
    </Panel>
  ),
};

export const DecisionRecord: Story = {
  render: () => (
    <Panel width={340} height={640}>
      <ItemInspector itemId="ADR-001" extra={(item) => <TraceabilityPanel itemId={item.id} />} />
    </Panel>
  ),
};

export const Empty: Story = {
  render: () => (
    <Panel width={340}>
      <ItemInspector itemId={null} />
    </Panel>
  ),
};
