import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DocumentView } from "./DocumentView";
import { ItemEditor } from "@/components/editor/ItemEditor";

const meta = {
  title: "Document/DocumentView",
  component: DocumentView,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DocumentView>;

export default meta;
type Story = StoryObj;

export const ObjectList: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>("SYSREQ-002");
    return (
      <div className="h-screen bg-background">
        <DocumentView selectedId={selected} onSelect={setSelected} />
      </div>
    );
  },
};

export const WithInlineEditor: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>("SYSARCH-001");
    return (
      <div className="h-screen bg-background">
        <DocumentView
          selectedId={selected}
          onSelect={setSelected}
          renderEditor={(item) =>
            item.id === selected ? <ItemEditor itemId={item.id} /> : null
          }
        />
      </div>
    );
  },
};

export const Filtered: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <div className="h-screen bg-background">
        <DocumentView selectedId={selected} onSelect={setSelected} filter="SWREQ" />
      </div>
    );
  },
};
