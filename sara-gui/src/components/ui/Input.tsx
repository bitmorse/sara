import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Leading adornment (usually an icon). */
  leading?: ReactNode;
}

/** Single-line text input matching the design tokens. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leading, ...props },
  ref,
) {
  return (
    <div className="relative flex items-center">
      {leading && (
        <span className="pointer-events-none absolute left-2.5 flex text-muted-fg">{leading}</span>
      )}
      <input
        ref={ref}
        className={cn(
          "h-8 w-full rounded-md border border-input bg-surface px-2.5 text-[13px] text-fg",
          "placeholder:text-subtle-fg transition-colors",
          "focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-60",
          leading && "pl-8",
          className,
        )}
        {...props}
      />
    </div>
  );
});
