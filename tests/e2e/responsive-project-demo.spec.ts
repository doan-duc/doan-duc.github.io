import { expect, test, type Page } from "@playwright/test";
import { openResponsivePage } from "./responsive-helpers";

/**
 * The project demo card is wrapped in a 3D tilt. When the tilt wrapper also
 * declared `transform-style: preserve-3d` it became a 3D rendering context
 * around a 3D-transformed child, and Chromium stopped hit-testing into that
 * child: hovering the card made its own trigger unclickable, so the demo could
 * not be opened at all. These tests pin that behaviour down at the point of
 * failure — with the tilt actually engaged, not with the card at rest.
 */
async function settleCard(page: Page, index: number) {
  const trigger = page.locator('button[aria-haspopup="dialog"]').nth(index);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await trigger.evaluate((element) =>
    element.scrollIntoView({ block: "center", inline: "center", behavior: "auto" }),
  );
  // Let the entrance reveal finish; mid-flight the card is still transformed.
  // Entrances are transform-only (word wipes own opacity) and clear their
  // transform on complete, so identity transform = fully settled.
  await page.waitForFunction(
    () => {
      const card = document.querySelector<HTMLElement>("[data-project-card]");
      if (!card) return false;
      const { transform, opacity } = getComputedStyle(card);
      return Number(opacity) > 0.99 && (transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)");
    },
    undefined,
    { timeout: 10_000 },
  );
  await page.waitForTimeout(600);
  return trigger;
}

test.describe("project demo", () => {
  for (const width of [1920, 1366, 1024]) {
    test(`opens while the card is hovered and tilted @${width}`, async ({
      browser,
      browserName,
    }) => {
      test.skip(browserName !== "chromium", "3D hit testing is a Chromium behaviour");
      const { context, page } = await openResponsivePage(browser, {
        name: `project-demo-${width}`,
        width,
        height: 800,
      });

      try {
        const trigger = await settleCard(page, 0);
        const box = (await trigger.boundingBox())!;
        const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

        // Approach and rest, so the tilt is fully engaged before pressing.
        await page.mouse.move(centre.x - 90, centre.y - 60);
        await page.mouse.move(centre.x, centre.y, { steps: 10 });
        await page.waitForTimeout(700);

        const state = await page.evaluate(
          ({ x0, y0, w, h }) => {
            let clickable = 0;
            for (let row = 0; row < 5; row += 1) {
              for (let col = 0; col < 10; col += 1) {
                const element = document.elementFromPoint(
                  x0 + (w * (col + 0.5)) / 10,
                  y0 + (h * (row + 0.5)) / 5,
                );
                if (element?.closest('button[aria-haspopup="dialog"]')) clickable += 1;
              }
            }
            const surface = document.querySelector<HTMLElement>(
              "[data-project-card] [data-tilt-surface]",
            );
            return {
              clickableRatio: clickable / 50,
              tilted: surface ? getComputedStyle(surface).transform !== "none" : false,
            };
          },
          { x0: box.x, y0: box.y, w: box.width, h: box.height },
        );

        expect(state.tilted, "the card must actually be tilted for this to be a real test").toBe(
          true,
        );
        expect(
          state.clickableRatio,
          "a hovered demo card must stay hit-testable across its own surface",
        ).toBeGreaterThan(0.8);

        await page.mouse.down();
        await page.mouse.up();
        await expect(page.locator("dialog[open]")).toBeVisible();

        const video = page.locator("dialog[open] video");
        await expect(video).toBeVisible();
        expect(
          await video.evaluate((element: HTMLVideoElement) => element.error),
          "the demo video must load",
        ).toBeNull();
      } finally {
        await context.close();
      }
    });
  }

  test("animates open and settles fully visible", async ({ browser, browserName }) => {
    test.skip(browserName !== "chromium", "Transition sampling runs once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "project-demo-animation",
      width: 1366,
      height: 768,
    });

    try {
      const trigger = await settleCard(page, 0);
      await trigger.press("Enter");
      const dialog = page.locator("dialog[open]");
      await expect(dialog).toBeVisible();

      const policy = await dialog.evaluate((element) => ({
        transitionProperty: getComputedStyle(element).transitionProperty,
        transitionDuration: getComputedStyle(element).transitionDuration,
        backdropTransition: getComputedStyle(element, "::backdrop").transitionProperty,
      }));
      expect(policy.transitionProperty, "dialog transitions opacity+transform").toContain("opacity");
      expect(policy.transitionDuration).toContain("0.5s");
      expect(policy.backdropTransition, "backdrop fades in").toContain("background");

      // The entrance must resolve to fully-visible, untransformed.
      await expect
        .poll(() => dialog.evaluate((element) => Number(getComputedStyle(element).opacity)))
        .toBeGreaterThan(0.99);
      await expect
        .poll(() => dialog.evaluate((element) => getComputedStyle(element).transform))
        .toBe("none");

      // Close animates out and actually closes.
      await dialog.getByRole("button", { name: "Close" }).click();
      await expect(page.locator("dialog[open]")).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test("opens instantly under reduced motion", async ({ browser, browserName }) => {
    test.skip(browserName !== "chromium", "Reduced-motion transition check runs once in Chromium");
    const { context, page } = await openResponsivePage(
      browser,
      { name: "project-demo-reduced", width: 1366, height: 768 },
      { reducedMotion: true },
    );

    try {
      const trigger = page.locator('button[aria-haspopup="dialog"]').first();
      await trigger.scrollIntoViewIfNeeded();
      await trigger.press("Enter");
      const dialog = page.locator("dialog[open]");
      await expect(dialog).toBeVisible();
      const duration = await dialog.evaluate(
        (element) => getComputedStyle(element).transitionDuration,
      );
      expect(
        duration.split(",").every((value) => Number.parseFloat(value) < 0.01),
        `reduced motion must flatten the dialog transition (got ${duration})`,
      ).toBe(true);
      await dialog.getByRole("button", { name: "Close" }).click();
      await expect(page.locator("dialog[open]")).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test("opens from a touch tap once the card has landed", async ({ browser, browserName }) => {
    test.skip(browserName !== "chromium", "Touch emulation runs once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "project-demo-touch",
      width: 390,
      height: 844,
      mobile: true,
      touch: true,
      dpr: 3,
    });

    try {
      const trigger = await settleCard(page, 0);
      const box = (await trigger.boundingBox())!;
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await expect(page.locator("dialog[open]")).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
