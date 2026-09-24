import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { QueryClientProvider } from "@tanstack/react-query";

import "../src/styles/globals.css";
import { createQueryClient } from "../src/lib/query/client";
import { MockIpcProvider } from "../src/lib/ipc/context";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "todo" },
    backgrounds: { disable: true }, // theme addon owns the background
  },
  decorators: [
    // Innermost: give every story an IPC client + a query cache.
    (Story) => {
      const client = createQueryClient();
      return (
        <QueryClientProvider client={client}>
          <MockIpcProvider>
            <div className="min-h-screen bg-background text-fg">
              <Story />
            </div>
          </MockIpcProvider>
        </QueryClientProvider>
      );
    },
    // Outermost: light/dark class toggle (matches the `.dark` custom variant).
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
