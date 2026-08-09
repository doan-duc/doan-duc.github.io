import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);

test("the exported portfolio contains no CV download action", () => {
  assert.doesNotMatch(html, /Download CV|\/files\/duc-doan-sinh-cv\.pdf/);
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
