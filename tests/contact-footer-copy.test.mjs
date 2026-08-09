import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const pages = await Promise.all(
  ["../out/index.html", "../index.html"].map(async (relativePath) => ({
    relativePath,
    html: await readFile(
      fileURLToPath(new URL(relativePath, import.meta.url)),
      "utf8",
    ),
  })),
);

function sectionText(html, openingTag, closingTag) {
  const start = html.indexOf(openingTag);
  assert.notEqual(start, -1, `${openingTag} must exist`);

  const end = html.indexOf(closingTag, start);
  assert.notEqual(end, -1, `${closingTag} must exist after ${openingTag}`);

  return html
    .slice(start, end + closingTag.length)
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

test("Contact uses the approved closing statement", () => {
  for (const { relativePath, html } of pages) {
    const contact = sectionText(html, '<section id="contact"', "</section>");
    assert.match(
      contact,
      /Relentless practice builds mastery\./,
      `${relativePath} must render the approved closing statement`,
    );
    assert.doesNotMatch(contact, /Let's build something useful\./);
  }
});

test("Footer omits the technology credit without removing copyright", () => {
  for (const { relativePath, html } of pages) {
    const footer = sectionText(html, "<footer", "</footer>");
    assert.doesNotMatch(
      footer,
      /Designed and built with Next\.js, GSAP, Lenis, and Framer Motion\./,
      `${relativePath} must omit the technology credit`,
    );
    assert.match(footer, /Duc Doan Sinh\s*\.\s*All rights reserved\./);
  }
});
