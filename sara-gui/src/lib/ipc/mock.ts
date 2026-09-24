/**
 * Fixture-backed IpcClient for Storybook and unit tests. Pure, synchronous data
 * wrapped in resolved promises (with an optional latency for loading states).
 */

import type { IpcClient, TraverseOptions } from "./contract";
import type {
  ItemContent,
  ItemDetail,
  TraversalNode,
  TraversalResult,
  TreeNode,
} from "@/types/domain";
import { builtinSchema } from "@/fixtures/schema";
import * as sh from "@/fixtures/smart-home";

/** Upstream (toward the root) hierarchy relations that form the outline tree. */
const HIERARCHY_UP = new Set(["refines", "derives_from", "satisfies"]);

const TYPE_ORDER = builtinSchema.itemTypes.map((t) => t.id);
const typeRank = (t: string) => {
  const i = TYPE_ORDER.indexOf(t);
  return i === -1 ? TYPE_ORDER.length : i;
};

function hierarchyParent(item: ItemDetail): string | undefined {
  return item.relationships.find(
    (r) => r.direction === "upstream" && HIERARCHY_UP.has(r.relation),
  )?.targetId;
}

/** Builds the DOORS-style numbered outline from the items' upstream links. */
export function buildTree(items: ItemDetail[]): TreeNode[] {
  const byParent = new Map<string | undefined, ItemDetail[]>();
  for (const item of items) {
    const p = hierarchyParent(item);
    const bucket = byParent.get(p) ?? [];
    bucket.push(item);
    byParent.set(p, bucket);
  }

  const sortItems = (a: ItemDetail, b: ItemDetail) =>
    typeRank(a.type) - typeRank(b.type) || a.id.localeCompare(b.id);

  const build = (parentId: string | undefined, prefix: string): TreeNode[] =>
    (byParent.get(parentId) ?? []).sort(sortItems).map((item, i) => {
      const outline = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
      return {
        item: { id: item.id, type: item.type, name: item.name, filePath: item.filePath },
        outline,
        children: build(item.id, outline),
      };
    });

  return build(undefined, "");
}

/** Directed traversal used by the traceability panel and the Mermaid export. */
function traverseGraph(items: ItemDetail[], originId: string, opts: TraverseOptions): TraversalResult {
  const byId = new Map(items.map((it) => [it.id, it]));
  const wantUp = opts.direction === "upstream";
  const maxDepth = opts.maxDepth ?? Infinity;
  const typeFilter = opts.types?.length ? new Set(opts.types) : undefined;

  // Adjacency in the requested direction.
  const edges = new Map<string, Array<{ to: string; relation: string }>>();
  for (const it of items) {
    for (const rel of it.relationships) {
      const isUp = rel.direction === "upstream";
      if (wantUp && isUp) {
        edges.set(it.id, [...(edges.get(it.id) ?? []), { to: rel.targetId, relation: rel.relation }]);
      } else if (!wantUp && isUp) {
        // downstream = reverse of upstream edges
        edges.set(rel.targetId, [...(edges.get(rel.targetId) ?? []), { to: it.id, relation: rel.relation }]);
      }
    }
  }

  const nodes: TraversalNode[] = [];
  const seen = new Set<string>([originId]);
  let frontier: Array<{ id: string; depth: number; parent?: string; relation?: string }> = [
    { id: originId, depth: 0 },
  ];

  while (frontier.length) {
    const next: typeof frontier = [];
    for (const cur of frontier) {
      const item = byId.get(cur.id);
      if (item && (cur.depth === 0 || !typeFilter || typeFilter.has(item.type))) {
        nodes.push({
          id: cur.id,
          name: item?.name ?? cur.id,
          type: item?.type ?? "unknown",
          depth: cur.depth,
          parentId: cur.parent,
          relation: cur.relation,
        });
      }
      if (cur.depth >= maxDepth) continue;
      for (const edge of edges.get(cur.id) ?? []) {
        if (seen.has(edge.to)) continue;
        seen.add(edge.to);
        next.push({ id: edge.to, depth: cur.depth + 1, parent: cur.id, relation: edge.relation });
      }
    }
    frontier = next;
  }

  return { originId, direction: opts.direction, nodes, maxDepth: opts.maxDepth ?? nodes.reduce((m, n) => Math.max(m, n.depth), 0) };
}

function toMermaid(result: TraversalResult): string {
  const lines = ["flowchart BT"];
  for (const n of result.nodes) lines.push(`    ${n.id}["${n.id}<br>${n.name}"]`);
  for (const n of result.nodes) {
    if (n.parentId && n.relation) lines.push(`    ${n.id} -->|${n.relation}| ${n.parentId}`);
  }
  lines.push(`    class ${result.originId} origin`);
  const byType = new Map<string, string[]>();
  for (const n of result.nodes) byType.set(n.type, [...(byType.get(n.type) ?? []), n.id]);
  for (const [type, ids] of byType) lines.push(`    class ${ids.join(",")} ${type}`);
  return lines.join("\n");
}

/** A tiny inline SVG stand-in so image previews render without a real file. */
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#c7d2fe"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#3730a3" text-anchor="middle" dominant-baseline="middle">sample image</text></svg>`,
  );

export interface MockOptions {
  /** Artificial latency (ms) to exercise loading states. */
  latencyMs?: number;
  /** Override the item set (e.g. empty state, large set). */
  items?: ItemDetail[];
}

export function createMockIpc(options: MockOptions = {}): IpcClient {
  const data = options.items ?? sh.items;
  const delay = <T>(value: T): Promise<T> =>
    options.latencyMs
      ? new Promise((r) => setTimeout(() => r(value), options.latencyMs))
      : Promise.resolve(value);

  const genericBody = (item: ItemDetail): ItemContent => ({
    frontmatter: [`id: "${item.id}"`, `type: ${item.type}`, `name: "${item.name}"`].join("\n"),
    body: `# ${item.name}\n\n${item.description ?? "_No description yet._"}\n`,
  });

  return {
    getSchema: () => delay(builtinSchema),
    openWorkspace: (root) =>
      delay({ root, name: root.split("/").pop() ?? "project", branch: sh.branch }),
    loadGraph: () => delay({ items: data, warnings: [] }),

    listItems: () => delay(data),
    getItem: (id) => {
      const item = data.find((i) => i.id === id);
      return item ? delay(item) : Promise.reject(new Error(`Item ${id} not found`));
    },
    getItemContent: (id) => {
      const item = data.find((i) => i.id === id);
      if (!item) return Promise.reject(new Error(`Item ${id} not found`));
      return delay(sh.bodies[id] ?? genericBody(item));
    },
    saveItemBody: () => delay(undefined),
    savePastedAsset: (_itemId, fileName) => delay(`assets/${fileName}`),

    buildTree: () => delay(buildTree(data)),
    traverse: (id, opts) => delay(traverseGraph(data, id, opts)),
    mermaid: (id, opts) => delay(toMermaid(traverseGraph(data, id, opts))),

    validate: () => delay(sh.validationReport),
    coverageReport: () => delay(sh.coverageReport),

    gitStatus: () => delay(sh.gitStatus),
    gitFileHistory: () => delay(sh.commits),
    gitDiffFile: () => delay(sh.sampleDiff),
    gitStage: () => delay(undefined),
    gitUnstage: () => delay(undefined),
    gitCommit: (req) =>
      delay({
        sha: "0000000000000000000000000000000000000000",
        shortSha: "0000000",
        author: "You",
        email: "you@example.com",
        date: new Date("2026-09-24T12:00:00Z").toISOString(),
        summary: req.message.split("\n")[0],
      }),

    resolveAssetUrl: () => delay(PLACEHOLDER_IMAGE),
  };
}

/** Default mock instance for stories that don't need custom options. */
export const mockIpc = createMockIpc();
