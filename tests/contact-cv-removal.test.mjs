import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);
const deployedHtml = await readFile(
  fileURLToPath(new URL("../index.html", import.meta.url)),
  "utf8",
);
const readme = await readFile(
  fileURLToPath(new URL("../README.md", import.meta.url)),
  "utf8",
);

test("generated and deployed pages contain no CV download action", () => {
  for (const page of [html, deployedHtml]) {
    assert.doesNotMatch(page, /Download CV|\/files\/duc-doan-sinh-cv\.pdf/);
  }
});

test("the CV PDF is not included in the static export", async () => {
  await assert.rejects(
    stat(
      fileURLToPath(
        new URL("../out/files/duc-doan-sinh-cv.pdf", import.meta.url),
      ),
    ),
    { code: "ENOENT" },
  );
});

test("repository documentation contains no removed CV path", () => {
  assert.doesNotMatch(readme, /duc-doan-sinh-cv\.pdf|Portrait \/ CV/);
});
