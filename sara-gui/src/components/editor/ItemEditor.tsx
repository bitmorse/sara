import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { LoadingState } from "@/components/ui/feedback";
import { useItemContent, useSaveBody } from "@/lib/query/hooks";
import { MarkdownEditor } from "./MarkdownEditor";

export interface ItemEditorProps {
  itemId: string;
  /** Debounce (ms) before autosaving edits. */
  autosaveMs?: number;
}

/**
 * Loads an item's markdown body and hosts the editor with debounced autosave.
 * Frontmatter is preserved server-side, so edits here produce clean git diffs.
 */
export function ItemEditor({ itemId, autosaveMs = 800 }: ItemEditorProps) {
  const { data: content, isLoading } = useItemContent(itemId);
  const save = useSaveBody();
  const [dirty, setDirty] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel a pending autosave if the item changes.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [itemId]);

  if (isLoading || !content) return <LoadingState label="Loading document…" />;

  const onChange = (body: string) => {
    setDirty(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save.mutate({ id: itemId, body }, { onSuccess: () => setDirty(false) });
    }, autosaveMs);
  };

  return (
    <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
      <MarkdownEditor key={itemId} itemId={itemId} value={content.body} onChange={onChange} />
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
