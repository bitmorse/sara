import type { Meta, StoryObj } from "@storybook/react-vite";
import { GitCommitHorizontal, Plus } from "lucide-react";

import { Button } from "./Button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: { children: "Button" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" icon={GitCommitHorizontal}>Commit</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost" icon={Plus}>New</Button>
      <Button variant="danger">Delete</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button variant="primary">Enabled</Button>
      <Button variant="primary" disabled>Disabled</Button>
      <Button variant="primary" loading>Loading</Button>
      <Button size="sm" variant="secondary">Small</Button>
    </div>
  ),
};
