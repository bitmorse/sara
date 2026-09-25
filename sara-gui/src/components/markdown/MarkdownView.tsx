import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/cn";
import { useIpc } from "@/lib/ipc/context";
import { MermaidDiagram } from "./MermaidDiagram";

const PASSTHROUGH = /^(https?:|data:|blob:|asset:)/;

/** Renders a repo image, resolving relative paths against the item directory. */
function AsyncImage({ itemId, src, alt }: { itemId: string; src?: string; alt?: string }) {
  const ipc = useIpc();
  const [resolved, setResolved] = useState<string | undefined>(
    src && PASSTHROUGH.test(src) ? src : undefined,
  );

  useEffect(() => {
    if (!src || PASSTHROUGH.test(src)) {
      setResolved(src);
      return;
    }
    let active = true;
    ipc
      .resolveAssetUrl(itemId, src)
      .then((url) => active && setResolved(url))
      .catch(() => active && setResolved(undefined));
    return () => {
      active = false;
    };
  }, [ipc, itemId, src]);

  if (!resolved) {
    return <span className="text-xs text-subtle-fg">🖼 {alt ?? src}</span>;
  }
  return <img src={resolved} alt={alt ?? ""} loading="lazy" />;
}

export interface MarkdownViewProps {
  /** Item whose directory scopes relative media paths. */
  itemId: string;
  markdown: string;
  className?: string;
}

/** Read-only markdown renderer (GFM + local images + mermaid), styled as prose. */
export function MarkdownView({ itemId, markdown, className }: MarkdownViewProps) {
  return (
    <div className={cn("sara-prose", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => <AsyncImage itemId={itemId} src={typeof src === "string" ? src : undefined} alt={alt} />,
          // Swap fenced ```mermaid blocks for a rendered diagram; other code
          // blocks keep the default <pre><code> (styled by .sara-prose).
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children;
            const cls =
              (child &&
                typeof child === "object" &&
                "props" in child &&
                (child.props as { className?: string }).className) ||
              "";
            if (cls.includes("language-mermaid")) {
              const code = String((child as { props: { children?: unknown } }).props.children ?? "");
              return <MermaidDiagram code={code.trim()} />;
            }
            // Don't spread react-markdown's runtime `node` prop onto the DOM node.
            return <pre>{children}</pre>;
          },
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
