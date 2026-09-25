import type { Meta, StoryObj } from "@storybook/react-vite";

import { MarkdownView } from "./MarkdownView";

const SAMPLE = `# Communication Architecture

Timely delivery with **local processing** for sub-500ms latency.

## Components

- MQTT broker on the hub
- Zigbee mesh for device-to-hub
- Cloud gateway for remote access

\`\`\`ts
const client = connect({ qos: 1 });
\`\`\`

![overview](assets/overview.png)

\`\`\`mermaid
sequenceDiagram
    participant App
    participant Hub
    App->>Hub: command
    Hub->>App: ack
\`\`\`

| Tier | Devices |
|------|---------|
| Starter | 20 |
| Premium | ∞ |
`;

const meta = {
  title: "Markdown/MarkdownView",
  component: MarkdownView,
  parameters: { layout: "padded" },
} satisfies Meta<typeof MarkdownView>;

export default meta;
type Story = StoryObj;

export const Rendered: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl">
      <MarkdownView itemId="SYSARCH-001" markdown={SAMPLE} />
    </div>
  ),
};
