import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProjectGate } from "./ProjectGate";

const meta = {
  title: "Project/ProjectGate",
  component: ProjectGate,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ProjectGate>;

export default meta;
type Story = StoryObj;

/** Auto-opens the most-recent project (from the mock) into the full workbench. */
export const AutoOpensLast: Story = { render: () => <ProjectGate /> };
