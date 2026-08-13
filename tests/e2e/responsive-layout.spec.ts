import { expect, test } from "@playwright/test";
import {
  collectLayoutIssues,
  crossEngineViewports,
  expectNoLayoutIssues,
  heightSweep,
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

  test("has no hidden overflow across short and tall viewport heights", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "The continuous height sweep runs once in Chromium");
    test.slow();

    const { context, page } = await openResponsivePage(
      browser,
      { name: "height-sweep", width: 320, height: 320 },
      { reducedMotion: true },
    );
    const failures: string[] = [];

    try {
      for (const width of [320, 390, 667, 844, 1023, 1024, 1366, 2560]) {
        for (const height of heightSweep()) {
          await page.setViewportSize({ width, height });
          await settleLayout(page);
          const layoutIssues = await collectLayoutIssues(page);
          if (layoutIssues.length > 0) {
            failures.push(`${width}x${height}: ${layoutIssues.join(" | ")}`);
          }
        }
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
      const { context, page } = await openResponsivePage(browser, viewport);
      try {
        await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" }));
        await page.waitForTimeout(1_500);
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
        await page.waitForTimeout(100);
        await expectNoLayoutIssues(page, `${viewport.name} ${viewport.width}x${viewport.height}`);

        const mobileToggle = page.getByRole("button", { name: "Toggle menu" });
        const desktopLinks = page.locator("[data-desktop-nav]");
        if (viewport.width < 1024) {
          await expect(mobileToggle).toBeVisible();
          await expect(desktopLinks).toBeHidden();
        } else {
          await expect(mobileToggle).toBeHidden();
          await expect(desktopLinks).toBeVisible();

          const brandBox = await page.getByRole("button", { name: "Back to top" }).boundingBox();
          const linksBox = await desktopLinks.boundingBox();
          expect(brandBox).not.toBeNull();
          expect(linksBox).not.toBeNull();
          expect(
            brandBox!.x + brandBox!.width + 16,
            `${viewport.name}: desktop navigation must not overlap the brand`,
          ).toBeLessThanOrEqual(linksBox!.x);
        }
      } finally {
        await context.close();
      }
    }
  });

  test("stays in bounds through live phone and tablet orientation changes", async ({
    browser,
  }) => {
    for (const device of [
      {
        name: "phone",
        initial: { width: 390, height: 844 },
        rotated: { width: 844, height: 390 },
        dpr: 3,
        mobile: true,
      },
      {
        name: "tablet",
        initial: { width: 820, height: 1180 },
        rotated: { width: 1180, height: 820 },
        dpr: 2,
        mobile: false,
      },
    ]) {
      const { context, page } = await openResponsivePage(browser, {
        name: `${device.name}-orientation`,
        ...device.initial,
        mobile: device.mobile,
        touch: true,
        dpr: device.dpr,
      });
      try {
        for (const viewport of [device.initial, device.rotated, device.initial]) {
          await page.setViewportSize(viewport);
          await page.waitForTimeout(180);
          await settleLayout(page);
          await expectNoLayoutIssues(
            page,
            `${device.name} orientation ${viewport.width}x${viewport.height}`,
          );
          await expect(page.locator("#featured")).toHaveAttribute(
            "data-featured-motion",
            "flow",
          );
          await expect(page.locator(".pin-spacer")).toHaveCount(0);
        }
      } finally {
        await context.close();
      }
    }
  });

  test("keeps every animated section in bounds after scroll reveals", async ({ browser }) => {
    test.slow();
    const animatedViewports = crossEngineViewports.filter(({ name }) =>
      [
        "modern-phone",
        "large-phone-landscape",
        "tablet-landscape",
        "laptop",
        "large-desktop",
      ].includes(name),
    );

    for (const viewport of animatedViewports) {
      const { context, page } = await openResponsivePage(browser, viewport);
      try {
        for (const sectionId of [
          "about",
          "featured",
          "projects",
          "skills",
          "achievements",
          "contact",
        ]) {
          await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
          await page.evaluate(
            () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
          );
          await expectNoLayoutIssues(
            page,
            `${viewport.name} animated #${sectionId}`,
          );
        }
      } finally {
        await context.close();
      }
    }
  });

  test("pinned research content is never clipped vertically on short desktops", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Pinned-stage geometry runs once in Chromium");
    // The layout audit only detects horizontal issues; the pinned stage is the
    // one place where vertical clipping bit real 600–768px-tall machines.
    for (const viewport of [
      { name: "min-pin-height", width: 1366, height: 641 },
      { name: "short-laptop", width: 1280, height: 720 },
      { name: "win-125", width: 1093, height: 614, dpr: 1.25 },
    ]) {
      const { context, page } = await openResponsivePage(browser, viewport);
      try {
        const mode = await page
          .locator("#featured")
          .getAttribute("data-featured-motion");
        if (mode !== "pinned") continue; // gate says flow — nothing to clip

        await page.evaluate(() => {
          document.documentElement.style.scrollBehavior = "auto";
          document.getElementById("featured")!.scrollIntoView({ behavior: "instant" });
        });
        await page.waitForTimeout(400);

        const clipped = await page.evaluate(() => {
          const section = document.getElementById("featured")!;
          const sectionRect = section.getBoundingClientRect();
          const offenders: string[] = [];
          // Foreground phase copy must sit inside the section's vertical box.
          for (const node of section.querySelectorAll<HTMLElement>(
            "[data-phase] p, [data-phase] .text-sm",
          )) {
            const rect = node.getBoundingClientRect();
            if (rect.height === 0) continue; // hidden inactive panel
            if (rect.top < sectionRect.top - 1 || rect.bottom > sectionRect.bottom + 1) {
              offenders.push(
                `${node.tagName}@${Math.round(rect.top)}..${Math.round(rect.bottom)} vs section ${Math.round(sectionRect.top)}..${Math.round(sectionRect.bottom)}`,
              );
            }
          }
          return offenders;
        });
        expect(clipped, `${viewport.name}: phase copy escapes the pinned stage`).toEqual([]);
      } finally {
        await context.close();
      }
    }
  });

  test("remains readable when the display font is unavailable", async ({ browser }) => {
    for (const viewport of crossEngineViewports.filter(({ width }) => [320, 390, 768, 1366, 1920].includes(width))) {
      const { context, page } = await openResponsivePage(browser, viewport, {
        reducedMotion: true,
        blockExternalFonts: true,
      });
      try {
        await expectNoLayoutIssues(page, `fallback-font ${viewport.width}x${viewport.height}`);

        // Each hero name line sits inside a single-line overflow mask; if the
        // fallback face runs wider than Clash Display the name wraps inside
        // the mask and the reveal breaks. The metric-adjusted fallbacks must
        // keep every line to one line box.
        const heroLines = page.locator("[data-hero-line]");
        const lineCount = await heroLines.count();
        expect(lineCount).toBeGreaterThan(0);
        for (let index = 0; index < lineCount; index += 1) {
          const single = await heroLines.nth(index).evaluate((element) => {
            const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight);
            return element.getClientRects().length <= 1 || element.scrollHeight <= lineHeight * 1.4;
          });
          expect(single, `hero line ${index} must not wrap under fallback metrics`).toBe(true);
        }
      } finally {
        await context.close();
      }
    }
  });

  test("loads every rendered image at phone and desktop widths", async ({ browser }) => {
    test.slow();
    const verifiedSources = new Set<string>();

    for (const viewport of crossEngineViewports.filter(({ width }) => [390, 1366].includes(width))) {
      const { context, page } = await openResponsivePage(browser, viewport, {
        reducedMotion: true,
      });

      try {
        const images = page.locator("img");
        const failures: string[] = [];
        for (let index = 0; index < (await images.count()); index += 1) {
          const image = images.nth(index);
          if (await image.isVisible()) {
            await image.scrollIntoViewIfNeeded();
            await expect(image).toHaveJSProperty("complete", true);
          }
          const state = await image.evaluate((element) => {
            const imageElement = element as HTMLImageElement;
            return {
              alt: imageElement.alt,
              currentSrc: imageElement.currentSrc || imageElement.src,
              naturalHeight: imageElement.naturalHeight,
              naturalWidth: imageElement.naturalWidth,
            };
          });

          if (!state.currentSrc) {
            failures.push(`${state.alt || "decorative image"}: ${JSON.stringify(state)}`);
            continue;
          }

          if (!verifiedSources.has(state.currentSrc)) {
            const response = await context.request.get(state.currentSrc);
            if (!response.ok() || !response.headers()["content-type"]?.startsWith("image/")) {
              failures.push(
                `${state.currentSrc}: HTTP ${response.status()} ${response.headers()["content-type"] ?? "no content type"}`,
              );
            }
            verifiedSources.add(state.currentSrc);
            await response.dispose();
          }

          if (
            (await image.isVisible()) &&
            (state.naturalWidth < 1 || state.naturalHeight < 1)
          ) {
            failures.push(`${state.alt || "decorative image"}: ${JSON.stringify(state)}`);
          }
        }
        expect(failures, `${viewport.name}\n${failures.join("\n")}`).toEqual([]);
      } finally {
        await context.close();
      }
    }
  });
});
