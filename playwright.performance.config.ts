import { defineConfig } from "@playwright/test";
import responsiveConfig from "./playwright.responsive.config";

export default defineConfig({
  ...responsiveConfig,
  testMatch: "**/responsive-performance.spec.ts",
  workers: 1,
  projects: [{ name: "chromium-performance", use: { browserName: "chromium" } }],
  outputDir: "test-results/performance",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-performance-report", open: "never" }],
  ],
});
