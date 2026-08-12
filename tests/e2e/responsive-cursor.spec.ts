import { expect, test, type Locator, type Page } from "@playwright/test";
import { openResponsivePage } from "./responsive-helpers";

type Point = { x: number; y: number };

declare global {
  interface Window {
    __cursorMotionFrames?: Array<{ dot: Point; ring: Point }>;
    __cursorPulseFrames?: Array<{
      opacity: number;
      transform: string;
    } | null>;
    __cursorHotPathAudit?: {
      active: boolean;
      boundingRectCalls: number;
      matchMediaCalls: number;
      childListMutations: number;
    };
  }
}

async function centerOf(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
}

function distance(left: Point, right: Point) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

async function expectCursorLabel(page: Page, target: Locator, label: string) {
  await target.scrollIntoViewIfNeeded();
  await target.hover();

  const cursorLabel = page.locator("[data-cursor-label]");
  await expect(cursorLabel).toHaveText(label);
  await expect
    .poll(() => cursorLabel.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.5);
}

test.describe("signal cursor", () => {
  test("renders an inert fine-pointer overlay while preserving native text selection", async ({
    browser,
  }) => {
    const { context, page } = await openResponsivePage(browser, {
      name: "fine-pointer-cursor",
      width: 1366,
      height: 768,
    });

    try {
      const cursor = page.locator("[data-signal-cursor]");
      await expect(cursor).toHaveCount(1);
      await expect(cursor).toHaveAttribute("aria-hidden", "true");

      const policy = await page.evaluate(() => {
        const overlay = document.querySelector<HTMLElement>("[data-signal-cursor]");
        const paragraph = document.querySelector<HTMLElement>("main p");
        const interactive = document.querySelector<HTMLElement>("main button, main a");
        return {
          overlayPointerEvents: overlay ? getComputedStyle(overlay).pointerEvents : null,
          overlayPosition: overlay ? getComputedStyle(overlay).position : null,
          bodyCursor: getComputedStyle(document.body).cursor,
          paragraphCursor: paragraph ? getComputedStyle(paragraph).cursor : null,
          interactiveCursor: interactive ? getComputedStyle(interactive).cursor : null,
        };
      });

      expect(policy.overlayPointerEvents).toBe("none");
      expect(policy.overlayPosition).toBe("fixed");
      expect(policy.bodyCursor).toBe("none");
      expect(policy.interactiveCursor).toBe("none");
      expect(policy.paragraphCursor).toBe("text");
    } finally {
      await context.close();
    }
  });

  test("moves the dot accurately and lets the ring follow through intermediate frames", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Frame-level pointer timing runs once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "fine-pointer-follow",
      width: 1366,
      height: 768,
    });

    try {
      const dot = page.locator("[data-cursor-dot]");
      const ring = page.locator("[data-cursor-ring]");
      await expect(dot).toHaveCount(1);
      await expect(ring).toHaveCount(1);

      const start = { x: 120, y: 150 };
      const finish = { x: 1110, y: 590 };
      await page.mouse.move(start.x, start.y);
      await expect.poll(async () => distance(await centerOf(ring), start)).toBeLessThan(24);

      await page.evaluate(() => {
        window.__cursorMotionFrames = [];
        let remaining = 20;
        const sample = () => {
          const dotElement = document.querySelector<HTMLElement>("[data-cursor-dot]");
          const ringElement = document.querySelector<HTMLElement>("[data-cursor-ring]");
          if (dotElement && ringElement) {
            const dotRect = dotElement.getBoundingClientRect();
            const ringRect = ringElement.getBoundingClientRect();
            window.__cursorMotionFrames?.push({
              dot: {
                x: dotRect.left + dotRect.width / 2,
                y: dotRect.top + dotRect.height / 2,
              },
              ring: {
                x: ringRect.left + ringRect.width / 2,
                y: ringRect.top + ringRect.height / 2,
              },
            });
          }
          remaining -= 1;
          if (remaining > 0) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });

      await page.mouse.move(finish.x, finish.y);
      await expect
        .poll(() => page.evaluate(() => window.__cursorMotionFrames?.length ?? 0))
        .toBe(20);

      const frames = await page.evaluate(() => window.__cursorMotionFrames ?? []);
      const ringPositions = frames.map(({ ring: point }) => `${Math.round(point.x)},${Math.round(point.y)}`);
      const ringDistances = frames.map(({ ring: point }) => distance(point, finish));
      const finalDot = frames.at(-1)!.dot;
      const finalRing = frames.at(-1)!.ring;

      expect(distance(finalDot, finish), "dot must resolve to the actual pointer position").toBeLessThan(12);
      expect(new Set(ringPositions).size, "ring should visibly interpolate instead of jumping").toBeGreaterThanOrEqual(5);
      expect(ringDistances[0], "ring should begin behind the dot").toBeGreaterThan(80);
      expect(ringDistances.at(-1)!, "ring should converge toward the pointer").toBeLessThan(ringDistances[0] * 0.25);
      expect(distance(finalRing, finish), "ring should settle close to the pointer").toBeLessThan(28);
    } finally {
      await context.close();
    }
  });

  test("shows VIEW, PLAY, and OPEN context labels on their matching targets", async ({
    browser,
  }) => {
    const { context, page } = await openResponsivePage(browser, {
      name: "cursor-context-labels",
      width: 1366,
      height: 768,
    });

    try {
      await expectCursorLabel(
        page,
        page.locator("[data-project-card]").first().getByRole("heading", { level: 3 }),
        "VIEW",
      );
      await expectCursorLabel(
        page,
        page.locator('button[aria-haspopup="dialog"]').first(),
        "PLAY",
      );
      await expectCursorLabel(page, page.locator("[data-hust-affiliation]"), "OPEN ↗");
      await expectCursorLabel(page, page.locator("[data-edabk-affiliation]"), "OPEN ↗");
    } finally {
      await context.close();
    }
  });

  test("emits a short visual pulse at the click point", async ({ browser, browserName }) => {
    test.skip(browserName !== "chromium", "Click animation sampling runs once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "cursor-click-pulse",
      width: 1366,
      height: 768,
    });

    try {
      await page.mouse.move(640, 360);
      await page.evaluate(() => {
        window.__cursorPulseFrames = [];
        let remaining = 22;
        const sample = () => {
          const pulse = document.querySelector<HTMLElement>("[data-cursor-pulse]");
          window.__cursorPulseFrames?.push(
            pulse
              ? {
                  opacity: Number.parseFloat(getComputedStyle(pulse).opacity),
                  transform: getComputedStyle(pulse).transform,
                }
              : null,
          );
          remaining -= 1;
          if (remaining > 0) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });

      await page.mouse.down();
      await page.mouse.up();
      await expect
        .poll(() => page.evaluate(() => window.__cursorPulseFrames?.length ?? 0))
        .toBe(22);

      const frames = (await page.evaluate(() => window.__cursorPulseFrames ?? [])).filter(
        (frame): frame is NonNullable<typeof frame> => frame !== null,
      );
      const signatures = frames.map(
        ({ opacity, transform }) => `${opacity.toFixed(3)}:${transform}`,
      );
      expect(frames.length, "the pulse should be present during click feedback").toBeGreaterThan(2);
      expect(Math.max(...frames.map(({ opacity }) => opacity)), "pulse should become visible").toBeGreaterThan(0.1);
      expect(new Set(signatures).size, "pulse should expand or fade over time").toBeGreaterThanOrEqual(3);
    } finally {
      await context.close();
    }
  });

  test("does not render the custom cursor for reduced motion or coarse touch input", async ({
    browser,
  }) => {
    const reduced = await openResponsivePage(
      browser,
      { name: "reduced-fine-pointer", width: 1366, height: 768 },
      { reducedMotion: true },
    );
    try {
      await expect(reduced.page.locator("[data-signal-cursor]")).toHaveCount(0);
      expect(await reduced.page.evaluate(() => getComputedStyle(document.body).cursor)).not.toBe("none");
    } finally {
      await reduced.context.close();
    }

    const coarse = await openResponsivePage(browser, {
      name: "coarse-touch-cursor",
      width: 390,
      height: 844,
      mobile: true,
      touch: true,
      dpr: 3,
    });
    try {
      expect(
        await coarse.page.evaluate(() => matchMedia("(any-pointer: coarse)").matches),
        "fixture must expose coarse pointer capability",
      ).toBe(true);
      await expect(coarse.page.locator("[data-signal-cursor]")).toHaveCount(0);
      expect(await coarse.page.evaluate(() => getComputedStyle(document.body).cursor)).not.toBe("none");
    } finally {
      await coarse.context.close();
    }
  });

  test("stays out of layout and avoids media or geometry reads in the pointer hot path", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Pointer hot-path instrumentation runs once in Chromium");
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    await context.addInitScript(() => {
      window.__cursorHotPathAudit = {
        active: false,
        boundingRectCalls: 0,
        matchMediaCalls: 0,
        childListMutations: 0,
      };

      const nativeBoundingRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
        if (window.__cursorHotPathAudit?.active) {
          window.__cursorHotPathAudit.boundingRectCalls += 1;
        }
        return nativeBoundingRect.call(this);
      };

      const nativeMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query) => {
        if (window.__cursorHotPathAudit?.active) {
          window.__cursorHotPathAudit.matchMediaCalls += 1;
        }
        return nativeMatchMedia(query);
      };
    });
    await context.route("https://api.fontshare.com/**", (route) => route.abort());
    const page = await context.newPage();

    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.locator("main").waitFor({ state: "visible" });
      await expect(page.locator("[data-signal-cursor]")).toHaveCount(1);

      const audit = await page.evaluate(async () => {
        const cursor = document.querySelector<HTMLElement>("[data-signal-cursor]")!;
        const observer = new MutationObserver((records) => {
          if (!window.__cursorHotPathAudit?.active) return;
          window.__cursorHotPathAudit.childListMutations += records.filter(
            ({ type }) => type === "childList",
          ).length;
        });
        observer.observe(cursor, { childList: true, subtree: true });

        window.__cursorHotPathAudit!.active = true;
        for (let index = 0; index < 120; index += 1) {
          window.dispatchEvent(
            new PointerEvent("pointermove", {
              bubbles: true,
              clientX: 80 + (index % 60) * 8,
              clientY: 180 + (index % 24) * 5,
              pointerType: "mouse",
            }),
          );
        }
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        window.__cursorHotPathAudit!.active = false;
        observer.disconnect();
        return { ...window.__cursorHotPathAudit! };
      });

      expect(audit.boundingRectCalls, "cursor geometry should be cached or unnecessary").toBeLessThanOrEqual(2);
      expect(audit.matchMediaCalls, "pointer capability must be subscribed once, not queried per move").toBeLessThanOrEqual(1);
      expect(audit.childListMutations, "pointer movement must not recreate cursor nodes").toBe(0);

      for (const point of [
        { x: 1, y: 1 },
        { x: 1365, y: 767 },
      ]) {
        await page.mouse.move(point.x, point.y);
      }
      const overflow = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(overflow.scrollWidth).toBe(overflow.clientWidth);
    } finally {
      await context.close();
    }
  });
});
