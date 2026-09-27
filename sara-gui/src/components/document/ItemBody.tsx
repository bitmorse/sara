import { Spinner } from "@/components/ui/feedback";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import { ItemEditor } from "@/components/editor/ItemEditor";
import { useItemContent } from "@/lib/query/hooks";

export interface ItemBodyProps {
  itemId: string;
  /** When true, the body is editable (MDXEditor); otherwise rendered read-only. */
  editing: boolean;
}

/**
 * An item's markdown body: rendered read-only by default (no toolbar), or the
 * MDXEditor when `editing`. Content is fetched lazily and cached by React Query,
 * so virtualized rows only load what's on screen. Editing autosaves — exit with
 * Esc or by selecting another item; there is no explicit Done/Save.
 */
export function ItemBody({ itemId, editing }: ItemBodyProps) {
  const { data: content, isLoading } = useItemContent(itemId);

  if (editing) {
    return <ItemEditor itemId={itemId} />;
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
