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

test("hero places EDABK beside HUST in one affiliation group", async () => {
  const groupIndex = html.indexOf("data-hero-affiliations");
  assert.notEqual(
    groupIndex,
    -1,
    "the hero must expose one grouped affiliation block",
  );

  const groupStart = html.lastIndexOf("<aside", groupIndex);
  const groupEnd = html.indexOf("</aside>", groupIndex);
  assert.ok(
    groupStart >= 0 && groupEnd > groupIndex,
    "the affiliation group must use a labelled aside",
  );

  const group = html.slice(groupStart, groupEnd + "</aside>".length);
  assert.ok(
    group.includes('aria-label="Academic and research affiliations"'),
    "the grouped affiliations must have an accessible name",
  );
  assert.equal(
    group.match(/data-hust-affiliation/g)?.length,
    1,
    "the group must contain HUST exactly once",
  );
  assert.equal(
    group.match(/data-edabk-affiliation/g)?.length,
    1,
    "the group must contain EDABK exactly once",
  );

  const markerIndex = group.indexOf("data-edabk-affiliation");
  const linkStart = group.lastIndexOf("<a", markerIndex);
  const linkEnd = group.indexOf("</a>", markerIndex);
  assert.ok(linkStart >= 0 && linkEnd > markerIndex, "EDABK must be a link");

  const affiliation = group.slice(linkStart, linkEnd + "</a>".length);
  assert.ok(
    affiliation.includes(
      'href="https://sites.google.com/set.hust.edu.vn/hust-edabk-lab/home"',
    ),
    "EDABK must link to its official laboratory page",
  );
  assert.ok(
    affiliation.includes('src="/images/EDABK.png"'),
    "EDABK must use the supplied local logo",
  );
  assert.ok(affiliation.includes("EDABK"), "the EDABK name must be visible");
  assert.ok(
    affiliation.includes("EDA-BK Research Laboratory"),
    "the laboratory name must be written in full",
  );

  const logo = await stat(
    fileURLToPath(new URL("../out/images/EDABK.png", import.meta.url)),
  );
  assert.ok(logo.size > 0, "the supplied EDABK logo must be exported");
});

test("About does not present EDABK as About content", () => {
  const aboutStart = html.indexOf('id="about"');
  const aboutEnd = html.indexOf('id="featured"', aboutStart);
  assert.notEqual(aboutStart, -1, "the exported page must contain About");
  assert.notEqual(aboutEnd, -1, "About must end before Featured research");

  const about = html.slice(aboutStart, aboutEnd);
  assert.doesNotMatch(
    about,
    /EDABK|EDA-BK/i,
    "EDABK belongs in the hero affiliation group, not About",
  );
});
