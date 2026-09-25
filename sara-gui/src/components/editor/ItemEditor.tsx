import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { LoadingState } from "@/components/ui/feedback";
import { useItemRaw, useSaveRaw } from "@/lib/query/hooks";
import { MarkdownEditor } from "./MarkdownEditor";

export interface ItemEditorProps {
  itemId: string;
  /** Debounce (ms) before autosaving edits. */
  autosaveMs?: number;
}

/**
 * Loads an item's full markdown file and hosts the editor with debounced
 * autosave. The editor round-trips frontmatter + body and writes the whole file.
 */
export function ItemEditor({ itemId, autosaveMs = 800 }: ItemEditorProps) {
  const { data: raw, isLoading } = useItemRaw(itemId);
  const save = useSaveRaw();
  const [dirty, setDirty] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel a pending autosave if the item changes.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [itemId]);

  if (isLoading || raw === undefined) return <LoadingState label="Loading document…" />;

  const onChange = (content: string) => {
    setDirty(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save.mutate({ id: itemId, content }, { onSuccess: () => setDirty(false) });
    }, autosaveMs);
  };

  return (
    <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
      <MarkdownEditor key={itemId} itemId={itemId} value={raw} onChange={onChange} />
      <div className="flex items-center justify-end gap-1 pr-1 text-[10px] text-subtle-fg">
        {save.isPending ? (
          <>
            <Loader2 className="size-3 animate-spin" aria-hidden /> saving…
          </>
        ) : dirty ? (
          <span>unsaved changes</span>
        ) : (
          <>
            <Check className="size-3 text-success" aria-hidden /> saved
          </>
        )}
      </div>
    </div>
  );
}
