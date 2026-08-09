import { expect, test } from "@playwright/test";
import {
  openResponsivePage,
  shortLandscapeViewports,
  visibleLocator,
} from "./responsive-helpers";

test.describe("responsive interactions", () => {
  test("@smoke keeps the mobile menu reachable, locked, and reset across breakpoints", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Detailed touch interaction runs in Chromium");

    for (const viewport of shortLandscapeViewports) {
      const { context, page } = await openResponsivePage(browser, viewport, {
        reducedMotion: true,
      });
      try {
        const toggle = page.getByRole("button", { name: "Toggle menu" });
        const toggleBox = await toggle.boundingBox();
        expect(toggleBox, `${viewport.name}: menu toggle must be measurable`).not.toBeNull();
        expect(toggleBox!.width, `${viewport.name}: menu toggle width`).toBeGreaterThanOrEqual(44);
        expect(toggleBox!.height, `${viewport.name}: menu toggle height`).toBeGreaterThanOrEqual(44);

        await toggle.tap();
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        const aboutButton = await visibleLocator(page, "button", "About");
        const menu = aboutButton.locator("..");
        await expect(menu).toHaveAttribute("role", "dialog");
        await expect(menu).toHaveAttribute("aria-label", "Navigation");
        const menuMetrics = await menu.evaluate((element) => {
          const style = getComputedStyle(element);
          const children = [...element.querySelectorAll<HTMLElement>("button, a")]
            .filter((child) => child.getBoundingClientRect().width > 0)
            .map((child) => {
              const rect = child.getBoundingClientRect();
              return { label: child.textContent?.trim(), top: rect.top, bottom: rect.bottom };
            });
          return {
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
            overflowY: style.overflowY,
            children,
          };
        });
        const unreachable = menuMetrics.children.filter(
          ({ top, bottom }) => top < 0 || bottom > viewport.height,
        );
        const scrollable = ["auto", "scroll"].includes(menuMetrics.overflowY);
        expect(
          unreachable.length === 0 || scrollable,
          `${viewport.name}: menu items outside the viewport must remain scrollable: ${JSON.stringify(unreachable)}`,
        ).toBe(true);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).overflowY),
          `${viewport.name}: background must be scroll-locked while the menu is open`,
        ).toBe("hidden");

        await page.keyboard.press("Escape");
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
        await expect(toggle).toBeFocused();

        await toggle.tap();
        await page.setViewportSize({ width: 1024, height: viewport.height });
        await page.setViewportSize({ width: 1023, height: viewport.height });
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
      } finally {
        await context.close();
      }
    }
  });

  test("keeps icon-only touch targets at least 44 by 44 CSS pixels", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Touch target dimensions run once in Chromium");
    const { context, page } = await openResponsivePage(
      browser,
      { name: "touch-targets", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
      { reducedMotion: true },
    );

    try {
      await page.locator("footer").scrollIntoViewIfNeeded();
      const targets = page.locator('button[aria-label], footer a[aria-label]');
      const undersized: string[] = [];
      for (let index = 0; index < (await targets.count()); index += 1) {
        const target = targets.nth(index);
        if (!(await target.isVisible())) continue;
        const box = await target.boundingBox();
        if (!box || box.width < 44 || box.height < 44) {
          undersized.push(
            `${await target.getAttribute("aria-label")}: ${box?.width ?? 0}x${box?.height ?? 0}`,
          );
        }
      }
      expect(undersized, undersized.join("\n")).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test("@smoke keeps project video dialogs and controls inside short landscape screens", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Native video control geometry runs in Chromium");

    for (const viewport of shortLandscapeViewports) {
      const { context, page } = await openResponsivePage(browser, viewport, {
        reducedMotion: true,
      });
      try {
        const trigger = page.locator('button[aria-haspopup="dialog"]').first();
        await trigger.scrollIntoViewIfNeeded();
        await trigger.click();
        const dialog = page.locator("dialog[open]");
        await expect(dialog).toBeVisible();
        const metrics = await dialog.evaluate((element) => {
          const dialogRect = element.getBoundingClientRect();
          const videoRect = element.querySelector("video")?.getBoundingClientRect();
          const closeRect = element.querySelector("button")?.getBoundingClientRect();
          return {
            dialogTop: dialogRect.top,
            dialogBottom: dialogRect.bottom,
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
            videoBottom: videoRect?.bottom ?? 0,
            closeWidth: closeRect?.width ?? 0,
            closeHeight: closeRect?.height ?? 0,
          };
        });
        expect(metrics.dialogTop, `${viewport.name}: dialog top`).toBeGreaterThanOrEqual(0);
        expect(metrics.dialogBottom, `${viewport.name}: dialog bottom`).toBeLessThanOrEqual(viewport.height);
        expect(metrics.scrollHeight, `${viewport.name}: dialog content must not be clipped`).toBeLessThanOrEqual(
          metrics.clientHeight + 1,
        );
        expect(metrics.videoBottom, `${viewport.name}: native video controls must remain visible`).toBeLessThanOrEqual(
          metrics.dialogBottom + 1,
        );
        expect(metrics.closeWidth).toBeGreaterThanOrEqual(44);
        expect(metrics.closeHeight).toBeGreaterThanOrEqual(44);

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
      } finally {
        await context.close();
      }
    }
  });
});
