"use client";

import { useEffect, useState } from "react";
import { observeMediaQuery } from "@/lib/media-query";

/** Enables pointer-following motion whenever a precise hover pointer is available. */
export function usePointerEffectsEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const capablePointer = window.matchMedia(
      "(any-hover: hover) and (any-pointer: fine)",
    );
    const update = () => setEnabled(capablePointer.matches);

    update();
    return observeMediaQuery(capablePointer, update);
  }, []);

  return enabled;
}
