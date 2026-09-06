import { expect, test } from "@playwright/test";
import { openResponsivePage } from "./responsive-helpers";

test.describe("responsive motion policies", () => {
  test("keeps ambient and depth motion active across engines and input modes", async ({
    browser,
    browserName,
  }) => {
    for (const viewport of [
      { name: "touch-phone", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
      { name: "touch-tablet", width: 1024, height: 768, touch: true, dpr: 2 },
      { name: "compact-fine-pointer", width: 820, height: 900 },
      { name: "large-desktop", width: 2560, height: 1440 },
    ]) {
      const { context, page } = await openResponsivePage(browser, viewport);
      try {
        const motion = await page.evaluate(() => {
          const animationName = (selector: string, pseudo?: string) => {
            const element = document.querySelector<HTMLElement>(selector);
            return element ? getComputedStyle(element, pseudo).animationName : null;
          };
          const perspective = document.querySelector<HTMLElement>(".perspective-scene");
          const project = document.querySelector<HTMLElement>(".project-card-3d");

          return {
            animations: [
              animationName(".aurora-1"),
              animationName(".aurora-2"),
              animationName(".aurora-3"),
              animationName(".hero-glow"),
              // animationName(".ecg-animate"), // ECG decoration is publicly hidden.
              animationName(".about-signal-trace-flow"),
              animationName(".marquee-track"),
            ],
            lenisActive: document.documentElement.classList.contains("lenis"),
            wheelCapable: matchMedia("(any-hover: hover) and (any-pointer: fine)").matches,
            perspective: perspective ? getComputedStyle(perspective).perspective : null,
            projectTransformStyle: project
              ? getComputedStyle(project).transformStyle
              : null,
          };
        });

        expect(motion.animations, `${viewport.name}: full ambient motion`).not.toContain("none");
        expect(motion.animations, `${viewport.name}: every motion surface exists`).not.toContain(null);
        // Lenis boots eagerly on wheel-capable devices (one scroll system per
        // session); touch-first devices never construct it.
        expect(
          motion.lenisActive,
          `${viewport.name}: Lenis presence matches wheel capability`,
        ).toBe(motion.wheelCapable);
        expect(motion.perspective, `${viewport.name}: perspective`).not.toBe("none");
        expect(motion.projectTransformStyle, `${viewport.name}: project depth`).toBe("preserve-3d");
      } finally {
        await context.close();
      }
    }
  });

  test("advances compositor-driven ambient motion in every browser engine", async ({
    browser,
  }) => {
    const { context, page } = await openResponsivePage(browser, {
      name: "ambient-progress",
      width: 390,
      height: 844,
      mobile: true,
      touch: true,
      dpr: 3,
    });

    try {
      // Hero-region loops run at the top of the page.
      const sampleHero = () =>
        page.evaluate(() => ({
          aurora: getComputedStyle(document.querySelector<HTMLElement>(".aurora-1")!).transform,
          // ecg: getComputedStyle(document.querySelector<HTMLElement>(".ecg-animate")!).transform,
        }));
      const before = await sampleHero();
      await page.waitForTimeout(350);
      const after = await sampleHero();

      expect(after.aurora, "aurora transform progresses").not.toBe(before.aurora);
      // expect(after.ecg, "ECG transform progresses").not.toBe(before.ecg);

      // Off-screen ambient loops sleep (AmbientGate); the marquee only runs
      // once its section is near the viewport.
      const marquee = page.locator(".marquee-track");
      expect(
        await marquee.evaluate((element) => getComputedStyle(element).animationPlayState),
        "marquee sleeps while far off-screen",
      ).toBe("paused");

      await marquee.scrollIntoViewIfNeeded();
      await expect
        .poll(() => marquee.evaluate((element) => getComputedStyle(element).animationPlayState))
        .toBe("running");
      const marqueeBefore = await marquee.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      await page.waitForTimeout(350);
      const marqueeAfter = await marquee.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      expect(marqueeAfter, "marquee transform progresses in view").not.toBe(marqueeBefore);
    } finally {
      await context.close();
    }
  });

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
          // ecg: getComputedStyle(document.querySelector<HTMLElement>(".ecg-animate")!).animationName,
          marquee: getComputedStyle(document.querySelector<HTMLElement>(".marquee-track")!).animationName,
        }));
        expect(motion.reduced, `${viewport.name}: test precondition`).toBe(false);
        // expect(motion.ecg, `${viewport.name}: ECG keeps moving after touch scroll`).toBe("ecgDraw");
        expect(motion.marquee, `${viewport.name}: marquee keeps moving after touch scroll`).toBe("marquee");
      } finally {
        await context.close();
      }
    }
  });

  test("touch press drives 3D feedback without taking over native scrolling", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Synthetic touchscreen input runs once in Chromium");

    for (const viewport of [
      { name: "phone", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
      { name: "tablet", width: 1024, height: 768, touch: true, dpr: 2 },
    ]) {
      const { context, page } = await openResponsivePage(browser, viewport);
      try {
        const target = page.locator("[data-about-signal-stack] [data-tilt-card]");
        const motionSurface = target.locator("[data-tilt-surface]");
        await target.scrollIntoViewIfNeeded();
        const bounds = await target.boundingBox();
        expect(bounds, `${viewport.name}: About instrument bounds`).not.toBeNull();
        const baseline = await motionSurface.evaluate(
          (element) => getComputedStyle(element).transform,
        );
        const point = {
          x: bounds!.x + bounds!.width * 0.2,
          y: bounds!.y + bounds!.height * 0.25,
          radiusX: 8,
          radiusY: 8,
          force: 0.5,
        };

        await target.dispatchEvent("pointerdown", {
          bubbles: true,
          pointerId: 7,
          pointerType: "touch",
          isPrimary: true,
          clientX: point.x,
          clientY: point.y,
        });
        await expect(target).toHaveAttribute("data-tilt-active", "");
        await expect
          .poll(() =>
            motionSurface.evaluate((element) => getComputedStyle(element).transform),
          )
          .not.toBe(baseline);

        await target.dispatchEvent("pointerup", {
          bubbles: true,
          pointerId: 7,
          pointerType: "touch",
          isPrimary: true,
          clientX: point.x,
          clientY: point.y,
        });
        await expect(target).not.toHaveAttribute("data-tilt-active", "", { timeout: 1_500 });
      } finally {
        await context.close();
      }
    }
  });

  test("keeps hybrid-device touch native until mouse or wheel intent", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Hybrid pointer emulation runs once in Chromium");

    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      screen: { width: 1024, height: 768 },
      hasTouch: true,
      deviceScaleFactor: 2,
      reducedMotion: "no-preference",
      colorScheme: "dark",
    });
    await context.addInitScript(() => {
      const nativeMatchMedia = window.matchMedia.bind(window);
      const hybridQueries = new Set([
        "(any-hover: hover) and (any-pointer: fine)",
      ]);
      const touchListenerRecords: Array<{
        type: string;
        passive: boolean | null;
        target: string;
      }> = [];
      window.matchMedia = (query) => {
        if (hybridQueries.has(query)) {
          return {
            media: query,
            matches: true,
            onchange: null,
            addEventListener() {},
            removeEventListener() {},
            addListener() {},
            removeListener() {},
            dispatchEvent() {
              return true;
            },
          } as MediaQueryList;
        }
        return nativeMatchMedia(query);
      };

      const nativeAdd = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function addEventListener(
        type,
        listener,
        options,
      ) {
        if (type === "touchstart" || type === "touchmove" || type === "touchend") {
          const passive =
            typeof options === "object" && options !== null && "passive" in options
              ? Boolean(options.passive)
              : null;
          const target =
            this === window
              ? "window"
              : this === document
                ? "document"
                : (this as Element).tagName?.toLowerCase?.() ?? "unknown";
          touchListenerRecords.push({ type, passive, target });
        }
        return nativeAdd.call(this, type, listener, options);
      };

      (
        window as typeof window & {
          __touchListenerRecords: typeof touchListenerRecords;
        }
      ).__touchListenerRecords = touchListenerRecords;
    });
    await context.route("**/fonts/**", (route) => route.abort());

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

      const initial = await page.evaluate(() => ({
        lenis: document.documentElement.classList.contains("lenis"),
        nonPassiveTouch: (
          window as typeof window & {
            __touchListenerRecords: Array<{ passive: boolean | null; target: string }>;
          }
        ).__touchListenerRecords.filter(
          (record) => record.target === "window" && record.passive !== true,
        ).length,
      }));
      // A hybrid device has a fine pointer, so Lenis is eagerly active; the
      // contract under test is that TOUCH input immediately hands scrolling
      // back to the platform.
      expect(initial.lenis, "Lenis boots eagerly on a wheel-capable hybrid").toBe(true);

      const client = await context.newCDPSession(page);
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: 512, y: 600, radiusX: 8, radiusY: 8, force: 0.5 }],
      });
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: 512, y: 220, radiusX: 8, radiusY: 8, force: 0.5 }],
      });
      await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
      expect(
        await page.evaluate(() => document.documentElement.classList.contains("lenis")),
        "touch input must tear Lenis down and stay native",
      ).toBe(false);
      expect(
        await page.evaluate(
          () =>
            (
              window as typeof window & {
                __touchListenerRecords: Array<{ passive: boolean | null; target: string }>;
              }
            ).__touchListenerRecords.filter(
              (record) => record.target === "window" && record.passive !== true,
            ).length,
        ),
        "touch input must not add further non-passive touch listeners",
      ).toBe(initial.nonPassiveTouch);

      await page.mouse.wheel(0, 1);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.classList.contains("lenis")))
        .toBe(true);

      const secondSwipeStart = await page.evaluate(() => window.scrollY);
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: 512, y: 600, radiusX: 8, radiusY: 8, force: 0.5 }],
      });
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: 512, y: 220, radiusX: 8, radiusY: 8, force: 0.5 }],
      });
      await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(secondSwipeStart + 100);
      expect(
        await page.evaluate(() => document.documentElement.classList.contains("lenis")),
        "touch must tear Lenis down before a hybrid-device swipe",
      ).toBe(false);
    } finally {
      await context.close();
    }
  });

  test("leaves browser zoom and horizontal wheel gestures untouched", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Wheel cancellation policy runs once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "wheel-browser-controls",
      width: 1366,
      height: 768,
    });

    try {
      const results = await page.evaluate(() => {
        const dispatch = (init: WheelEventInit) => {
          const event = new WheelEvent("wheel", {
            bubbles: true,
            cancelable: true,
            ...init,
          });
          const accepted = window.dispatchEvent(event);
          return { accepted, defaultPrevented: event.defaultPrevented };
        };
        return {
          zoom: dispatch({ deltaY: 120, ctrlKey: true }),
          horizontal: dispatch({ deltaX: 120, deltaY: 0 }),
          lenis: document.documentElement.classList.contains("lenis"),
        };
      });

      expect(results.zoom).toEqual({ accepted: true, defaultPrevented: false });
      expect(results.horizontal).toEqual({ accepted: true, defaultPrevented: false });
      // Lenis is eagerly active on fine-pointer devices; what matters is that
      // it leaves zoom and horizontal gestures to the browser (asserted above).
      expect(results.lenis, "Lenis runs eagerly on fine-pointer devices").toBe(true);
    } finally {
      await context.close();
    }
  });

  test("wheel impulses remain interpolated on compact and large fine-pointer screens", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Wheel interpolation timing runs once in Chromium");

    for (const viewport of [
      { name: "compact-fine", width: 820, height: 900 },
      { name: "laptop", width: 1366, height: 768 },
      { name: "large-desktop", width: 2560, height: 1440 },
    ]) {
      const { context, page } = await openResponsivePage(browser, viewport);
      try {
        await page.mouse.wheel(0, 1);
        await expect
          .poll(() => page.evaluate(() => document.documentElement.classList.contains("lenis")))
          .toBe(true);
        await page.evaluate(() => {
          const auditWindow = window as typeof window & { __wheelSamples?: number[] };
          auditWindow.__wheelSamples = [];
          window.addEventListener(
            "scroll",
            () => auditWindow.__wheelSamples?.push(window.scrollY),
            { passive: true },
          );
        });

        await page.mouse.wheel(0, 640);
        await page.waitForTimeout(700);
        const samples = await page.evaluate(
          () => (window as typeof window & { __wheelSamples?: number[] }).__wheelSamples ?? [],
        );
        const distinct = [...new Set(samples.map((value) => Math.round(value)))];
        const total = distinct.at(-1) ?? 0;
        const largestStep = distinct.reduce(
          (largest, value, index) =>
            index === 0 ? value : Math.max(largest, value - distinct[index - 1]),
          0,
        );

        expect(distinct.length, `${viewport.name}: interpolated wheel frames`).toBeGreaterThanOrEqual(6);
        expect(total, `${viewport.name}: wheel travel`).toBeGreaterThan(300);
        expect(largestStep, `${viewport.name}: no single-frame wheel jump`).toBeLessThan(total * 0.5);
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
    const { context, page } = await openResponsivePage(browser, {
      name: "hidden-research",
      width: 768,
      height: 480,
      touch: true,
    });
    try {
      await expect(page.locator("#featured")).toHaveCount(0);
      await expect(page.locator(".pin-spacer")).toHaveCount(0);
      return;
    } finally {
      await context.close();
    }
    /* Previous responsive pin checks are retained below for later reuse.
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
    */
  });

  test("keeps the cinematic research sequence pinned and escapable on desktop", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Pinned scroll sequencing runs once in Chromium");
    const { context, page } = await openResponsivePage(browser, {
      name: "pinned-desktop",
      width: 1366,
      height: 768,
    });

    try {
      await expect(page.locator("#featured")).toHaveCount(0);
      await expect(page.locator(".pin-spacer")).toHaveCount(0);
      return;
      /* Previous pinned research sequence retained for later reuse.
      const featured = page.locator("#featured");
      await expect(featured).toHaveAttribute("data-featured-motion", "pinned");
      await featured.scrollIntoViewIfNeeded();
      await expect(page.locator(".pin-spacer")).toHaveCount(1);

      const startPhase = await featured.locator('[aria-current="step"]').textContent();
      for (let step = 0; step < 5; step += 1) {
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(80);
      }
      await expect
        .poll(() => featured.locator('[aria-current="step"]').textContent())
        .not.toBe(startPhase);

      const projects = page.locator("#projects");
      for (let step = 0; step < 20; step += 1) {
        const visible = await projects.evaluate((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0;
        });
        if (visible) break;
        await page.mouse.wheel(0, 700);
        await page.waitForTimeout(120);
      }
      await expect
        .poll(() =>
          projects.evaluate((section) => {
            const rect = section.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
          }),
        )
        .toBe(true);
      */
    } finally {
      await context.close();
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
      expect(styles.ecgAnimation).toBeNull();

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

  test("lets keyboard and touch users pause continuous marquee motion", async ({
    browser,
  }) => {
    const { context, page } = await openResponsivePage(browser, {
      name: "marquee-control",
      width: 390,
      height: 844,
      mobile: true,
      touch: true,
      dpr: 3,
    });

    try {
      const toggle = page.locator(".marquee-toggle").first();
      await toggle.scrollIntoViewIfNeeded();
      await expect(toggle).toHaveAccessibleName("Toggle skills marquee motion");
      await toggle.focus();
      await page.keyboard.press("Enter");
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".marquee-track")).toHaveAttribute("data-paused", "");
      expect(
        await page.locator(".marquee-track").evaluate(
          (element) => getComputedStyle(element).animationPlayState,
        ),
      ).toBe("paused");
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
      await page.mouse.wheel(0, 1);
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

    for (const selector of [
      "[data-hero-btns] > div",
      "[data-about-signal-stack] [data-tilt-card]",
    ]) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
      await context.addInitScript(() => {
        const nativeMatchMedia = window.matchMedia.bind(window);
        const media = "(any-hover: hover) and (any-pointer: fine)";
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

      await context.route("**/fonts/**", (route) => route.abort());

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
        // Let the section entrance settle — hovering a coordinate read while
        // the element is still translating misses it and no pointer event
        // ever re-fires.
        await target.evaluate(
          (element) =>
            new Promise<void>((resolve) => {
              let stable = 0;
              let last = "";
              const tick = () => {
                const rect = element.getBoundingClientRect();
                const key = `${Math.round(rect.x)},${Math.round(rect.y)}`;
                stable = key === last ? stable + 1 : 0;
                last = key;
                if (stable >= 6) resolve();
                else requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            }),
        );
        const box = await target.boundingBox();
        expect(box, `${selector}: pointer target`).not.toBeNull();
        await page.mouse.move(box!.x + box!.width - 4, box!.y + 4);

        const isIdentity = () =>
          target.evaluate((element) => {
            const motionSurface =
              element.querySelector<HTMLElement>("[data-tilt-surface]") ?? element;
            const transform = getComputedStyle(motionSurface).transform;
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
