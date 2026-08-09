import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);

const projectsStart = html.indexOf('id="projects"');
const projectsEnd = html.indexOf('id="skills"', projectsStart);
assert.notEqual(projectsStart, -1, "the exported page must contain Projects");
assert.notEqual(projectsEnd, -1, "Projects must end before Skills");

const projectsHtml = html.slice(projectsStart, projectsEnd);
const cardStarts = [
  ...projectsHtml.matchAll(/<div data-project-card="true"/g),
].map((match) => match.index);
const cardHtml = cardStarts.map((start, index) =>
  projectsHtml.slice(start, cardStarts[index + 1] ?? projectsHtml.length),
);

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

const cardText = cardHtml.map(plainText);

const jetsonCopy = [
  "16-stream object detection on Jetson Nano",
  "Running multi-camera vision on a Jetson Nano is a systems problem: 16 live streams must be decoded, batched, inferred, tracked, and rendered under tight compute and memory constraints.",
  "A 16-stream DeepStream pipeline on Jetson Nano using TensorRT FP16, batch inference, IOU tracking, and Docker, paired with a custom ~1.1M-parameter YOLOv8n distilled from a larger teacher model.",
  "Throughput came from co-designing the model and the pipeline. Stream batching, inference intervals, TensorRT conversion, memory constraints, and model size mattered as much as detection accuracy.",
  "It demonstrates that a multi-camera vision workload can be engineered around constrained edge hardware instead of requiring a discrete-GPU server.",
];

const oscoCopy = [
  "Electronic packaging control system",
  "Packaging QA is not only about whether an item is present. Operators must place the right components, in the right locations, and in the right sequence across multiple assembly steps.",
  "OSCO combines an 11-class YOLOv8 detector with four RTSP cameras, orientation-aware slot maps, a shared two-layer checklist, and workflow validation. A custom slim-neck model reduces the vision core to ~1.9M parameters / 5.3 GFLOPs.",
  "The detector is only the perception layer. Reliable visual QA also needs geometry, temporal confirmation, cross-camera state, and explicit workflow rules to understand the process rather than isolated frames.",
  "It moves computer vision from object detection to process-aware inspection, allowing missing, misplaced, or out-of-order components to be flagged during packing rather than after the box is complete.",
];

test("Selected work exports exactly the two approved projects", () => {
  assert.equal(cardText.length, 2, "Projects must contain exactly two cards");
  assert.match(cardText[0] ?? "", /^01\b/, "the first card must remain project 01");
  assert.match(cardText[1] ?? "", /^02\b/, "the second card must remain project 02");
  assert.doesNotMatch(
    plainText(projectsHtml),
    /RAG support assistant \+ YOLO deployment|Applied AI internship/,
    "the former project 03 must not be rendered",
  );
});

test("project 01 renders the approved Jetson system story", () => {
  for (const copy of jetsonCopy) {
    assert.ok(cardText[0]?.includes(copy), `project 01 must include: ${copy}`);
  }
});

test("project 02 renders the approved OSCO system story", () => {
  for (const copy of oscoCopy) {
    assert.ok(cardText[1]?.includes(copy), `project 02 must include: ${copy}`);
  }
});
