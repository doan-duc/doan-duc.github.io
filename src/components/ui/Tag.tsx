import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small pill used for tech tags / chips. */
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
        "inline-flex items-center rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-muted transition-colors hover:border-white/20 hover:text-ink",
        className
      )}
    >
      {children}
    </span>
  );
}
