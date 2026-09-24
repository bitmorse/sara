/**
 * Real IpcClient backed by Tauri `invoke`. The ONLY module that imports
 * `@tauri-apps/api`; everything else goes through the contract, so Storybook
 * and tests never pull the Tauri runtime into their bundle.
 *
 * Command names are the snake_case Rust `#[tauri::command]` identifiers.
 */

import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";

import type { IpcClient, TraverseOptions, CommitRequest } from "./contract";
import type {
  CommitInfo,
  CoverageReport,
  FileDiff,
  FileStatus,
  GitTarget,
  ItemContent,
  ItemDetail,
  LoadGraphResult,
  Schema,
  TraversalResult,
  TreeNode,
  ValidationReport,
  WorkspaceInfo,
} from "@/types/domain";

export const tauriIpc: IpcClient = {
  getSchema: () => invoke<Schema>("get_schema"),
  openWorkspace: (root) => invoke<WorkspaceInfo>("open_workspace", { root }),
  loadGraph: (paths) => invoke<LoadGraphResult>("load_graph", { paths }),

  listItems: () => invoke<ItemDetail[]>("list_items"),
  getItem: (id) => invoke<ItemDetail>("get_item", { id }),
  getItemContent: (id) => invoke<ItemContent>("get_item_content", { id }),
  saveItemBody: (id, body) => invoke<void>("save_item_body", { id, body }),
  savePastedAsset: (itemId, fileName, bytes) =>
    invoke<string>("save_pasted_asset", { itemId, fileName, bytes: Array.from(bytes) }),

  buildTree: () => invoke<TreeNode[]>("build_tree"),
  traverse: (id, opts: TraverseOptions) => invoke<TraversalResult>("traverse", { id, opts }),
  mermaid: (id, opts: TraverseOptions) => invoke<string>("mermaid", { id, opts }),

  validate: (strict) => invoke<ValidationReport>("validate", { strict }),
  coverageReport: () => invoke<CoverageReport>("coverage_report"),

  gitStatus: () => invoke<FileStatus[]>("git_status"),
  gitFileHistory: (path) => invoke<CommitInfo[]>("git_file_history", { path }),
  gitDiffFile: (path, from: GitTarget, to: GitTarget) =>
    invoke<FileDiff>("git_diff_file", { path, from, to }),
  gitStage: (paths) => invoke<void>("git_stage", { paths }),
  gitUnstage: (paths) => invoke<void>("git_unstage", { paths }),
  gitCommit: (req: CommitRequest) => invoke<CommitInfo>("git_commit", { req }),

  // The absolute path is resolved server-side; here we only convert it to an
  // asset:// URL the webview can load (CSP allows asset:/http://asset.localhost).
  resolveAssetUrl: async (itemId, relPath) => {
    const abs = await invoke<string>("resolve_asset_path", { itemId, relPath });
    return convertFileSrc(abs);
  },
};
