import { useCallback, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface SplitPaneProps {
  direction?: "horizontal" | "vertical";
  /** Initial size of the FIRST pane, in px. */
  initialSize?: number;
  minFirst?: number;
  minSecond?: number;
  first: ReactNode;
  second: ReactNode;
  className?: string;
}

/**
 * Two-pane resizable split with a draggable divider. Pointer-based, no deps.
 * `horizontal` splits left/right; `vertical` splits top/bottom.
 */
export function SplitPane({
  direction = "horizontal",
  initialSize = 280,
  minFirst = 160,
  minSecond = 200,
  first,
  second,
  className,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(initialSize);
  const [dragging, setDragging] = useState(false);
  const isH = direction === "horizontal";

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      const container = containerRef.current;
      if (!container) return;

      const move = (ev: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const raw = isH ? ev.clientX - rect.left : ev.clientY - rect.top;
        const total = isH ? rect.width : rect.height;
        const clamped = Math.max(minFirst, Math.min(raw, total - minSecond));
        setSize(clamped);
      };
      const up = () => {
        setDragging(false);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [isH, minFirst, minSecond],
  );

  return (
    <div
      ref={containerRef}
      className={cn("flex h-full min-h-0 min-w-0", isH ? "flex-row" : "flex-col", className)}
    >
      <div
        className="min-h-0 min-w-0 overflow-hidden"
        style={isH ? { width: size, flexShrink: 0 } : { height: size, flexShrink: 0 }}
      >
        {first}
      </div>
      <div
        role="separator"
        aria-orientation={isH ? "vertical" : "horizontal"}
        onPointerDown={onPointerDown}
        className={cn(
          "group relative shrink-0 bg-border transition-colors hover:bg-primary/40",
          dragging && "bg-primary/60",
          isH ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
        )}
      >
        {/* widened invisible hit-area */}
        <span
          className={cn(
            "absolute",
            isH ? "inset-y-0 -left-1 -right-1" : "inset-x-0 -top-1 -bottom-1",
          )}
        />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{second}</div>
    </div>
  );
}
