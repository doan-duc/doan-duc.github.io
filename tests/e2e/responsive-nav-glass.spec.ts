import { expect, test } from "@playwright/test";
import { openResponsivePage } from "./responsive-helpers";

/**
 * The header is a frosted-glass surface that materialises on scroll, with a
 * sliding pill marking the active section. Glass must never regress into a
 * transparent bar over scrolling text (no-backdrop-filter engines, reduced
 * transparency, forced colors), and the pill must follow the scroll-spy.
 */
test.describe("nav glass", () => {
  test("materialises on scroll and clears again at the top", async ({ browser }) => {
    const { context, page } = await openResponsivePage(browser, {
      name: "nav-glass-materialise",
      width: 1366,
      height: 768,
    });

    try {
      const glass = page.locator(".nav-glass");
      await expect(glass).toHaveCount(1);
      expect(
        await glass.evaluate((element) => Number(getComputedStyle(element).opacity)),
        "transparent over the hero",
      ).toBe(0);

      await page.mouse.wheel(0, 600);
      await expect
        .poll(() => glass.evaluate((element) => Number(getComputedStyle(element).opacity)))
        .toBeGreaterThan(0.95);

      const material = await glass.evaluate((element) => {
        const style = getComputedStyle(element);
        // The build may emit only the -webkit- prefixed property (LightningCSS
        // collapses the pair); every engine we ship to honours the alias.
        const standard = style.backdropFilter;
        const prefixed = style.getPropertyValue("-webkit-backdrop-filter");
        return {
          backdropFilter: standard !== "none" && standard !== "" ? standard : prefixed,
          borderBottom: style.borderBottomWidth,
        };
      });
      expect(material.backdropFilter, "frost is live at laptop widths").toContain("blur");
      expect(material.borderBottom).toBe("1px");

      // Scroll back the way a user does — wheel up until the top. (A direct
      // scrollTo would fight Lenis, which owns the scroll after the first
      // wheel event.)
      await expect
        .poll(
          async () => {
            await page.mouse.wheel(0, -1200);
            return page.evaluate(() => window.scrollY);
          },
          { timeout: 10_000 },
        )
        .toBe(0);
      await expect
        .poll(() => glass.evaluate((element) => Number(getComputedStyle(element).opacity)), {
          timeout: 8_000,
        })
        .toBe(0);
    } finally {
      await context.close();
    }
  });

  test("keeps an opaque surface under forced colors", async ({ browser, browserName }) => {
    test.skip(browserName !== "chromium", "forced-colors emulation runs once in Chromium");
    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      forcedColors: "active",
      colorScheme: "dark",
    });
    await context.route("**/fonts/**", (route) => route.abort());
    const page = await context.newPage();

    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.locator("main").waitFor({ state: "visible" });
      const surface = await page.locator(".nav-glass").evaluate((element) => {
        const style = getComputedStyle(element);
        const prefixed = style.getPropertyValue("-webkit-backdrop-filter") || "none";
        return {
          backdropFilter: style.backdropFilter === "" ? prefixed : style.backdropFilter,
          prefixed,
          background: style.backgroundColor === "rgba(0, 0, 0, 0)" ? style.backgroundImage : style.backgroundColor,
        };
      });
      expect(surface.backdropFilter, "no live blur under forced colors").toBe("none");
      expect(surface.prefixed, "no prefixed blur under forced colors").toBe("none");
      expect(surface.background, "opaque system surface").not.toBe("none");
    } finally {
      await context.close();
    }
  });

  test("opening the mobile menu does not shift the page", async ({ browser, browserName }) => {
    test.skip(browserName !== "chromium", "Scroll-lock geometry runs once in Chromium");
    // Non-touch narrow window: classic scrollbar platforms are where the body
    // scroll lock used to yank the layout sideways (scrollbar-gutter guards it).
    const { context, page } = await openResponsivePage(browser, {
      name: "nav-menu-shift",
      width: 900,
      height: 700,
    });

    try {
      const before = await page.evaluate(() => document.documentElement.clientWidth);
      await page.getByRole("button", { name: "Toggle menu" }).click();
      await page.getByRole("dialog", { name: "Navigation" }).waitFor();
      const after = await page.evaluate(() => document.documentElement.clientWidth);
      expect(after, "layout width must not change when the menu locks scroll").toBe(before);
    } finally {
      await context.close();
    }
  });

  test("slides the pill to the active section", async ({ browser, browserName }) => {
    test.skip(browserName !== "chromium", "pill geometry sampled once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "nav-glass-pill",
      width: 1366,
      height: 768,
    });

    try {
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
      });
      await page.evaluate(() => {
        document.getElementById("projects")!.scrollIntoView({ behavior: "instant", block: "center" });
      });

      const projectsLink = page
        .locator("[data-desktop-nav] button")
        .filter({ hasText: "Projects" });
      await expect(projectsLink).toHaveClass(/text-accent/);

      // Wait for the pill spring to settle, then check geometry.
      await page.waitForTimeout(700);
      const aligned = await page.evaluate(() => {
        const pill = document.querySelector('[data-desktop-nav] button [aria-hidden="true"]');
        const link = Array.from(
          document.querySelectorAll<HTMLElement>("[data-desktop-nav] button"),
        ).find((element) => element.textContent?.includes("Projects"));
        if (!pill || !link) return { ok: false, why: "missing pill or link" };
        const pillRect = pill.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        const overlap =
          pillRect.left < linkRect.right - 8 && pillRect.right > linkRect.left + 8;
        return { ok: overlap, why: JSON.stringify({ pillRect, linkRect }) };
      });
      expect(aligned.ok, `pill must sit under the active link: ${aligned.why}`).toBe(true);
    } finally {
      await context.close();
    }
  });
});
