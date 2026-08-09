import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);

const aboutStart = html.indexOf('id="about"');
const aboutEnd = html.indexOf('id="featured"', aboutStart);
assert.notEqual(aboutStart, -1, "the exported page must contain the About section");
assert.notEqual(aboutEnd, -1, "the About section must end before Featured research");
const aboutHtml = html.slice(aboutStart, aboutEnd);
const aboutText = aboutHtml
  .replace(/<!--.*?-->/gs, " ")
  .replace(/<[^>]+>/g, " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&#x27;", "'")
  .replace(/\s+/g, " ")
  .trim();

const expectedParagraphs = [
  "I build AI systems that work beyond the notebook — where signals are noisy, hardware is constrained, and technology has to work for people.",
  "I'm an Embedded Systems & IoT undergraduate at Hanoi University of Science and Technology, focusing on signal processing, efficient AI, and deployable intelligent systems.",
  "The common thread across my work is turning ideas into systems: from wearable biosignals to meaningful health insights, from large vision models to efficient edge deployments, and from research experiments to prototypes that work in the real world.",
];

test("About section renders the approved portfolio copy", () => {
  for (const paragraph of expectedParagraphs) {
    assert.ok(
      aboutText.includes(paragraph),
      `About section must include: ${paragraph}`,
    );
  }
});
