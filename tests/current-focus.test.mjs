import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);

const headingIndex = html.indexOf("Research interests &amp; focus");
assert.notEqual(headingIndex, -1, "the page must label the research-focus block");

const focusEnd = html.indexOf("</section>", headingIndex);
assert.notEqual(focusEnd, -1, "the research-focus block must stay inside About");
const focusHtml = html.slice(headingIndex, focusEnd);
const focusText = focusHtml
  .replace(/<!--.*?-->/gs, " ")
  .replace(/<[^>]+>/g, " ")
  .replaceAll("&amp;", "&")
  .replace(/\s+/g, " ")
  .trim();

test("Current focus presents only the public research direction", () => {
  assert.equal(
    focusHtml.match(/data-research-focus/g)?.length,
    1,
    "the block must contain exactly one public research direction",
  );
  assert.ok(focusText.includes("Efficient Edge AI"));
  assert.ok(focusText.includes("real-time multi-camera computer vision"));
  assert.ok(focusText.includes("accuracy, latency, and compute efficiency"));
  assert.doesNotMatch(focusText, /ECG|SNN|Spiking|biosignal/i);
});
