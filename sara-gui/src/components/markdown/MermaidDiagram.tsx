import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

import { useIsDark } from "@/lib/use-theme";

/** Renders a Mermaid diagram from source, re-rendering on theme change. */
export function MermaidDiagram({ code }: { code: string }) {
  const isDark = useIsDark();
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "_");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "neutral",
      securityLevel: "strict",
      flowchart: { htmlLabels: true, curve: "basis" },
    });
    mermaid
      .render(`m_${id}`, code)
      .then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [code, id, isDark]);

  if (error) return <p className="p-2 text-xs text-danger">{error}</p>;
  return <div ref={ref} className="my-2 flex justify-center [&_svg]:max-w-full" />;
}
