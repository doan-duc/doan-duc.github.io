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

test("About section balances its story with a semantic 3D identity", () => {
  assert.ok(
    aboutHtml.includes("data-about-identity"),
    "About must include a dedicated visual identity column",
  );

  const headingMarker = aboutHtml.indexOf("data-about-heading");
  const headingStart = aboutHtml.lastIndexOf("<h2", headingMarker);
  const headingEnd = aboutHtml.indexOf("</h2>", headingMarker);
  assert.ok(
    headingMarker >= 0 && headingStart >= 0 && headingEnd > headingMarker,
    "About must use a semantic h2 for its primary section identity",
  );
  assert.match(
    aboutHtml.slice(headingStart, headingEnd + "</h2>".length),
    />\s*About[\s\S]*<\/h2>/,
    "the primary About heading must be visible",
  );

  assert.ok(
    aboutHtml.includes('data-about-signal-stack="spring-3d"'),
    "About must expose a spring-based 3D signal instrument",
  );

  const expectedLayers = ["signal", "intelligence", "system"];
  for (const layer of expectedLayers) {
    assert.ok(
      aboutHtml.includes(`data-about-layer="${layer}"`),
      `About instrument must include the ${layer} layer`,
    );
  }
});
