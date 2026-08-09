import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);

const demos = [
  {
    filename: "16cam-jetson-demo.mp4",
    src: "/video/16cam-jetson-demo.mp4",
    poster: "/images/projects/16cam-jetson-demo.jpg",
    triggerLabel: "Play 16-camera demo",
    label: "16-camera Jetson Nano project demo",
  },
  {
    filename: "osco-demo.mp4",
    src: "/video/osco-demo.mp4",
    poster: "/images/projects/osco-demo.jpg",
    triggerLabel: "Play OSCO demo",
    label: "OSCO packaging control project demo",
  },
];

for (const demo of demos) {
  test(`${demo.filename} is exported and mapped to an accessible player`, async () => {
    const asset = await stat(
      fileURLToPath(new URL(`../out/video/${demo.filename}`, import.meta.url)),
    );

    assert.ok(asset.size > 0, `${demo.filename} must be a non-empty asset`);
    assert.ok(
      asset.size < 30_000_000,
      `${demo.filename} must remain below the 30 MB web budget`,
    );

    const poster = await stat(
      fileURLToPath(new URL(`../out${demo.poster}`, import.meta.url)),
    );
    assert.ok(poster.size > 0, `${demo.poster} must be exported`);

    assert.ok(
      html.includes(`aria-label="${demo.triggerLabel}"`),
      "poster trigger must have an accessible name",
    );
    assert.match(
      html,
      /aria-haspopup="dialog"/,
      "poster trigger must expose its dialog behavior",
    );

    const sourceIndex = html.indexOf(`src="${demo.src}"`);
    assert.notEqual(sourceIndex, -1, `${demo.src} must be present in the page`);

    const start = html.lastIndexOf("<video", sourceIndex);
    const end = html.indexOf("</video>", sourceIndex);
    assert.ok(start >= 0 && end > sourceIndex, "source must belong to a video");

    const video = html.slice(start, end + "</video>".length);
    assert.ok(
      video.includes(`aria-label="${demo.label}"`),
      "player must have an accessible name",
    );
    assert.ok(video.includes(`poster="${demo.poster}"`), "player must use its poster");
    assert.match(video, /\bcontrols(?:=""|(?=[\s>]))/, "controls must be enabled");
    assert.ok(
      video.includes('preload="metadata"'),
      "video must avoid eager full-file loading",
    );
    assert.match(
      video,
      /\bplaysinline(?:=""|(?=[\s>]))/i,
      "mobile playback must stay inline",
    );
    assert.doesNotMatch(video, /\bautoplay\b/, "project demos must not autoplay");
  });
}
