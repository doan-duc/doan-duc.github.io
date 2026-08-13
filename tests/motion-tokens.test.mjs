import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/**
 * The motion token system (src/lib/motion-tokens.ts) is self-enforcing: raw
 * easing strings, entrance thresholds, or spring numbers scattered through
 * components are exactly the drift that produced 10+ easings and 12 durations
 * before tokens existed. Sections and motion primitives must import tokens.
 */
const srcRoot = fileURLToPath(new URL("../src", import.meta.url));

async function collectFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectFiles(path)));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(path);
  }
  return out;
}

const scanRoots = [join(srcRoot, "components", "sections"), join(srcRoot, "components", "motion")];

// Files with documented exceptions:
// - ScrollRevealText keeps `scrub: true` and its own end range (reading-position 1:1).
const forbidden = [
  { pattern: /ease:\s*["']power/g, label: "raw GSAP ease string (use EASE.*)" },
  { pattern: /start:\s*["']top \d/g, label: "raw start threshold (use START.reveal / FLOW_RANGE)" },
  { pattern: /stiffness:\s*\d/g, label: "raw spring config (use SPRING.*)" },
];

test("sections and motion primitives use motion tokens, not raw literals", async () => {
  const offenders = [];
  for (const root of scanRoots) {
    for (const file of await collectFiles(root)) {
      const source = await readFile(file, "utf8");
      for (const { pattern, label } of forbidden) {
        for (const match of source.matchAll(pattern)) {
          offenders.push(`${file.slice(srcRoot.length + 1)}: ${label} — "${match[0]}"`);
        }
      }
    }
  }
  assert.deepEqual(offenders, [], `motion literals found outside motion-tokens.ts:\n${offenders.join("\n")}`);
});

test("motion tokens hold the agreed system values", async () => {
  const source = await readFile(join(srcRoot, "lib", "motion-tokens.ts"), "utf8");
  for (const expected of [
    "fast: 0.5",
    "standard: 0.9",
    "slow: 1.3",
    'enter: "power3.out"',
    'reveal: "top 85%"',
    "dim: 0.12",
  ]) {
    assert.ok(source.includes(expected), `motion-tokens.ts must define ${expected}`);
  }
});
