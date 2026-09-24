import { useEffect } from "react";
import type { Decorator } from "@storybook/react-vite";

import { useUiStore } from "@/store/ui";

/** Storybook decorator that seeds the global UI store before a story renders. */
export function withStore(initial: Partial<ReturnType<typeof useUiStore.getState>>): Decorator {
  return (Story) => {
    useEffect(() => {
      useUiStore.setState(initial);
    }, []);
    return <Story />;
  };
}

/** Common frame giving a story a bordered, sized surface like a real panel. */
export function Panel({ children, width = 320, height = 520 }: { children: React.ReactNode; width?: number; height?: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface" style={{ width, height }}>
      {children}
    </div>
  );
}
