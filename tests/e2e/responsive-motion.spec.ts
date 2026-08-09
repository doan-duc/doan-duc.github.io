import { expect, test } from "@playwright/test";
import { openResponsivePage } from "./responsive-helpers";

test.describe("responsive motion policies", () => {
  test("@smoke avoids pinned research on short, touch, or tablet-class viewports", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Pin policy is exercised once in Chromium");
    const constrained = [
      { name: "tablet-short", width: 768, height: 480, touch: true },
      { name: "phone-landscape", width: 844, height: 390, mobile: true, touch: true, dpr: 3 },
      { name: "split-screen", width: 1024, height: 600, touch: true, dpr: 2 },
    ];

    for (const viewport of constrained) {
      const { context, page } = await openResponsivePage(browser, viewport);
      try {
        await page.locator("#featured").scrollIntoViewIfNeeded();
        await page.evaluate(() => new Promise((resolve) => window.setTimeout(resolve, 150)));
        const overflow = await page.locator("#featured").evaluate(
          (section) => getComputedStyle(section).overflowY,
        );
        expect(overflow, `${viewport.name}: Featured Research must expand vertically`).not.toBe("hidden");
        await expect(page.locator(".pin-spacer")).toHaveCount(0);
      } finally {
        await context.close();
      }
    }
  });

  test("honors reduced motion for scrolling, marquee, and decorative animation", async ({ browser }) => {
    const { context, page } = await openResponsivePage(
      browser,
      { name: "reduced-motion", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
      { reducedMotion: true },
    );

    try {
      const styles = await page.evaluate(() => {
        const marquee = document.querySelector<HTMLElement>(".marquee-track");
        const ecg = document.querySelector<HTMLElement>(".ecg-animate");
        return {
          scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
          marqueeAnimation: marquee ? getComputedStyle(marquee).animationName : null,
          marqueeTransform: marquee ? getComputedStyle(marquee).transform : null,
          ecgAnimation: ecg ? getComputedStyle(ecg).animationName : null,
        };
      });
      expect(styles.scrollBehavior).toBe("auto");
      expect(styles.marqueeAnimation).toBe("none");
      expect(styles.marqueeTransform).toBe("none");
      expect(styles.ecgAnimation).toBe("none");

      const aboutInstrument = page.locator("[data-about-signal-stack]");
      const systemLayer = page.locator('[data-about-layer="system"]');
      await aboutInstrument.scrollIntoViewIfNeeded();
      const layerTransformBefore = await systemLayer.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      await aboutInstrument.hover();
      const layerTransformAfter = await systemLayer.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      expect(layerTransformAfter).toBe(layerTransformBefore);

      const selectedWork = page.getByRole("button", { name: "Selected work" });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
      const magneticWrapper = selectedWork.locator("..");
      const magneticTransformBefore = await magneticWrapper.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      const selectedWorkBox = await selectedWork.boundingBox();
      expect(selectedWorkBox).not.toBeNull();
      await page.mouse.move(selectedWorkBox!.x + 4, selectedWorkBox!.y + 4);
      const magneticTransformAfter = await magneticWrapper.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      expect(magneticTransformAfter).toBe(magneticTransformBefore);
    } finally {
      await context.close();
    }
  });

  test("stops desktop smooth scrolling when reduced motion changes at runtime", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Runtime preference changes run once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "desktop-runtime-motion",
      width: 1366,
      height: 768,
    });

    try {
      await expect
        .poll(() => page.evaluate(() => document.documentElement.classList.contains("lenis")))
        .toBe(true);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.classList.contains("lenis")))
        .toBe(false);
      expect(
        await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
      ).toBe("auto");
    } finally {
      await context.close();
    }
  });
});
