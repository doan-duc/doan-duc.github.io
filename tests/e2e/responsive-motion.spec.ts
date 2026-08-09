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
    } finally {
      await context.close();
    }
  });
});
