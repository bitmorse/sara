import { Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/feedback";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import { ItemEditor } from "@/components/editor/ItemEditor";
import { useItemContent } from "@/lib/query/hooks";

export interface ItemBodyProps {
  itemId: string;
  /** When true, the body is editable (MDXEditor); otherwise rendered read-only. */
  editing: boolean;
  onDone?: () => void;
}

/**
 * An item's markdown body: rendered read-only by default (no toolbar), or the
 * MDXEditor when `editing`. Content is fetched lazily and cached by React Query,
 * so virtualized rows only load what's on screen.
 */
export function ItemBody({ itemId, editing, onDone }: ItemBodyProps) {
  const { data: content, isLoading } = useItemContent(itemId);

  if (editing) {
    return (
      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
        <ItemEditor itemId={itemId} />
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" icon={Check} onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-1 text-xs text-subtle-fg">
        <Spinner className="size-3.5" /> loading…
      </div>
    );
  }
  if (!content?.body.trim()) {
    return <p className="py-0.5 text-[13px] italic text-subtle-fg">No body content.</p>;
  }

  return <MarkdownView itemId={itemId} markdown={content.body} />;
}
