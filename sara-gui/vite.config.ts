import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/ — tuned for a Tauri v2 front end.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Tauri expects a fixed dev port and pipes our logs through its own console.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // src-tauri is the Rust side; don't let Vite churn on Rust artifacts.
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    target: "es2022",
    // Produce readable stack traces in dev builds of the desktop app.
    sourcemap: process.env.TAURI_ENV_DEBUG === "true",
  },
});
