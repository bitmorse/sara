# sara-gui

A cross-platform desktop GUI for [SARA](../README.md) — a git-native, Markdown-first
editor for requirements & architecture knowledge graphs. Think IBM DOORS
(outline tree · object list · attribute columns) but built on plain Markdown and
versioned with git.

> **Information architecture:** one project = one git repository = one sara. All
> versioning is git; every file shows its history; changes are committed through
> a VS Code-style Source Control panel.

## Stack

- **Tauri v2** shell — the Rust backend (`src-tauri/`) links `sara-core` directly.
- **React 19 + TypeScript + Vite 7**, **Tailwind CSS v4** (config-less `@theme`
  tokens), **Storybook 9**.
- **MDXEditor** for markdown editing (body-only; frontmatter stays owned by core).
- **Lucide** icons, **TanStack** Query / Router / Table / Virtual.
- Design tokens follow the octanis design-system three-layer model
  (primitive → semantic → component) in `src/styles/globals.css`.

## Layout

```
src/
  components/       UI primitives (ui/) + composite panels (shell, explorer,
                    document, inspector, git, validation, reports, editor,
                    traceability), each with a co-located *.stories.tsx
  lib/ipc/          The adapter seam: contract.ts (typed IPC surface),
                    tauri.ts (real invoke), mock.ts (fixture-backed),
                    context.tsx (useIpc DI). Components never import
                    @tauri-apps/api directly, so every one renders in Storybook.
  lib/query/        TanStack Query client + hooks
  fixtures/         smart-home graph + schema as GUI DTOs (Storybook/tests)
  store/ui.ts       light client-only UI state (zustand)
  styles/globals.css design tokens (light/dark) + MDXEditor theming
  types/domain.ts   GUI DTOs (later generated from Rust via ts-rs)
src-tauri/          standalone Cargo crate `sara-gui` (excluded from the root
                    workspace); commands + git2 write layer live here
```

## Develop

```bash
npm install
npm run storybook     # component workbench (mock data, light + dark)
npm run dev           # Vite dev server (needs the Tauri shell for live data)
npm run tauri dev     # full desktop app against a real repo
npm run build         # type-check + web bundle
npm run typecheck
```

The Rust crate is a **standalone Cargo workspace** (`exclude`d from the root
workspace) so the core CI matrix and release-plz are unaffected. It is verified
separately by `.github/workflows/gui.yml`.
