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

test("Current focus presents the two approved research directions", () => {
  assert.equal(
    focusHtml.match(/data-research-focus/g)?.length,
    2,
    "the block must contain exactly two research directions",
  );
  assert.ok(focusText.includes("Efficient AI for Biosignals"));
  assert.ok(focusText.includes("Spiking Neural Networks"));
  assert.ok(focusText.includes("neural architecture search (MLP-NAS)"));
  assert.ok(focusText.includes("ECG and PPG"));
  assert.ok(
    focusText.includes("KAN remains a smaller, exploratory direction"),
    "KAN must be framed as exploratory rather than a primary focus",
  );
  assert.ok(focusText.includes("Efficient Edge AI"));
  assert.ok(focusText.includes("real-time multi-camera computer vision"));
  assert.ok(focusText.includes("accuracy, latency, and compute efficiency"));
});
