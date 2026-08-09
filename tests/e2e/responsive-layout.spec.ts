import { expect, test } from "@playwright/test";
import {
  collectLayoutIssues,
  crossEngineViewports,
  expectNoLayoutIssues,
  openResponsivePage,
  settleLayout,
  widthSweep,
} from "./responsive-helpers";

test.describe("responsive geometry", () => {
  test("@smoke has no hidden horizontal overflow from 320px through 2560px", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "The continuous sweep runs once in Chromium");
    test.slow();

    const { context, page } = await openResponsivePage(
      browser,
      { name: "width-sweep", width: 320, height: 568 },
      { reducedMotion: true },
    );
    const failures: string[] = [];

    try {
      for (const width of widthSweep()) {
        const height = Math.max(568, Math.min(1200, Math.round(width * 0.72)));
        await page.setViewportSize({ width, height });
        await settleLayout(page);
        const layoutIssues = await collectLayoutIssues(page);
        if (layoutIssues.length > 0) failures.push(`${width}x${height}: ${layoutIssues.join(" | ")}`);
      }
    } finally {
      await context.close();
    }

    expect(failures, failures.join("\n")).toEqual([]);
  });

  test("keeps representative phone, tablet, laptop, and desktop layouts in bounds", async ({
    browser,
  }) => {
    test.slow();

    for (const viewport of crossEngineViewports) {
      const { context, page } = await openResponsivePage(browser, viewport, {
        reducedMotion: true,
      });
      try {
        await expectNoLayoutIssues(page, `${viewport.name} ${viewport.width}x${viewport.height}`);

        const mobileToggle = page.getByRole("button", { name: "Toggle menu" });
        const desktopLinks = page.locator("header nav > div.md\\:flex");
        if (viewport.width < 768) {
          await expect(mobileToggle).toBeVisible();
          await expect(desktopLinks).toBeHidden();
        } else {
          await expect(mobileToggle).toBeHidden();
          await expect(desktopLinks).toBeVisible();
        }
      } finally {
        await context.close();
      }
    }
  });

  test("remains readable when the external display font is unavailable", async ({ browser }) => {
    for (const viewport of crossEngineViewports.filter(({ width }) => [320, 390, 768, 1366].includes(width))) {
      const { context, page } = await openResponsivePage(browser, viewport, {
        reducedMotion: true,
        blockExternalFonts: true,
      });
      try {
        await expectNoLayoutIssues(page, `fallback-font ${viewport.width}x${viewport.height}`);
      } finally {
        await context.close();
      }
    }
  });
});
