import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge, ItemTypeBadge } from "./Badge";
import { builtinSchema } from "@/fixtures/schema";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>neutral</Badge>
      <Badge tone="primary">primary</Badge>
      <Badge tone="success">accepted</Badge>
      <Badge tone="warning">draft</Badge>
      <Badge tone="danger">error</Badge>
      <Badge tone="info">info</Badge>
    </div>
  ),
};

export const AllItemTypes: Story = {
  render: () => (
    <div className="grid max-w-md grid-cols-2 gap-2">
      {builtinSchema.itemTypes.map((t) => (
        <ItemTypeBadge key={t.id} typeId={t.id} displayName={t.displayName} />
      ))}
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-2">
      {builtinSchema.itemTypes.map((t) => (
        <ItemTypeBadge key={t.id} typeId={t.id} displayName={t.displayName} iconOnly />
      ))}
    </div>
  ),
};
