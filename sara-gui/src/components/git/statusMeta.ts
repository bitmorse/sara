import type { FileChangeKind } from "@/types/domain";

/** Single-letter badge + color token per change kind (VS Code convention). */
export const CHANGE_META: Record<FileChangeKind, { letter: string; color: string; label: string }> = {
  modified: { letter: "M", color: "var(--warning)", label: "Modified" },
  added: { letter: "A", color: "var(--success)", label: "Added" },
  untracked: { letter: "U", color: "var(--success)", label: "Untracked" },
  deleted: { letter: "D", color: "var(--danger)", label: "Deleted" },
  renamed: { letter: "R", color: "var(--info)", label: "Renamed" },
  conflicted: { letter: "C", color: "var(--danger)", label: "Conflicted" },
};

/** Split a repo-relative path into directory + basename for display. */
export function splitPath(path: string): { dir: string; base: string } {
  const idx = path.lastIndexOf("/");
  return idx === -1
    ? { dir: "", base: path }
    : { dir: path.slice(0, idx), base: path.slice(idx + 1) };
}
