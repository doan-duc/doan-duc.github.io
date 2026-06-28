import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Accent-tinted pill (one of the few approved accent spots). */
export function Tag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border border-accent/20 bg-accent/[0.06] px-3 py-1 text-xs text-accent/90 transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-accent",
        className
      )}
    >
      {children}
    </span>
  );
}
