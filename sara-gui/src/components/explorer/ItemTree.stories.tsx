import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ItemTree } from "./ItemTree";
import { buildTree } from "@/lib/ipc/mock";
import { items } from "@/fixtures/smart-home";
import { Panel } from "@/stories/withStore";

const tree = buildTree(items);

const meta = {
  title: "Explorer/ItemTree",
  component: ItemTree,
} satisfies Meta<typeof ItemTree>;

export default meta;
type Story = StoryObj;

export const Outline: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>("SYSREQ-001");
    return (
      <Panel width={340}>
        <ItemTree nodes={tree} selectedId={selected} onSelect={setSelected} />
      </Panel>
    );
  },
};
