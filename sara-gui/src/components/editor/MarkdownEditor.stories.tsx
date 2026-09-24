import type { Meta, StoryObj } from "@storybook/react-vite";

import { MarkdownEditor } from "./MarkdownEditor";
import { bodies } from "@/fixtures/smart-home";

const meta = {
  title: "Editor/MarkdownEditor",
  component: MarkdownEditor,
  parameters: { layout: "padded" },
} satisfies Meta<typeof MarkdownEditor>;

export default meta;
type Story = StoryObj;

export const Editing: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl">
      <MarkdownEditor itemId="SOL-001" value={bodies["SOL-001"].body} />
    </div>
  ),
};

export const WithMermaid: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl">
      <MarkdownEditor itemId="SYSARCH-001" value={bodies["SYSARCH-001"].body} />
    </div>
  ),
};
