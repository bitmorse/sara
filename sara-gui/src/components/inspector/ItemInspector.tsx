import { Link2, FileText } from "lucide-react";

import { cn } from "@/lib/cn";
import { Badge, ItemTypeBadge } from "@/components/ui/Badge";
import { EmptyState, LoadingState } from "@/components/ui/feedback";
import { useItem, useSchema } from "@/lib/query/hooks";
import type { AttributeValue, ItemDetail, Relationship } from "@/types/domain";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-subtle-fg">{title}</h3>
      {children}
    </section>
  );
}

function AttributeField({ attr }: { attr: AttributeValue }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] text-muted-fg">{attr.displayName}</dt>
      <dd className="text-xs text-fg">
        {Array.isArray(attr.value) ? (
          <div className="flex flex-wrap gap-1">
            {attr.value.map((v) => (
              <Badge key={v}>{v}</Badge>
            ))}
          </div>
        ) : attr.fieldType === "enum" ? (
          <Badge tone="info">{attr.value}</Badge>
        ) : (
          <span className="whitespace-pre-wrap">{attr.value}</span>
        )}
      </dd>
    </div>
  );
}

function RelationshipRow({ rel, displayName }: { rel: Relationship; displayName: string }) {
  return (
    <li className="flex items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-accent">
      <span className="w-24 shrink-0 truncate text-[11px] text-muted-fg" title={displayName}>
        {displayName}
      </span>
      <Link2 className="size-3 shrink-0 text-subtle-fg" aria-hidden />
      <span className="font-mono text-[11px] text-primary">{rel.targetId}</span>
    </li>
  );
}

/** Right-hand inspector: identity, attributes, relationships, traceability. */
export function ItemInspector({
  itemId,
  extra,
}: {
  itemId: string | null;
  /** Optional slot (e.g. TraceabilityPanel, FileHistory) rendered at the bottom. */
  extra?: (item: ItemDetail) => React.ReactNode;
}) {
  const { data: item, isLoading } = useItem(itemId);
  const { data: schema } = useSchema();

  if (!itemId) {
    return (
      <EmptyState icon={FileText} title="No selection" description="Select an item to inspect its metadata and links." />
    );
  }
  if (isLoading || !item) return <LoadingState />;

  const relName = (relation: string) =>
    schema?.relations.find((r) => r.id === relation)?.displayName ?? relation;
  const typeName = schema?.itemTypes.find((t) => t.id === item.type)?.displayName;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-2 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <ItemTypeBadge typeId={item.type} displayName={typeName} />
          <span className="font-mono text-[11px] text-muted-fg">{item.id}</span>
        </div>
        <h2 className="text-sm font-semibold text-fg">{item.name}</h2>
        {item.description && <p className="text-xs leading-relaxed text-muted-fg">{item.description}</p>}
        <p className={cn("truncate font-mono text-[10px] text-subtle-fg")} title={item.filePath}>
          {item.filePath}
        </p>
      </div>

      <div className="space-y-4 p-3">
        {item.attributes.length > 0 && (
          <Section title="Attributes">
            <dl className="space-y-2">
              {item.attributes.map((a) => (
                <AttributeField key={a.name} attr={a} />
              ))}
            </dl>
          </Section>
        )}

        {item.relationships.length > 0 && (
          <Section title="Relationships">
            <ul className="-mx-1.5">
              {item.relationships.map((rel, i) => (
                <RelationshipRow key={`${rel.relation}-${rel.targetId}-${i}`} rel={rel} displayName={relName(rel.relation)} />
              ))}
            </ul>
          </Section>
        )}

        {extra && (
          <Section title="Traceability">
            {extra(item)}
          </Section>
        )}
      </div>
    </div>
  );
}
