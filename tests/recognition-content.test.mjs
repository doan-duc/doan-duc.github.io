import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);

const recognitionStart = html.indexOf('id="achievements"');
const recognitionEnd = html.indexOf('id="contact"', recognitionStart);
assert.notEqual(
  recognitionStart,
  -1,
  "the exported page must contain Recognition",
);
assert.notEqual(
  recognitionEnd,
  -1,
  "Recognition must end before Contact",
);

const recognitionHtml = html.slice(recognitionStart, recognitionEnd);
const nodeStarts = [
  ...recognitionHtml.matchAll(/<div data-achievement-node="true"/g),
].map((match) => match.index);

function plainText(fragment) {
  return fragment
    .replace(/<!--.*?-->/gs, " ")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replace(/\s+/g, " ")
    .trim();
}

const recognitionText = plainText(recognitionHtml);
const nodeText = nodeStarts.map((start, index) =>
  plainText(
    recognitionHtml.slice(start, nodeStarts[index + 1] ?? recognitionHtml.length),
  ),
);

const scicCopy = [
  "2026",
  "State Capital Investment Corporation (SCIC)",
  "SCIC “Empowering Young Talent” Scholarship",
  "Selected among 40 outstanding students for achievements in technology, AI, and innovation.",
];

test("Recognition places the SCIC scholarship directly after HSIL", () => {
  assert.equal(nodeText.length, 4, "Recognition must contain four timeline nodes");
  assert.ok(nodeText[0]?.includes("Harvard HSIL Hackathon"));

  for (const copy of scicCopy) {
    assert.ok(nodeText[1]?.includes(copy), `the second node must include: ${copy}`);
  }
});

test("Recognition removes the Bosch CodeRace entry", () => {
  assert.doesNotMatch(
    recognitionText,
    /Bosch CodeRace Challenge|Bosch Global Software Technologies VN/,
  );
});
