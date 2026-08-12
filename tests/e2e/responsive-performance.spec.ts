import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { openResponsivePage, type ResponsiveViewport } from "./responsive-helpers";

type MotionAudit = {
  reset: () => void;
  snapshot: () => { mediaQueryReads: number };
};

type FrameProbe = {
  running: boolean;
  frameIntervals: number[];
  longTasks: number[];
  longAnimationFrames: number[];
  observers: PerformanceObserver[];
};

type InstrumentedWindow = typeof window & {
  __motionAudit: MotionAudit;
  __frameProbe?: FrameProbe;
};

async function openInstrumentedDesktop(
  browser: Browser,
  viewport: { width: number; height: number },
) {
  const context = await browser.newContext({
    viewport,
    screen: viewport,
    colorScheme: "dark",
  });

  await context.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia;
    let mediaQueryReads = 0;

    window.matchMedia = function matchMedia(query: string) {
      if (/\((?:any-)?(?:hover|pointer)\s*:/.test(query)) mediaQueryReads += 1;
      return nativeMatchMedia.call(window, query);
    };

    (window as InstrumentedWindow).__motionAudit = {
      reset() {
        mediaQueryReads = 0;
      },
      snapshot() {
        return { mediaQueryReads };
      },
    };
  });

  await context.route("https://api.fontshare.com/**", (route) => route.abort());

  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("main").waitFor({ state: "visible" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });

  return { context, page };
}

async function auditPointerSweep(
  page: Page,
  selector: string,
  eventType: "mousemove" | "pointermove" = "mousemove",
) {
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  await target.hover({ position: { x: 8, y: 8 } });
  await page.waitForTimeout(400);

  return target.evaluate(async (element, eventType) => {
    const nativeRect = element.getBoundingClientRect;
    const bounds = nativeRect.call(element);
    const motionSurface =
      element.querySelector<HTMLElement>("[data-tilt-surface]") ?? element;
    const transformBeforeSweep = getComputedStyle(motionSurface).transform;
    const audit = (window as InstrumentedWindow).__motionAudit;
    let rectReads = 0;
    Object.defineProperty(element, "getBoundingClientRect", {
      configurable: true,
      value() {
        rectReads += 1;
        return nativeRect.call(element);
      },
    });
    audit.reset();

    try {
      for (let step = 0; step < 180; step += 1) {
        const progress = step / 179;
        const init = {
          bubbles: true,
          clientX: bounds.left + 4 + (bounds.width - 8) * progress,
          clientY:
            bounds.top + bounds.height / 2 + Math.sin(progress * Math.PI * 4) * 4,
          view: window,
        };
        element.dispatchEvent(
          eventType === "pointermove"
            ? new PointerEvent("pointermove", {
                ...init,
                pointerId: 1,
                pointerType: "mouse",
                isPrimary: true,
              })
            : new MouseEvent("mousemove", init),
        );
      }

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      return {
        rectReads,
        transformBeforeSweep,
        transform: getComputedStyle(motionSurface).transform,
        ...audit.snapshot(),
      };
    } finally {
      Reflect.deleteProperty(element, "getBoundingClientRect");
    }
  }, eventType);
}

async function readTransformMatrix(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((element) => {
    const motionSurface =
      element.querySelector<HTMLElement>("[data-tilt-surface]") ?? element;
    const matrix = new DOMMatrixReadOnly(getComputedStyle(motionSurface).transform);
    return [
      matrix.m11,
      matrix.m12,
      matrix.m13,
      matrix.m14,
      matrix.m21,
      matrix.m22,
      matrix.m23,
      matrix.m24,
      matrix.m31,
      matrix.m32,
      matrix.m33,
      matrix.m34,
      matrix.m41,
      matrix.m42,
      matrix.m43,
      matrix.m44,
    ];
  });
}

function matrixDistance(left: number[], right: number[]) {
  return Math.hypot(...left.map((value, index) => value - right[index]));
}

async function measureTiltStepResponse(page: Page, selector: string) {
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  const attempts: Array<{ fullTravel: number; progressAt120ms: number }> = [];

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const initialBounds = await target.boundingBox();
    if (!initialBounds) throw new Error(`Unable to measure ${selector}`);

    const y = Math.min(initialBounds.height / 2, 180);
    await target.hover({ position: { x: initialBounds.width * 0.1, y } });
    await page.waitForTimeout(500);
    const start = await readTransformMatrix(page, selector);

    const activeBounds = await target.boundingBox();
    if (!activeBounds) throw new Error(`Unable to remeasure ${selector}`);
    await page.mouse.move(
      activeBounds.x + activeBounds.width * 0.9,
      activeBounds.y + Math.min(activeBounds.height / 2, 180),
    );
    await page.waitForTimeout(120);
    const responsive = await readTransformMatrix(page, selector);
    await page.waitForTimeout(500);
    const settled = await readTransformMatrix(page, selector);
    const fullTravel = matrixDistance(start, settled);
    const response = {
      fullTravel,
      progressAt120ms:
        fullTravel === 0 ? 0 : matrixDistance(start, responsive) / fullTravel,
    };
    attempts.push(response);
    if (response.fullTravel > 0.05) return response;

    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
  }

  return attempts.sort((left, right) => right.fullTravel - left.fullTravel)[0];
}

async function startFrameProbe(page: Page) {
  await page.evaluate(() => {
    const probe: FrameProbe = {
      running: true,
      frameIntervals: [],
      longTasks: [],
      longAnimationFrames: [],
      observers: [],
    };
    (window as InstrumentedWindow).__frameProbe = probe;

    const supported = PerformanceObserver.supportedEntryTypes;
    const observeDurations = (
      type: "longtask" | "long-animation-frame",
      target: number[],
    ) => {
      if (!supported.includes(type)) return;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) target.push(entry.duration);
      });
      observer.observe({ type, buffered: false });
      probe.observers.push(observer);
    };

    observeDurations("longtask", probe.longTasks);
    observeDurations("long-animation-frame", probe.longAnimationFrames);

    let previous = performance.now();
    const sample = (timestamp: number) => {
      if (!probe.running) return;
      probe.frameIntervals.push(timestamp - previous);
      previous = timestamp;
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

async function stopFrameProbe(page: Page) {
  return page.evaluate(() => {
    const probe = (window as InstrumentedWindow).__frameProbe;
    if (!probe) throw new Error("Frame probe was not started");
    probe.running = false;
    probe.observers.forEach((observer) => observer.disconnect());

    const intervals = probe.frameIntervals.slice(2).sort((left, right) => left - right);
    const percentile = (ratio: number) =>
      intervals[Math.min(intervals.length - 1, Math.floor(intervals.length * ratio))] ?? 0;
    const total = (values: number[]) =>
      values.reduce((sum, duration) => sum + duration, 0);

    return {
      samples: intervals.length,
      p95FrameMs: percentile(0.95),
      longestFrameMs: intervals.at(-1) ?? 0,
      over50msRatio:
        intervals.length === 0
          ? 1
          : intervals.filter((duration) => duration > 50).length / intervals.length,
      longTaskCount: probe.longTasks.length,
      longTaskTotalMs: total(probe.longTasks),
      over100msAnimationFrames: probe.longAnimationFrames.filter(
        (duration) => duration > 100,
      ).length,
    };
  });
}

type FrameMetrics = Awaited<ReturnType<typeof stopFrameProbe>>;

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function medianMetrics(runs: FrameMetrics[]): FrameMetrics {
  const value = (key: keyof FrameMetrics) => median(runs.map((run) => run[key]));
  return {
    samples: value("samples"),
    p95FrameMs: value("p95FrameMs"),
    longestFrameMs: value("longestFrameMs"),
    over50msRatio: value("over50msRatio"),
    longTaskCount: value("longTaskCount"),
    longTaskTotalMs: value("longTaskTotalMs"),
    over100msAnimationFrames: value("over100msAnimationFrames"),
  };
}

async function performTouchScroll(
  context: BrowserContext,
  page: Page,
  viewport: ResponsiveViewport,
) {
  const client = await context.newCDPSession(page);
  const x = viewport.width / 2;
  const startY = viewport.height * 0.78;
  const endY = viewport.height * 0.2;

  for (let swipe = 0; swipe < 40; swipe += 1) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y: startY, radiusX: 8, radiusY: 8, force: 0.5 }],
    });
    for (let step = 1; step <= 10; step += 1) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{
          x,
          y: startY + ((endY - startY) * step) / 10,
          radiusX: 8,
          radiusY: 8,
          force: 0.5,
        }],
      });
      await page.waitForTimeout(16);
    }
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(48);

    const reachedBottom = await page.evaluate(
      () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
    );
    if (reachedBottom) break;
  }

  const reached = await page.evaluate(() => ({
    bottom: window.scrollY + window.innerHeight,
    total: document.documentElement.scrollHeight,
  }));
  expect(reached.bottom, "touch benchmark must exercise the full document").toBeGreaterThanOrEqual(
    reached.total - viewport.height,
  );
}

test.describe("motion smoothness budgets", () => {
  test("pointer effects do not recalculate layout or media capability per mousemove", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Hot-path instrumentation runs once in Chromium");

    for (const viewport of [
      { name: "laptop", width: 1366, height: 768 },
      { name: "large-desktop", width: 2560, height: 1440 },
    ]) {
      const { context, page } = await openInstrumentedDesktop(browser, viewport);
      try {
        const magnetic = await auditPointerSweep(page, "[data-hero-btns] > div");
        expect(
          magnetic.rectReads,
          `${viewport.name}: Magnetic must cache geometry for a hover session`,
        ).toBeLessThanOrEqual(2);
        expect(
          magnetic.mediaQueryReads,
          `${viewport.name}: Magnetic must cache pointer capability`,
        ).toBeLessThanOrEqual(1);
        expect(
          magnetic.transform,
          `${viewport.name}: Magnetic instrumentation must drive the live transform`,
        ).not.toBe(magnetic.transformBeforeSweep);

        const tilt = await auditPointerSweep(
          page,
          "[data-project-card] [data-tilt-card]",
          "pointermove",
        );
        expect(
          tilt.rectReads,
          `${viewport.name}: TiltCard must cache geometry for a hover session`,
        ).toBeLessThanOrEqual(2);
        expect(
          tilt.mediaQueryReads,
          `${viewport.name}: TiltCard must cache pointer capability`,
        ).toBeLessThanOrEqual(1);
        expect(
          tilt.transform,
          `${viewport.name}: TiltCard instrumentation must drive the live transform`,
        ).not.toBe(tilt.transformBeforeSweep);
      } finally {
        await context.close();
      }
    }
  });

  test("fine-pointer 3D cards promote only for the active hover lifecycle", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Compositor lifecycle is exercised once in Chromium");

    const { context, page } = await openInstrumentedDesktop(browser, {
      width: 1366,
      height: 768,
    });
    try {
      for (const surface of [
        {
          name: "hero affiliation",
          selector: "[data-hust-affiliation] [data-tilt-card]",
        },
        {
          name: "about signal instrument",
          selector: "[data-about-signal-stack] [data-tilt-card]",
        },
        {
          name: "selected-work project",
          selector: "[data-project-card] [data-tilt-card]",
        },
      ]) {
        const target = page.locator(surface.selector).first();
        const motionSurface = target.locator("[data-tilt-surface]").first();
        await target.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        expect(
          await motionSurface.evaluate((element) => getComputedStyle(element).willChange),
          `${surface.name}: resting surface must not reserve a GPU layer`,
        ).toBe("auto");

        await target.hover({ position: { x: 12, y: 12 } });
        await page.evaluate(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
        );
        expect(
          await motionSurface.evaluate((element) => getComputedStyle(element).willChange),
          `${surface.name}: active tilt should be compositor-promoted`,
        ).toContain("transform");

        await page.mouse.move(0, 0);
        await page.waitForTimeout(550);
        expect(
          await motionSurface.evaluate((element) => getComputedStyle(element).willChange),
          `${surface.name}: promotion should be released after the return spring settles`,
        ).toBe("auto");
      }
    } finally {
      await context.close();
    }
  });

  test("3D tilt follows the pointer promptly on affiliations and selected work", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Pointer response timing runs once in Chromium");

    const { context, page } = await openInstrumentedDesktop(browser, {
      width: 1366,
      height: 768,
    });
    try {
      for (const surface of [
        {
          name: "hero affiliation",
          selector: "[data-hust-affiliation] [data-tilt-card]",
        },
        {
          name: "selected-work project",
          selector: "[data-project-card] [data-tilt-card]",
        },
      ]) {
        const response = await measureTiltStepResponse(page, surface.selector);
        expect(
          response.fullTravel,
          `${surface.name}: pointer travel should produce visible 3D depth`,
        ).toBeGreaterThan(0.05);
        expect(
          response.progressAt120ms,
          `${surface.name}: spring should cover at least 65% of its travel within 120ms`,
        ).toBeGreaterThanOrEqual(0.65);
      }
    } finally {
      await context.close();
    }
  });

  test("3D card lighting follows the pointer and fades after hover", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Pointer-follow lighting runs once in Chromium");

    const { context, page } = await openInstrumentedDesktop(browser, {
      width: 1366,
      height: 768,
    });
    try {
      for (const surface of [
        {
          name: "hero affiliation",
          selector: "[data-edabk-affiliation]",
        },
        {
          name: "selected-work project",
          selector: "[data-project-card]",
        },
      ]) {
        const card = page.locator(surface.selector).first();
        await card.scrollIntoViewIfNeeded();
        const hoverTarget = card.locator("[data-tilt-card]").first();
        const glare = card.locator("[data-tilt-glare]");
        await expect(
          glare,
          `${surface.name}: card should expose a dedicated depth-light layer`,
        ).toHaveCount(1);

        const bounds = await hoverTarget.boundingBox();
        if (!bounds) throw new Error(`Unable to measure ${surface.name}`);
        const sampleY = Math.min(bounds.height * 0.3, 180);
        await hoverTarget.hover({
          position: { x: bounds.width * 0.15, y: sampleY },
        });
        await page.waitForTimeout(140);
        const left = await glare.evaluate((element) => ({
          opacity: Number.parseFloat(getComputedStyle(element).opacity),
          transform: getComputedStyle(element).transform,
        }));

        const activeBounds = await hoverTarget.boundingBox();
        if (!activeBounds) throw new Error(`Unable to remeasure ${surface.name}`);
        await page.mouse.move(
          activeBounds.x + activeBounds.width * 0.85,
          activeBounds.y + Math.min(activeBounds.height * 0.7, 360),
        );
        await page.waitForTimeout(140);
        const right = await glare.evaluate((element) => ({
          opacity: Number.parseFloat(getComputedStyle(element).opacity),
          transform: getComputedStyle(element).transform,
        }));

        expect(
          left.opacity,
          `${surface.name}: depth light should become visible on hover`,
        ).toBeGreaterThan(0.35);
        expect(
          right.transform,
          `${surface.name}: depth light should track pointer travel`,
        ).not.toBe(left.transform);

        await page.mouse.move(0, 0);
        await expect
          .poll(() =>
            glare.evaluate((element) =>
              Number.parseFloat(getComputedStyle(element).opacity),
            ),
          )
          .toBeLessThan(0.05);
      }
    } finally {
      await context.close();
    }
  });

  test("no-preference keeps the full visual animation language on compact and touch screens", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Compositor policy is exercised once in Chromium");

    const viewports: ResponsiveViewport[] = [
      { name: "phone", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
      { name: "phone-landscape", width: 844, height: 390, mobile: true, touch: true, dpr: 3 },
      { name: "touch-tablet", width: 1024, height: 768, touch: true, dpr: 2 },
    ];

    for (const viewport of viewports) {
      const { context, page } = await openResponsivePage(browser, viewport);
      try {
        const policy = await page.evaluate(() => {
          const animationChecks = [
            [".aurora-1", null],
            [".aurora-2", null],
            [".aurora-3", null],
            [".hero-glow", null],
            [".ecg-animate", null],
            [".about-signal-trace-flow", null],
            [".marquee-track", null],
          ] as const;
          const activeAnimations = animationChecks.flatMap(([selector, pseudo]) => {
            const element = document.querySelector<HTMLElement>(selector);
            if (!element) return [];
            const name = getComputedStyle(element, pseudo).animationName;
            return name === "none" ? [] : [`${selector}${pseudo ?? ""}: ${name}`];
          });
          const perspective = document.querySelector<HTMLElement>(".perspective-scene");
          const depthRoot = document.querySelector<HTMLElement>(".preserve-3d");

          return {
            reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
            coarsePointer: matchMedia("(pointer: coarse)").matches,
            activeAnimations,
            perspective: perspective ? getComputedStyle(perspective).perspective : "none",
            transformStyle: depthRoot ? getComputedStyle(depthRoot).transformStyle : "flat",
          };
        });

        expect(policy.coarsePointer || viewport.width < 1024, `${viewport.name}: test precondition`).toBe(true);
        expect(policy.reducedMotion, `${viewport.name}: no user opt-out`).toBe(false);
        expect(
          policy.activeAnimations,
          `${viewport.name}: viewport width or pointer type must not silently disable the visual animations`,
        ).toEqual([
          ".aurora-1: aurora-1",
          ".aurora-2: aurora-2",
          ".aurora-3: aurora-3",
          ".hero-glow: hero-pulse",
          ".ecg-animate: ecgDraw",
          ".about-signal-trace-flow: about-trace-flow",
          ".marquee-track: marquee",
        ]);
        expect(policy.perspective, `${viewport.name}: 3D scene remains available`).not.toBe("none");
        expect(policy.transformStyle, `${viewport.name}: depth hierarchy remains 3D`).toBe("preserve-3d");
      } finally {
        await context.close();
      }
    }
  });

  test("large screens avoid persistent compositor promotion on static content", async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Compositor policy runs once in Chromium");

    const { context, page } = await openResponsivePage(browser, {
      name: "large-desktop",
      width: 2560,
      height: 1440,
    });
    try {
      const promoted = await page.evaluate(() => {
        const selectors = [
          ".hero-affiliation-card",
          ".hero-affiliation-surface-motion",
          ".project-card-3d",
          ".phase-panel-3d",
          ".skill-panel-3d",
          "[data-about-identity]",
          "[data-about-lead]",
          "[data-about-body]",
          "[data-about-focus]",
          "[data-achievement-node]",
        ];
        return Array.from(document.querySelectorAll<HTMLElement>(selectors.join(",")))
          .filter((element) => getComputedStyle(element).willChange !== "auto")
          .map((element) => ({
            marker:
              element.getAttribute("data-project-card") ??
              element.getAttribute("data-about-identity") ??
              element.className,
            willChange: getComputedStyle(element).willChange,
          }));
      });

      expect(promoted, "static content should not reserve compositor layers").toEqual([]);
    } finally {
      await context.close();
    }
  });

  test("scroll animation maintains a bounded frame and long-task budget", async ({
    browser,
    browserName,
  }, testInfo) => {
    test.setTimeout(240_000);
    test.skip(browserName !== "chromium", "Detailed timing APIs and CPU throttling are Chromium-only");

    const scenarioFilter = process.env.MOTION_PERF_SCENARIO;
    const sampleCount = Math.max(
      1,
      Number.parseInt(process.env.MOTION_PERF_SAMPLES ?? "3", 10) || 3,
    );
    const scenarios = [
      {
        viewport: { name: "phone", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
        cpuRate: 1,
      },
      { viewport: { name: "laptop", width: 1366, height: 768 }, cpuRate: 1 },
      { viewport: { name: "large-desktop", width: 2560, height: 1440 }, cpuRate: 1 },
      { viewport: { name: "throttled-laptop", width: 1366, height: 768 }, cpuRate: 4 },
    ].filter(({ viewport }) => !scenarioFilter || viewport.name === scenarioFilter);

    expect(scenarios.length, "MOTION_PERF_SCENARIO must select a known scenario").toBeGreaterThan(0);

    const results: Array<{
      label: string;
      throttled: boolean;
      metrics: FrameMetrics;
      runs: FrameMetrics[];
    }> = [];

    for (const scenario of scenarios) {
      const runs: FrameMetrics[] = [];
      for (let sample = 0; sample < sampleCount; sample += 1) {
        const { context, page } = await openResponsivePage(
          browser,
          scenario.viewport,
          { blockExternalFonts: true },
        );
        try {
          if (scenario.cpuRate > 1) {
            const session = await context.newCDPSession(page);
            await session.send("Emulation.setCPUThrottlingRate", { rate: scenario.cpuRate });
          }

          await startFrameProbe(page);
          if (scenario.viewport.touch) {
            await performTouchScroll(context, page, scenario.viewport);
          } else {
            const wheelStep = Math.max(280, Math.round(scenario.viewport.height * 0.7));
            for (let step = 0; step < 18; step += 1) {
              await page.mouse.wheel(0, wheelStep);
              await page.waitForTimeout(24);
            }
          }
          await page.waitForTimeout(900);
          runs.push(await stopFrameProbe(page));
        } finally {
          await context.close();
        }
      }

      const label = `${scenario.viewport.name}-${scenario.cpuRate}x`;
      const metrics = medianMetrics(runs);
      results.push({
        label,
        throttled: scenario.cpuRate > 1,
        metrics,
        runs,
      });
      await testInfo.attach(`${label}.json`, {
        body: Buffer.from(JSON.stringify({ median: metrics, runs }, null, 2)),
        contentType: "application/json",
      });
      console.info(`[motion-benchmark] ${label} ${JSON.stringify(metrics)}`);
    }

    for (const { label, throttled, metrics } of results) {
      expect(metrics.samples, `${label}: enough frame samples`).toBeGreaterThan(30);
      expect(metrics.p95FrameMs, `${label}: p95 frame interval`).toBeLessThanOrEqual(
        throttled ? 50 : 34,
      );
      expect(metrics.longestFrameMs, `${label}: longest frame interval`).toBeLessThanOrEqual(
        throttled ? 180 : 120,
      );
      expect(metrics.over50msRatio, `${label}: frames slower than 20fps`).toBeLessThanOrEqual(
        throttled ? 0.1 : 0.03,
      );
      expect(metrics.longTaskTotalMs, `${label}: total long-task blocking`).toBeLessThanOrEqual(
        throttled ? 350 : 150,
      );
      expect(
        metrics.over100msAnimationFrames,
        `${label}: animation frames above 100ms`,
      ).toBeLessThanOrEqual(throttled ? 3 : 1);
    }
  });
});
