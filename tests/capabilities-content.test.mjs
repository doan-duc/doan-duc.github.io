import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const html = await readFile(
  fileURLToPath(new URL("../out/index.html", import.meta.url)),
  "utf8",
);

const skillsStart = html.indexOf('id="skills"');
const skillsEnd = html.indexOf('id="achievements"', skillsStart);
assert.notEqual(skillsStart, -1, "the exported page must contain Skills");
assert.notEqual(skillsEnd, -1, "Skills must end before Achievements");

const skillsHtml = html.slice(skillsStart, skillsEnd);
const panelStarts = [
  ...skillsHtml.matchAll(/<div data-skill-panel="true"/g),
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

const skillsText = plainText(skillsHtml);
const panelText = panelStarts.map((start, index) =>
  plainText(skillsHtml.slice(start, panelStarts[index + 1] ?? skillsHtml.length)),
);

const expectedCapabilities = [
  {
    title: "Efficient AI & Model Optimization",
    description:
      "Designing smaller models for constrained compute without giving up useful performance.",
    tags: [
      "Neural Architecture Search",
      "Quantization",
      "Knowledge Distillation",
      "Pruning",
      "Model Compression",
    ],
  },
  {
    title: "Edge AI & Deployment",
    description:
      "Running AI reliably under real hardware, latency, memory, and streaming constraints.",
    tags: [
      "NVIDIA Jetson",
      "TensorRT",
      "DeepStream / GStreamer",
      "Docker",
      "ONNX",
      "RTSP Pipelines",
    ],
  },
  {
    title: "Computer Vision & AI Systems",
    description:
      "Building perception pipelines that connect models, cameras, state, and application logic.",
    tags: [
      "Object Detection",
      "Multi-Camera Vision",
      "Tracking",
      "Workflow Automation",
      "Real-Time Inference",
    ],
  },
];

test("What I Work With renders the three public capability panels", () => {
  assert.ok(skillsText.includes("What I work with"));
  assert.ok(skillsText.includes("The tools and methods behind the work."));
  assert.equal(panelText.length, 3, "the section must contain three panels");
  assert.doesNotMatch(
    skillsText,
    /Efficient AI & models|Biosignals & perception|Edge deployment|Applied systems/,
    "the former capability taxonomy must be removed",
  );
});

test("each capability panel renders its approved description and tags", () => {
  expectedCapabilities.forEach((capability, index) => {
    const text = panelText[index] ?? "";
    assert.ok(text.includes(capability.title), `panel ${index + 1} title must match`);
    assert.ok(
      text.includes(capability.description),
      `panel ${index + 1} description must match`,
    );
    for (const tag of capability.tags) {
      assert.ok(text.includes(tag), `panel ${index + 1} must include ${tag}`);
    }
  });
});
