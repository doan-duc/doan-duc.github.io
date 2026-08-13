import { expect, test, type Page } from "@playwright/test";
import { openResponsivePage } from "./responsive-helpers";

/**
 * Body copy reveals word by word, scrubbed to scroll position rather than
 * triggered once, so scrolling back up un-reveals it again. Sections below the
 * pinned research block are the interesting case: their triggers must refresh
 * after the pin resolves, or they inherit stale geometry and sit permanently
 * lit — which is exactly how this shipped broken the first time.
 */
const sections = ["about", "projects", "skills", "achievements"] as const;

async function litWords(page: Page, sectionId: string, fraction: number) {
  await page.evaluate(
    ({ id, frac }) => {
      const section = document.getElementById(id)!;
      const block = section.querySelector("[data-reveal-word]")!.parentElement!;
      const rect = block.getBoundingClientRect();
      const docTop = rect.top + window.scrollY;
      const from = docTop - window.innerHeight * 0.95;
      const to = docTop + rect.height - window.innerHeight * 0.55;
      window.scrollTo({ top: Math.max(0, from + (to - from) * frac), behavior: "instant" });
    },
    { id: sectionId, frac: fraction },
  );
  await page.waitForTimeout(400);
  return page.evaluate((id) => {
    const section = document.getElementById(id)!;
    const block = section.querySelector("[data-reveal-word]")!.parentElement!;
    const words = Array.from(block.querySelectorAll("[data-reveal-word]"));
    return {
      lit: words.filter((word) => Number(getComputedStyle(word).opacity) > 0.9).length,
      total: words.length,
    };
  }, sectionId);
}

test.describe("scroll word reveal", () => {
  test("every prose section reveals with scroll and reverses on the way back", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Scroll-position sampling runs once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "scroll-reveal",
      width: 1366,
      height: 768,
    });

    try {
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
      });

      for (const sectionId of sections) {
        const before = await litWords(page, sectionId, 0);
        const middle = await litWords(page, sectionId, 0.6);
        const after = await litWords(page, sectionId, 1);
        const back = await litWords(page, sectionId, 0);

        expect(before.total, `${sectionId}: expected reveal words`).toBeGreaterThan(3);
        expect(before.lit, `${sectionId}: rests unread before its scroll range`).toBe(0);
        expect(
          middle.lit,
          `${sectionId}: partially revealed mid-range, not all-or-nothing`,
        ).toBeGreaterThan(0);
        expect(middle.lit, `${sectionId}: mid-range must not be fully lit`).toBeLessThan(
          middle.total,
        );
        expect(after.lit, `${sectionId}: fully revealed at the end of its range`).toBeGreaterThan(
          after.total * 0.8,
        );
        expect(back.lit, `${sectionId}: scrolling back up un-reveals`).toBe(0);
      }
    } finally {
      await context.close();
    }
  });

  test("reduced motion ships plain readable copy", async ({ browser }) => {
    const { context, page } = await openResponsivePage(
      browser,
      { name: "scroll-reveal-reduced", width: 1366, height: 768 },
      { reducedMotion: true },
    );
    try {
      const opacities = await page.evaluate(() =>
        Array.from(document.querySelectorAll("[data-reveal-word]"))
          .slice(0, 40)
          .map((word) => Number(getComputedStyle(word).opacity)),
      );
      expect(opacities.length, "reveal markup still ships").toBeGreaterThan(0);
      expect(
        Math.min(...opacities),
        "no word may be left dimmed when motion is reduced",
      ).toBeGreaterThan(0.9);
    } finally {
      await context.close();
    }
  });
});
