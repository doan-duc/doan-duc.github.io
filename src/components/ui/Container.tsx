import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared editorial max-width wrapper. Generous side gutters. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6 md:px-10", className)}>
      {children}
    </div>
  );
}
