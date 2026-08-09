import { expect, test, type Browser, type Page } from "@playwright/test";
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
      if (query === "(hover: none), (pointer: coarse)") mediaQueryReads += 1;
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

async function auditPointerSweep(page: Page, selector: string) {
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  await target.hover({ position: { x: 8, y: 8 } });

  return target.evaluate(async (element) => {
    const nativeRect = element.getBoundingClientRect;
    const bounds = nativeRect.call(element);
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
        element.dispatchEvent(
          new MouseEvent("mousemove", {
            bubbles: true,
            clientX: bounds.left + 4 + (bounds.width - 8) * progress,
            clientY:
              bounds.top + bounds.height / 2 + Math.sin(progress * Math.PI * 4) * 4,
            view: window,
          }),
        );
      }

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      return { rectReads, ...audit.snapshot() };
    } finally {
      Reflect.deleteProperty(element, "getBoundingClientRect");
    }
  });
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

        const tilt = await auditPointerSweep(page, "[data-project-card] > div");
        expect(
          tilt.rectReads,
          `${viewport.name}: TiltCard must cache geometry for a hover session`,
        ).toBeLessThanOrEqual(2);
        expect(
          tilt.mediaQueryReads,
          `${viewport.name}: TiltCard must cache pointer capability`,
        ).toBeLessThanOrEqual(1);
      } finally {
        await context.close();
      }
    }
  });

  test("compact and coarse-pointer screens use a low-paint motion profile", async ({
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
            ["#aurora", "::after"],
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
          const promoted = Array.from(
            document.querySelectorAll<HTMLElement>(
              [
                "[data-project-card]",
                "[data-skill-panel]",
                "[data-achievement-node]",
                "[data-about-identity]",
                "[data-about-lead]",
                "[data-about-body]",
                "[data-about-focus]",
              ].join(","),
            ),
          ).flatMap((element) => {
            const hint = getComputedStyle(element).willChange;
            return hint === "auto" ? [] : [`${element.tagName.toLowerCase()}: ${hint}`];
          });
          const glass = document.querySelector<HTMLElement>(".glass-3d");
          const glassStyle = glass ? getComputedStyle(glass) : null;
          const backdrop = glassStyle
            ? glassStyle.backdropFilter ||
              (glassStyle as CSSStyleDeclaration & { webkitBackdropFilter?: string })
                .webkitBackdropFilter ||
              "none"
            : "none";
          const grain = document.querySelector<HTMLElement>("#grain");

          return {
            coarsePointer: matchMedia("(pointer: coarse)").matches,
            activeAnimations,
            promoted,
            backdrop,
            grainDisplay: grain ? getComputedStyle(grain).display : "none",
          };
        });

        expect(policy.coarsePointer || viewport.width < 1024, `${viewport.name}: test precondition`).toBe(true);
        expect(policy.activeAnimations, `${viewport.name}: continuous decorative motion`).toEqual([]);
        expect(policy.promoted, `${viewport.name}: persistent compositor layers`).toEqual([]);
        expect(policy.backdrop, `${viewport.name}: glass blur`).toBe("none");
        expect(policy.grainDisplay, `${viewport.name}: fixed grain paint`).toBe("none");
      } finally {
        await context.close();
      }
    }
  });

  test("scroll animation maintains a bounded frame and long-task budget", async ({
    browser,
    browserName,
  }, testInfo) => {
    test.skip(browserName !== "chromium", "Detailed timing APIs and CPU throttling are Chromium-only");

    const scenarios = [
      {
        viewport: { name: "phone", width: 390, height: 844, mobile: true, touch: true, dpr: 3 },
        cpuRate: 1,
      },
      { viewport: { name: "laptop", width: 1366, height: 768 }, cpuRate: 1 },
      { viewport: { name: "large-desktop", width: 2560, height: 1440 }, cpuRate: 1 },
      { viewport: { name: "throttled-laptop", width: 1366, height: 768 }, cpuRate: 4 },
    ];

    const results: Array<{
      label: string;
      throttled: boolean;
      metrics: FrameMetrics;
      runs: FrameMetrics[];
    }> = [];

    for (const scenario of scenarios) {
      const runs: FrameMetrics[] = [];
      for (let sample = 0; sample < 3; sample += 1) {
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
          const wheelStep = Math.max(280, Math.round(scenario.viewport.height * 0.7));
          for (let step = 0; step < 18; step += 1) {
            await page.mouse.wheel(0, wheelStep);
            await page.waitForTimeout(24);
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
