import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);

const visiblePage = html.replace(/<!--.*?-->/gs, " ");
const hiddenResearchTerms =
  /ear-to-chest|ECG|\bSNNs?\b|Spiking(?: Neural Networks?| NN)?|neuromorphic|bio(?:medical )?signals?/i;

test("the public portfolio does not expose ECG/SNN research", () => {
  assert.doesNotMatch(visiblePage, hiddenResearchTerms);
  assert.doesNotMatch(visiblePage, /id="featured"/);
  assert.doesNotMatch(visiblePage, /href="[^"]*ear-to-chest-ecg-reconstruction/i);
});

test("the public portfolio does not render ECG-themed decoration", () => {
  assert.doesNotMatch(visiblePage, /ecg-animate|ecg-line/);
  assert.doesNotMatch(visiblePage, /M0 14 H822 l7 -8 9 12 7 -10 8 6 H1200/);
  assert.doesNotMatch(visiblePage, /M1 7h12l3-4 4 8 4-8 4 4h25/);
});

async function collectPublicAssets(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectPublicAssets(path) : [path];
    }),
  );
  return nested.flat();
}

test("exported HTML, CSS, and JavaScript do not ship ECG/SNN identifiers", async () => {
  const outDirectory = fileURLToPath(new URL("../out", import.meta.url));
  const assets = (await collectPublicAssets(outDirectory)).filter((path) =>
    [".html", ".css", ".js"].includes(extname(path)),
  );
  const publicBundle = (await Promise.all(assets.map((path) => readFile(path, "utf8")))).join("\n");
  assert.doesNotMatch(publicBundle, hiddenResearchTerms);
  assert.doesNotMatch(publicBundle, /ecg-animate|ecg-line|ecgDraw|#featured/i);
});
