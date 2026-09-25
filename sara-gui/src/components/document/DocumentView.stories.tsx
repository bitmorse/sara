import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DocumentView } from "./DocumentView";

const meta = {
  title: "Document/DocumentView",
  component: DocumentView,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DocumentView>;

export default meta;
type Story = StoryObj;

/** Bodies render inline read-only; double-click a row to edit it in place. */
export const ReadingAndEditing: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>("SYSREQ-002");
    const [editingId, setEditingId] = useState<string | null>(null);
    return (
      <div className="h-screen bg-background">
        <DocumentView
          selectedId={selected}
          editingId={editingId}
          onSelect={(id) => {
            if (id !== selected) setEditingId(null);
            setSelected(id);
          }}
          onEdit={(id) => {
            setSelected(id);
            setEditingId(id);
          }}
          onDoneEdit={() => setEditingId(null)}
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
