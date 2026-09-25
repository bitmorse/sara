/**
 * Domain DTOs shared across the frontend.
 *
 * These are the GUI-side view models — the shape the Tauri backend returns over
 * IPC (and the mock adapter mimics). They intentionally differ from sara-core's
 * raw serde: types are addressed by their snake_case schema id and paired with a
 * schema-provided `displayName`, values are normalized to strings/arrays, and
 * relationships carry their resolved direction. In the backend milestone these
 * are generated from the Rust DTOs via `ts-rs`; until then they are the contract.
 */

/** Snake_case schema id of an item type, e.g. `"system_requirement"`. */
export type ItemTypeId = string;

/** Snake_case id of a relation, e.g. `"derives_from"`. */
export type RelationId = string;

export type FieldTypeKind = "text" | "enum" | "item_ref" | "list" | "date";
export type RelationDirection = "upstream" | "downstream" | "peer";
export type Severity = "error" | "warning";

/* -------------------------------------------------------------------------- */
/* Schema                                                                     */
/* -------------------------------------------------------------------------- */

export interface FieldDef {
  name: string;
  displayName: string;
  fieldType: FieldTypeKind;
  /** Inner kind when `fieldType === "list"`. */
  inner?: FieldTypeKind;
  /** Allowed values when `fieldType === "enum"`. */
  enumValues?: string[];
  required: boolean;
  placeholder?: string;
}

export interface AllowedTarget {
  relation: RelationId;
  targets: ItemTypeId[];
}

export interface ItemTypeDef {
  id: ItemTypeId;
  displayName: string;
  prefix: string;
  idFormat: string;
  parentTypes: ItemTypeId[];
  fields: FieldDef[];
  allowedTargets: AllowedTarget[];
}

export interface RelationDef {
  id: RelationId;
  displayName: string;
  inverse: RelationId;
  direction: RelationDirection;
  primary: boolean;
}

export interface Schema {
  itemTypes: ItemTypeDef[];
  relations: RelationDef[];
}

/* -------------------------------------------------------------------------- */
/* Items                                                                      */
/* -------------------------------------------------------------------------- */

export interface AttributeValue {
  name: string;
  displayName: string;
  fieldType: FieldTypeKind;
  /** Rendered value; a list field yields `string[]`. */
  value: string | string[];
}

export interface Relationship {
  relation: RelationId;
  targetId: string;
  direction: RelationDirection;
}

export interface ItemSummary {
  id: string;
  type: ItemTypeId;
  name: string;
  /** Repo-relative path of the markdown file. */
  filePath: string;
}

export interface ItemDetail extends ItemSummary {
  description?: string;
  attributes: AttributeValue[];
  relationships: Relationship[];
  /** Absolute repository root the item belongs to. */
  repository: string;
}

/** Frontmatter (owned by core) and body (edited by MDXEditor) split apart. */
export interface ItemContent {
  frontmatter: string;
  body: string;
}

/* -------------------------------------------------------------------------- */
/* Traversal / graph                                                          */
/* -------------------------------------------------------------------------- */

export interface TraversalNode {
  id: string;
  name: string;
  type: ItemTypeId;
  depth: number;
  parentId?: string;
  relation?: RelationId;
}

export interface TraversalResult {
  originId: string;
  direction: RelationDirection;
  nodes: TraversalNode[];
  maxDepth: number;
}

/** A node in the Explorer's traceability outline (DOORS-style numbering). */
export interface TreeNode {
  item: ItemSummary;
  /** Outline number, e.g. `"1.1.2"`. */
  outline: string;
  children: TreeNode[];
}

/* -------------------------------------------------------------------------- */
/* Validation & reports                                                       */
/* -------------------------------------------------------------------------- */

export interface ValidationIssue {
  severity: Severity;
  /** Rule that fired, e.g. `"broken-reference"`, `"circular-dependency"`. */
  rule: string;
  message: string;
  itemId?: string;
}

export interface ValidationReport {
  valid: boolean;
  itemsChecked: number;
  relationshipsChecked: number;
  itemsByType: Record<ItemTypeId, number>;
  issues: ValidationIssue[];
}

export interface TypeCoverage {
  type: ItemTypeId;
  total: number;
  complete: number;
  /** Percentage, 0–100. */
  coveragePercent: number;
}

export interface CoverageReport {
  /** Percentage, 0–100 (matches sara-core; do not multiply by 100). */
  overallCoverage: number;
  totalItems: number;
  completeItems: number;
  byType: TypeCoverage[];
}

/* -------------------------------------------------------------------------- */
/* Git / versioning                                                           */
/* -------------------------------------------------------------------------- */

export type FileChangeKind =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "untracked"
  | "conflicted";

export interface FileStatus {
  path: string;
  staged: boolean;
  kind: FileChangeKind;
}

export interface CommitInfo {
  sha: string;
  shortSha: string;
  author: string;
  email: string;
  /** ISO-8601 timestamp. */
  date: string;
  summary: string;
}

export interface BranchInfo {
  name: string;
  ahead: number;
  behind: number;
  detached: boolean;
}

export type DiffLineKind = "context" | "add" | "remove" | "hunk" | "meta";

export interface DiffLine {
  kind: DiffLineKind;
  oldNo?: number;
  newNo?: number;
  text: string;
}

export interface FileDiff {
  path: string;
  binary: boolean;
  lines: DiffLine[];
}

/** Identity of one side of a diff. */
export type GitTarget =
  | { kind: "working" }
  | { kind: "index" }
  | { kind: "ref"; ref: string };

/* -------------------------------------------------------------------------- */
/* Workspace                                                                  */
/* -------------------------------------------------------------------------- */

export interface WorkspaceInfo {
  /** Absolute repo root (one project = one repo = one sara). */
  root: string;
  name: string;
  branch: BranchInfo;
}

export interface LoadGraphResult {
  items: ItemDetail[];
  warnings: string[];
}

export interface RecentProject {
  root: string;
  name: string;
  /** ISO-8601 timestamp of the last open. */
  lastOpenedAt: string;
  /** True when the path no longer exists on disk. */
  missing: boolean;
}
