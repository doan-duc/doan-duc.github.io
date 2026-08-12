import { expect, test } from "@playwright/test";
import { openResponsivePage } from "./responsive-helpers";

test.describe("responsive motion policies", () => {
  test("touch scrolling keeps visible motion tied to real swipe progress", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Synthetic touchscreen swipes run once in Chromium");

    for (const viewport of [
      { name: "phone", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
      { name: "tablet", width: 1024, height: 768, touch: true, dpr: 2 },
    ]) {
      const { context, page } = await openResponsivePage(browser, viewport);
      try {
        const progress = page.locator('body > div[aria-hidden="true"].fixed.inset-x-0.top-0');
        const before = await progress.evaluate(
          (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m11,
        );

        const client = await context.newCDPSession(page);
        const x = viewport.width / 2;
        const startY = viewport.height * 0.78;
        const endY = viewport.height * 0.18;
        await client.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x, y: startY, radiusX: 8, radiusY: 8, force: 0.5 }],
        });
        for (let step = 1; step <= 12; step += 1) {
          await client.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{
              x,
              y: startY + ((endY - startY) * step) / 12,
              radiusX: 8,
              radiusY: 8,
              force: 0.5,
            }],
          });
          await page.waitForTimeout(16);
        }
        await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

        await expect
          .poll(() => page.evaluate(() => window.scrollY), { timeout: 3_000 })
          .toBeGreaterThan(viewport.height * 0.25);
        const after = await progress.evaluate(
          (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m11,
        );
        expect(after, `${viewport.name}: scroll progress remains animated`).toBeGreaterThan(before + 0.01);

        const motion = await page.evaluate(() => ({
          reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
          ecg: getComputedStyle(document.querySelector<HTMLElement>(".ecg-animate")!).animationName,
          marquee: getComputedStyle(document.querySelector<HTMLElement>(".marquee-track")!).animationName,
        }));
        expect(motion.reduced, `${viewport.name}: test precondition`).toBe(false);
        expect(motion.ecg, `${viewport.name}: ECG keeps moving after touch scroll`).toBe("ecgDraw");
        expect(motion.marquee, `${viewport.name}: marquee keeps moving after touch scroll`).toBe("marquee");
      } finally {
        await context.close();
      }
    }
  });

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

      const selectedWork = page.getByRole("button", { name: "Selected work" });
      const magneticWrapper = selectedWork.locator("..");
      const buttonBox = await selectedWork.boundingBox();
      expect(buttonBox).not.toBeNull();
      await page.mouse.move(buttonBox!.x + 3, buttonBox!.y + buttonBox!.height / 2);
      await expect
        .poll(() =>
          magneticWrapper.evaluate((element) => getComputedStyle(element).transform),
        )
        .not.toBe("none");

      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.classList.contains("lenis")))
        .toBe(false);
      expect(
        await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
      ).toBe("auto");
      await expect
        .poll(() =>
          magneticWrapper.evaluate((element) => {
            const transform = getComputedStyle(element).transform;
            if (transform === "none") return true;
            const matrix = new DOMMatrixReadOnly(transform);
            return Math.abs(matrix.m41) < 0.1 && Math.abs(matrix.m42) < 0.1;
          }),
        )
        .toBe(true);
    } finally {
      await context.close();
    }
  });

  test("resets active pointer effects when fine-pointer capability changes", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Runtime pointer emulation runs once in Chromium");

    for (const selector of ["[data-hero-btns] > div", ".about-signal-tilt"]) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
      await context.addInitScript(() => {
        const nativeMatchMedia = window.matchMedia.bind(window);
        const media = "(hover: hover) and (pointer: fine)";
        const listeners = new Set<(event: MediaQueryListEvent) => void>();
        let enabled = true;
        const pointerQuery = {
          media,
          get matches() {
            return enabled;
          },
          onchange: null,
          addEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
            if (type === "change" && typeof listener === "function") {
              listeners.add(listener as (event: MediaQueryListEvent) => void);
            }
          },
          removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
            if (type === "change" && typeof listener === "function") {
              listeners.delete(listener as (event: MediaQueryListEvent) => void);
            }
          },
          addListener(listener: (event: MediaQueryListEvent) => void) {
            listeners.add(listener);
          },
          removeListener(listener: (event: MediaQueryListEvent) => void) {
            listeners.delete(listener);
          },
          dispatchEvent() {
            return true;
          },
        } as MediaQueryList;

        window.matchMedia = (query) =>
          query === media ? pointerQuery : nativeMatchMedia(query);
        (
          window as typeof window & { __setFinePointer: (next: boolean) => void }
        ).__setFinePointer = (next) => {
          enabled = next;
          const event = { matches: next, media } as MediaQueryListEvent;
          listeners.forEach((listener) => listener.call(pointerQuery, event));
        };
      });

      await context.route("https://api.fontshare.com/**", (route) => route.abort());

      const page = await context.newPage();
      try {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.locator("main").waitFor({ state: "visible" });
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
        });
        const target = page.locator(selector).first();
        await target.scrollIntoViewIfNeeded();
        const box = await target.boundingBox();
        expect(box, `${selector}: pointer target`).not.toBeNull();
        await page.mouse.move(box!.x + box!.width - 4, box!.y + 4);

        const isIdentity = () =>
          target.evaluate((element) => {
            const transform = getComputedStyle(element).transform;
            if (transform === "none") return true;
            const matrix = new DOMMatrixReadOnly(transform);
            return (
              Math.abs(matrix.m11 - 1) < 0.001 &&
              Math.abs(matrix.m22 - 1) < 0.001 &&
              Math.abs(matrix.m41) < 0.1 &&
              Math.abs(matrix.m42) < 0.1
            );
          });

        await expect.poll(isIdentity).toBe(false);
        await page.evaluate(() =>
          (
            window as typeof window & { __setFinePointer: (next: boolean) => void }
          ).__setFinePointer(false),
        );
        await page.evaluate(
          () => new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
        );
        expect(await isIdentity(), `${selector}: transform snaps to rest`).toBe(true);
      } finally {
        await context.close();
      }
    }
  });
});
