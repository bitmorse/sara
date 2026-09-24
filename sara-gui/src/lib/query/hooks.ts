/** TanStack Query hooks over the IPC seam. */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useIpc } from "@/lib/ipc/context";
import type { TraverseOptions } from "@/lib/ipc/contract";

export const qk = {
  schema: ["schema"] as const,
  items: ["items"] as const,
  item: (id: string) => ["item", id] as const,
  content: (id: string) => ["content", id] as const,
  tree: ["tree"] as const,
  traverse: (id: string, opts: TraverseOptions) => ["traverse", id, opts] as const,
  validation: (strict: boolean) => ["validation", strict] as const,
  coverage: ["coverage"] as const,
  gitStatus: ["git", "status"] as const,
  gitHistory: (path: string) => ["git", "history", path] as const,
};

export function useSchema() {
  const ipc = useIpc();
  return useQuery({ queryKey: qk.schema, queryFn: () => ipc.getSchema() });
}

export function useItems() {
  const ipc = useIpc();
  return useQuery({ queryKey: qk.items, queryFn: () => ipc.listItems() });
}

export function useItem(id: string | null) {
  const ipc = useIpc();
  return useQuery({
    queryKey: qk.item(id ?? ""),
    queryFn: () => ipc.getItem(id!),
    enabled: !!id,
  });
}

export function useItemContent(id: string | null) {
  const ipc = useIpc();
  return useQuery({
    queryKey: qk.content(id ?? ""),
    queryFn: () => ipc.getItemContent(id!),
    enabled: !!id,
  });
}

export function useTree() {
  const ipc = useIpc();
  return useQuery({ queryKey: qk.tree, queryFn: () => ipc.buildTree() });
}

export function useTraversal(id: string | null, opts: TraverseOptions) {
  const ipc = useIpc();
  return useQuery({
    queryKey: qk.traverse(id ?? "", opts),
    queryFn: () => ipc.traverse(id!, opts),
    enabled: !!id,
  });
}

export function useValidation(strict = false) {
  const ipc = useIpc();
  return useQuery({ queryKey: qk.validation(strict), queryFn: () => ipc.validate(strict) });
}

export function useGitStatus() {
  const ipc = useIpc();
  return useQuery({ queryKey: qk.gitStatus, queryFn: () => ipc.gitStatus() });
}

export function useFileHistory(path: string | null) {
  const ipc = useIpc();
  return useQuery({
    queryKey: qk.gitHistory(path ?? ""),
    queryFn: () => ipc.gitFileHistory(path!),
    enabled: !!path,
  });
}

/** Save a markdown body, then invalidate the item's content + git status. */
export function useSaveBody() {
  const ipc = useIpc();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => ipc.saveItemBody(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: qk.content(id) });
      qc.invalidateQueries({ queryKey: qk.gitStatus });
    },
  });
}

export function useCommit() {
  const ipc = useIpc();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => ipc.gitCommit({ message }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["git"] }),
  });
}

export function useStage() {
  const ipc = useIpc();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paths, stage }: { paths: string[]; stage: boolean }) =>
      stage ? ipc.gitStage(paths) : ipc.gitUnstage(paths),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.gitStatus }),
  });
}
