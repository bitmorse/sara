/**
 * The IPC contract — the single typed surface every component talks to.
 *
 * This is the adapter seam: the real implementation (`tauri.ts`) forwards to
 * Rust `invoke`, the mock (`mock.ts`) resolves fixtures. Components consume it
 * through `useIpc()` and never import `@tauri-apps/api` directly, so every
 * Tauri-backed component renders in Storybook and unit tests.
 */

import type {
  CommitInfo,
  CoverageReport,
  FileDiff,
  FileStatus,
  GitTarget,
  ItemContent,
  ItemDetail,
  LoadGraphResult,
  RecentProject,
  Schema,
  TraversalResult,
  TreeNode,
  ValidationReport,
  WorkspaceInfo,
  RelationDirection,
  ItemTypeId,
} from "@/types/domain";

export interface TraverseOptions {
  direction: RelationDirection;
  maxDepth?: number;
  types?: ItemTypeId[];
}

export interface CommitRequest {
  message: string;
  amend?: boolean;
}

export interface IpcClient {
  /* Schema & workspace ------------------------------------------------------ */
  getSchema(): Promise<Schema>;
  openWorkspace(root: string): Promise<WorkspaceInfo>;
  loadGraph(paths: string[]): Promise<LoadGraphResult>;

  /* Items ------------------------------------------------------------------- */
  listItems(): Promise<ItemDetail[]>;
  getItem(id: string): Promise<ItemDetail>;
  /** Frontmatter + body split, for the read renderer. */
  getItemContent(id: string): Promise<ItemContent>;
  /** The entire markdown file (frontmatter + body), for full-file editing. */
  getItemRaw(id: string): Promise<string>;
  /** Persist the entire markdown file verbatim. */
  saveItemRaw(id: string, content: string): Promise<void>;
  /** Write a pasted/dropped asset into the repo; returns the relative path. */
  savePastedAsset(itemId: string, fileName: string, bytes: Uint8Array): Promise<string>;

  /* Traceability ------------------------------------------------------------ */
  buildTree(): Promise<TreeNode[]>;
  traverse(id: string, opts: TraverseOptions): Promise<TraversalResult>;
  /** Raw Mermaid flowchart source for a traversal. */
  mermaid(id: string, opts: TraverseOptions): Promise<string>;

  /* Validation & reports ---------------------------------------------------- */
  validate(strict: boolean): Promise<ValidationReport>;
  coverageReport(): Promise<CoverageReport>;

  /* Git --------------------------------------------------------------------- */
  gitStatus(): Promise<FileStatus[]>;
  gitFileHistory(path: string): Promise<CommitInfo[]>;
  gitDiffFile(path: string, from: GitTarget, to: GitTarget): Promise<FileDiff>;
  gitStage(paths: string[]): Promise<void>;
  gitUnstage(paths: string[]): Promise<void>;
  gitCommit(req: CommitRequest): Promise<CommitInfo>;

  /* Assets ------------------------------------------------------------------ */
  /** Resolve a repo-relative media path to a URL the webview can load. */
  resolveAssetUrl(itemId: string, relPath: string): Promise<string>;

  /* Recent projects --------------------------------------------------------- */
  listRecentProjects(): Promise<RecentProject[]>;
  /** Records `root` as most-recent; returns the updated list. */
  rememberProject(root: string): Promise<RecentProject[]>;
  forgetProject(root: string): Promise<RecentProject[]>;
}
