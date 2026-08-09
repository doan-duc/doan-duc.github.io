import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);

test("hero presents one accessible HUST affiliation card", async () => {
  const logo = await stat(
    fileURLToPath(new URL("../out/images/hust-logo.png", import.meta.url)),
  );
  assert.ok(logo.size > 0, "the local HUST logo must be exported");

  const markerIndex = html.indexOf("data-hust-affiliation");
  assert.notEqual(markerIndex, -1, "the hero must expose its HUST affiliation");
  assert.equal(
    html.match(/data-hust-affiliation/g)?.length,
    1,
    "the page must contain exactly one HUST affiliation card",
  );

  const start = html.lastIndexOf("<a", markerIndex);
  const end = html.indexOf("</a>", markerIndex);
  assert.ok(start >= 0 && end > markerIndex, "the affiliation must be a link");

  const affiliation = html.slice(start, end + "</a>".length);
  assert.ok(
    affiliation.includes('href="https://hust.edu.vn/"'),
    "the card must link to the official HUST website",
  );
  assert.ok(
    affiliation.includes('src="/images/hust-logo.png"'),
    "the card must use the local HUST logo",
  );
  assert.ok(
    affiliation.includes("Hanoi University of Science and Technology"),
    "the university name must be written in full",
  );
  assert.doesNotMatch(affiliation, /UTokyo|2nd Place/);
});
