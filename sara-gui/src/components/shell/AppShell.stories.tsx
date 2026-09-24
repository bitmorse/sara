import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./AppShell";
import { Explorer } from "@/components/explorer/Explorer";
import { RightPanel } from "./RightPanel";
import { withStore, Panel } from "@/stories/withStore";

const meta = {
  title: "Shell/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full workbench with a requirement selected (inspector view). */
export const Workbench: Story = {
  decorators: [withStore({ selectedItemId: "SYSREQ-002", mainView: "document", rightPanel: "inspector" })],
};

/** Traceability graph as the main view. */
export const TraceabilityView: Story = {
  decorators: [withStore({ selectedItemId: "SYSARCH-001", mainView: "traceability" })],
};

/** Reports view. */
export const Reports: Story = {
  decorators: [withStore({ selectedItemId: null, mainView: "reports" })],
};

/** Source-control tab open, history panel on the right. */
export const CommittingChanges: Story = {
  decorators: [
    withStore({ selectedItemId: "SYSREQ-001", leftTab: "source-control", rightPanel: "history" }),
  ],
};

/** The two dockable side panels in isolation. */
export const SidePanels: StoryObj = {
  parameters: { layout: "centered" },
  decorators: [withStore({ selectedItemId: "SYSREQ-002", rightPanel: "inspector" })],
  render: () => (
    <div className="flex gap-4">
      <Panel width={300} height={560}>
        <Explorer />
      </Panel>
      <Panel width={340} height={560}>
        <RightPanel />
      </Panel>
    </div>
  ),
};
