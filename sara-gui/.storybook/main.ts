import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  // The Vite builder reuses ../vite.config.ts, so the Tailwind v4 and React
  // plugins apply automatically — no duplicate config needed here.
};

export default config;
