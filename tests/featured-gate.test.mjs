import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * The pinned research experience is gated twice: the component's matchMedia
 * decides GSAP behaviour, and a CSS media query decides layout pre-hydration.
 * If the two drift apart, some machines get pinned layout with flow animation
 * (or vice versa) — exactly the per-machine inconsistency this repo fights.
 */
const GATE = "(min-width: 1024px) and (min-height: 600px) and (pointer: fine)";

test("the featured pin gate is identical in TSX and CSS", async () => {
  const tsx = await readFile(
    fileURLToPath(new URL("../src/components/sections/FeaturedResearch3D.tsx", import.meta.url)),
    "utf8",
  );
  const css = await readFile(
    fileURLToPath(new URL("../src/app/globals.css", import.meta.url)),
    "utf8",
  );

  assert.ok(tsx.includes(`"${GATE}"`), `FeaturedResearch3D.tsx must gate on ${GATE}`);
  assert.ok(
    css.includes(`@media ${GATE} and (prefers-reduced-motion: no-preference)`),
    "globals.css pinned layout must use the identical query (+ no-preference)",
  );
});
