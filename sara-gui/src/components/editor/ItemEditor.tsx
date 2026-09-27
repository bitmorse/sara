import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
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
 * autosave. Saving is automatic: edits persist on a debounce, any pending edit
 * is flushed when the editor unmounts (Esc / selecting another item), and a
 * brief "saved" flash confirms each write. No explicit Save/Done.
 */
export function ItemEditor({ itemId, autosaveMs = 800 }: ItemEditorProps) {
  const { data: raw, isLoading } = useItemRaw(itemId);
  const save = useSaveRaw();
  const [justSaved, setJustSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest edited content + whether a debounced save is still pending, so we can
  // flush on unmount instead of dropping the last edit.
  const pending = useRef<{ content: string; dirty: boolean }>({ content: "", dirty: false });
  const saveRef = useRef(save);
  saveRef.current = save;

  const commit = (content: string) => {
    pending.current.dirty = false;
    saveRef.current.mutate(
      { id: itemId, content },
      {
        onSuccess: () => {
          setJustSaved(true);
          if (flashTimer.current) clearTimeout(flashTimer.current);
          flashTimer.current = setTimeout(() => setJustSaved(false), 1000);
        },
      },
    );
  };
  const commitRef = useRef(commit);
  commitRef.current = commit;

  // On unmount (or item switch) flush any pending edit before tearing down.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (pending.current.dirty) commitRef.current(pending.current.content);
    };
  }, [itemId]);

  if (isLoading || raw === undefined) return <LoadingState label="Loading document…" />;

  const onChange = (content: string) => {
    pending.current = { content, dirty: true };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(content), autosaveMs);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <MarkdownEditor key={itemId} itemId={itemId} value={raw} onChange={onChange} />
      <div
        className={cn(
          "pointer-events-none absolute right-1 top-1 flex items-center gap-1 text-[10px] text-subtle-fg transition-opacity duration-500",
          justSaved ? "opacity-100" : "opacity-0",
        )}
        aria-live="polite"
      >
        <Check className="size-3 text-success" aria-hidden /> saved
      </div>
    </div>
  );
}
