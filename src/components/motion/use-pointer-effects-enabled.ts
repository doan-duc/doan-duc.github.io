"use client";

import { useEffect, useState } from "react";
import { observeMediaQuery } from "@/lib/media-query";

/** Enables pointer-following motion only when the primary pointer can hover precisely. */
export function usePointerEffectsEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const capablePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(capablePointer.matches);

    update();
    return observeMediaQuery(capablePointer, update);
  }, []);

  return enabled;
}
