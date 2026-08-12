import { expect, test, type Locator, type Page } from "@playwright/test";
import { openResponsivePage } from "./responsive-helpers";

type Point = { x: number; y: number };

declare global {
  interface Window {
    __cursorMotionFrames?: Array<{ dot: Point; ring: Point }>;
      __cursorPulseFrames?: Array<{
      opacity: number;
      transform: string;
      center: Point;
    } | null>;
    __cursorHotPathAudit?: {
      active: boolean;
      boundingRectCalls: number;
      matchMediaCalls: number;
      childListMutations: number;
      dotStyleMutations: number;
      projectQuerySelectorCalls: number;
    };
    __cursorIdleMutationCount?: number;
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
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const deadline = performance.now() + 2_000;
        let previousY = window.scrollY;
        let stableFrames = 0;
        const sample = () => {
          const currentY = window.scrollY;
          stableFrames = Math.abs(currentY - previousY) < 0.25 ? stableFrames + 1 : 0;
          previousY = currentY;
          if (stableFrames >= 4 || performance.now() >= deadline) resolve();
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }),
  );
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
      await page.mouse.move(40, 180);
      await expect(page.locator("html")).toHaveAttribute("data-signal-cursor-active", "");

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

      const mediaPolicy = await page.evaluate(() => ({
        forcedColorsActive: matchMedia("(forced-colors: active)").matches,
        forcedColorsNone: matchMedia("(forced-colors: none)").matches,
      }));
      expect(mediaPolicy).toEqual({ forcedColorsActive: false, forcedColorsNone: true });

      const paragraph = page.locator("main p").first();
      await paragraph.hover();
      await expect(cursor).toHaveAttribute("data-cursor-native-active", "");
      await expect(cursor).not.toHaveAttribute("data-visible", "");
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
        page.locator('button[aria-haspopup="dialog"]').first(),
        "VIEW",
      );
      await expectCursorLabel(
        page,
        page.locator('[data-cursor="play"]').first(),
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
      await page.mouse.move(20, 300);
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
                  center: (() => {
                    const rect = pulse.getBoundingClientRect();
                    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                  })(),
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
      const visibleFrames = frames.filter(({ opacity }) => opacity > 0.1);
      expect(
        Math.max(...visibleFrames.map(({ center }) => distance(center, { x: 20, y: 300 }))),
        "pulse should stay centered on the actual pointerdown point",
      ).toBeLessThan(2);
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

  test("restores the native cursor when motion preference changes at runtime or high contrast is active", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Runtime media emulation is covered once in Chromium");

    const { context, page } = await openResponsivePage(browser, {
      name: "runtime-cursor-preferences",
      width: 1366,
      height: 768,
    });

    try {
      await expect(page.locator("[data-signal-cursor]")).toHaveCount(1);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(page.locator("[data-signal-cursor]")).toHaveCount(0);
      expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).not.toBe("none");

      await page.emulateMedia({ reducedMotion: "no-preference" });
      await expect(page.locator("[data-signal-cursor]")).toHaveCount(1);
    } finally {
      await context.close();
    }

    const forcedColorsContext = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      colorScheme: "dark",
      forcedColors: "active",
      reducedMotion: "no-preference",
    });
    await forcedColorsContext.route("https://api.fontshare.com/**", (route) => route.abort());
    const forcedColorsPage = await forcedColorsContext.newPage();

    try {
      await forcedColorsPage.goto("/", { waitUntil: "domcontentloaded" });
      await forcedColorsPage.locator("main").waitFor({ state: "visible" });
      await expect(forcedColorsPage.locator("[data-signal-cursor]")).toHaveCount(0);
      expect(
        await forcedColorsPage.evaluate(() => ({
          active: matchMedia("(forced-colors: active)").matches,
          none: matchMedia("(forced-colors: none)").matches,
        })),
      ).toEqual({ active: true, none: false });
      expect(
        await forcedColorsPage.evaluate(() => getComputedStyle(document.body).cursor),
      ).not.toBe("none");
    } finally {
      await forcedColorsContext.close();
    }
  });

  test("hands control back to the native cursor while a project dialog is open", async ({
    browser,
  }) => {
    const { context, page } = await openResponsivePage(browser, {
      name: "cursor-dialog-handoff",
      width: 1366,
      height: 768,
    });

    try {
      const trigger = page.locator('button[aria-haspopup="dialog"]').first();
      await trigger.scrollIntoViewIfNeeded();
      await trigger.hover();
      await expect(page.locator("[data-signal-cursor]")).toHaveAttribute(
        "data-cursor-mode",
        "view",
      );

      await page.locator('[data-cursor="play"]').first().click();
      const dialog = page.locator("dialog[open]");
      await expect(dialog).toBeVisible();
      await expect(page.locator("[data-signal-cursor]")).not.toHaveAttribute("data-visible", "");
      await expect(page.locator("html")).not.toHaveAttribute("data-signal-cursor-active", "");
      expect(await dialog.evaluate((element) => getComputedStyle(element).cursor)).not.toBe("none");

      await dialog.getByRole("button", { name: "Close" }).click();
      await page.locator('button[aria-haspopup="dialog"]').first().hover();
      await expect(page.locator("html")).toHaveAttribute("data-signal-cursor-active", "");
    } finally {
      await context.close();
    }
  });

  test("ignores compatibility mouse events after touch and reactivates only for a real mouse pointer", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Hybrid pointer synthesis is covered once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "cursor-hybrid-transition",
      width: 1366,
      height: 768,
    });

    try {
      const cursor = page.locator("[data-signal-cursor]");
      await page.mouse.move(20, 300);
      await expect(cursor).toHaveAttribute("data-visible", "");

      await page.evaluate(() => {
        window.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            clientX: 320,
            clientY: 220,
            pointerType: "touch",
          }),
        );
        window.dispatchEvent(
          new MouseEvent("mousemove", {
            bubbles: true,
            clientX: 322,
            clientY: 222,
          }),
        );
      });
      await expect(cursor).not.toHaveAttribute("data-visible", "");
      await expect(page.locator("html")).not.toHaveAttribute("data-signal-cursor-active", "");

      await page.evaluate(() => {
        window.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            clientX: 420,
            clientY: 280,
            pointerType: "mouse",
          }),
        );
      });
      await expect(cursor).toHaveAttribute("data-visible", "");
      await expect(page.locator("html")).toHaveAttribute("data-signal-cursor-active", "");
    } finally {
      await context.close();
    }
  });

  test("keeps touch and wheel deactivation idempotent during native scrolling", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Event-burst instrumentation runs once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "cursor-idle-event-bursts",
      width: 1366,
      height: 768,
    });

    try {
      await page.mouse.move(20, 300);
      await expect(page.locator("[data-signal-cursor]")).toHaveAttribute("data-visible", "");
      const mutations = await page.evaluate(async () => {
        const root = document.querySelector<HTMLElement>("[data-signal-cursor]")!;
        window.dispatchEvent(
          new PointerEvent("pointermove", { pointerType: "touch", clientX: 20, clientY: 300 }),
        );
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        window.__cursorIdleMutationCount = 0;
        const observer = new MutationObserver((records) => {
          window.__cursorIdleMutationCount! += records.length;
        });
        observer.observe(root, {
          attributes: true,
          characterData: true,
          childList: true,
          subtree: true,
        });
        for (let index = 0; index < 80; index += 1) {
          window.dispatchEvent(
            new PointerEvent("pointermove", {
              pointerType: "touch",
              clientX: 20 + index,
              clientY: 300,
            }),
          );
          window.dispatchEvent(new WheelEvent("wheel", { deltaY: 2 }));
        }
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        observer.disconnect();
        return window.__cursorIdleMutationCount;
      });
      expect(mutations, "inactive touch/wheel bursts must not rewrite cursor DOM").toBe(0);
    } finally {
      await context.close();
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
        dotStyleMutations: 0,
        projectQuerySelectorCalls: 0,
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

      const nativeQuerySelector = Element.prototype.querySelector;
      Object.defineProperty(Element.prototype, "querySelector", {
        configurable: true,
        writable: true,
        value(this: Element, selectors: string) {
          if (
            window.__cursorHotPathAudit?.active &&
            this.matches("[data-project-card]")
          ) {
            window.__cursorHotPathAudit.projectQuerySelectorCalls += 1;
          }
          return nativeQuerySelector.call(this, selectors);
        },
      });
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
          window.__cursorHotPathAudit.dotStyleMutations += records.filter(
            ({ type, target, attributeName }) =>
              type === "attributes" &&
              attributeName === "style" &&
              target instanceof Element &&
              target.matches("[data-cursor-dot]"),
          ).length;
        });
        observer.observe(cursor, { attributes: true, childList: true, subtree: true });

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
      expect(
        audit.dotStyleMutations,
        "a synchronous pointer burst should coalesce to one dot transform write",
      ).toBeLessThanOrEqual(1);

      const projectCard = page.locator("[data-project-card]").first();
      await projectCard.scrollIntoViewIfNeeded();
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            let stableFrames = 0;
            let previousY = window.scrollY;
            const settle = () => {
              const currentY = window.scrollY;
              stableFrames = Math.abs(currentY - previousY) < 0.25 ? stableFrames + 1 : 0;
              previousY = currentY;
              if (stableFrames >= 4) resolve();
              else requestAnimationFrame(settle);
            };
            requestAnimationFrame(settle);
          }),
      );
      const cardBox = await projectCard.boundingBox();
      expect(cardBox).not.toBeNull();
      const sweepTop = Math.max(72, cardBox!.y + 24);
      const sweepBottom = Math.min(740, cardBox!.y + cardBox!.height - 24);
      await page.mouse.move(8, 80);
      await page.evaluate(() => {
        const auditState = window.__cursorHotPathAudit!;
        auditState.boundingRectCalls = 0;
        auditState.projectQuerySelectorCalls = 0;
        auditState.active = true;
      });
      for (let index = 0; index < 80; index += 1) {
        const progress = index / 79;
        await page.mouse.move(
          cardBox!.x + 24 + (cardBox!.width - 48) * progress,
          index % 2 === 0 ? sweepTop : sweepBottom,
        );
      }
      const projectSweep = await page.evaluate(() => {
        window.__cursorHotPathAudit!.active = false;
        return { ...window.__cursorHotPathAudit! };
      });
      expect(
        projectSweep.boundingRectCalls,
        "one project hover session must reuse geometry instead of reading layout per descendant",
      ).toBeLessThanOrEqual(4);
      expect(
        projectSweep.projectQuerySelectorCalls,
        "one project hover session must not query the project subtree per pointer event",
      ).toBeLessThanOrEqual(2);

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
