import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/**
 * The site deploys from out/ via GitHub Actions (.github/workflows/deploy.yml).
 * A committed copy of the export at the repository root once drifted a full
 * build behind the source — the deployed site was missing shipped features.
 * These checks make that class of failure loud.
 */
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(repoRoot, "out");

const forbiddenRootArtifacts = [
  "_next",
  "index.html",
  "404.html",
  "_not-found.html",
  "_not-found",
  "index.txt",
  "_not-found.txt",
  ".nojekyll",
  "images",
  "files",
];

test("no export artifacts are committed at the repository root", async () => {
  const rootEntries = new Set(await readdir(repoRoot));
  for (const artifact of forbiddenRootArtifacts) {
    assert.ok(
      !rootEntries.has(artifact),
      `"${artifact}" must not exist at the repo root — the export deploys from out/ only`,
    );
  }
  const strayNextDumps = [...rootEntries].filter((name) => name.startsWith("__next."));
  assert.deepEqual(strayNextDumps, [], "__next.*.txt export dumps must not exist at the root");
});

test("the export contains exactly one build and every referenced asset exists", async () => {
  const html = await readFile(join(outDir, "index.html"), "utf8");

  // Turbopack keys each build by a directory under _next/static; a mixed
  // export (stale chunks from an earlier build) would show more than one.
  const staticEntries = await readdir(join(outDir, "_next", "static"), { withFileTypes: true });
  const buildIdDirs = staticEntries.filter(
    (entry) => entry.isDirectory() && !["chunks", "media", "css"].includes(entry.name),
  );
  assert.equal(
    buildIdDirs.length,
    1,
    `out/_next/static must hold exactly one build id, found: ${buildIdDirs.map((d) => d.name).join(", ")}`,
  );

  const assetPaths = new Set(
    [...html.matchAll(/"(\/_next\/[^"?]+)/g)]
      .map(([, path]) => path)
      .filter((path) => /\.(js|css|woff2)$/.test(path)),
  );
  assert.ok(assetPaths.size > 0, "expected the page to reference _next assets");
  for (const assetPath of assetPaths) {
    await assert.doesNotReject(
      access(join(outDir, ...assetPath.split("/").filter(Boolean))),
      `referenced asset missing from out/: ${assetPath}`,
    );
  }
});

test("the exported CSS carries the scroll word-reveal system", async () => {
  const html = await readFile(join(outDir, "index.html"), "utf8");
  const cssHrefs = [...html.matchAll(/href="(\/_next\/[^"]+\.css)"/g)].map(([, href]) => href);
  assert.ok(cssHrefs.length > 0, "expected at least one exported stylesheet");

  const cssBlobs = await Promise.all(
    cssHrefs.map((href) => readFile(join(outDir, ...href.split("/").filter(Boolean)), "utf8")),
  );
  assert.ok(
    cssBlobs.some((css) => css.includes(".reveal-word")),
    "exported CSS must include .reveal-word — the exact class a stale deploy once lost",
  );
});
