# Motion smoothness - TDD evidence

## Acceptance scope

The portfolio's 3D hover, decorative motion, and scroll animation must stay smooth across the responsive envelope without layout work on pointer hot paths, persistent compositor promotion on static content, or long main-thread stalls during animated scrolling.

## RED / GREEN report

- RED checkpoint: `c5093c4` (`test: add motion smoothness performance budgets`).
- RED command: `npm run test:performance`.
- RED evidence: the new budgets exposed the prior pointer hot path doing 180 geometry/media-query reads for 180 synthetic mouse moves, and the large-desktop scroll benchmark at 2560 x 1440 missed the motion budget with p95 frame interval 83.4 ms, >50 ms frame ratio 67.5%, longest frame 116.7 ms, and 4 long animation frames over 100 ms.
- GREEN command: `npm run test:performance`.
- GREEN evidence: all 4 Chromium performance tests passed in `playwright-performance-report/index.html`; decoded stdout reported phone, laptop, large-desktop, and 4x throttled laptop medians with no long tasks and no long animation frames over 100 ms.
- Targeted five-run confirmation: `$env:MOTION_PERF_SCENARIO='large-desktop'; $env:MOTION_PERF_SAMPLES='5'; npm run test:performance`.
- Five-run large-desktop median at 2560 x 1440: p95 frame interval 33.4 ms, >50 ms frame ratio 0%, longest frame 50.0 ms, 0 long tasks, and 0 long animation frames over 100 ms.

## Commands

```powershell
npm run test:performance
$env:MOTION_PERF_SCENARIO='large-desktop'; $env:MOTION_PERF_SAMPLES='5'; npm run test:performance
npm run test:responsive:run
npm run typecheck
npm audit --audit-level=high
```

## Test specification

| Guarantee | Test file or command | Type | Result | Evidence |
|---|---|---|---|---|
| Pointer effects cache geometry and pointer capability instead of recalculating per mousemove | `tests/e2e/responsive-performance.spec.ts` | E2E performance | PASS | 180 synthetic moves per target; budget <=2 rect reads and <=1 media-query read |
| Coarse-pointer and compact screens disable continuous decorative animation, fixed grain paint, blur glass, and persistent promotion | `tests/e2e/responsive-performance.spec.ts` | E2E policy | PASS | phone, phone-landscape, and touch-tablet cases |
| Large desktop static content does not reserve persistent compositor layers | `tests/e2e/responsive-performance.spec.ts` | E2E policy | PASS | 2560 x 1440 static-content promotion check |
| Scroll animation remains inside frame and long-task budgets | `tests/e2e/responsive-performance.spec.ts` | E2E performance | PASS | Chromium `requestAnimationFrame` cadence plus `PerformanceObserver` long-task/LoAF probe |
| Responsive envelope still passes while motion policy changes are active | `.github/tdd/responsive-compatibility.tdd.md` | E2E compatibility | PASS | width sweep 320-2560 px, height sweep 320-1200 px, Chromium/Firefox/WebKit, touch, landscape, keyboard, reduced motion |

## Final measured medians

| Scenario | Viewport / CPU | Samples | p95 frame | Longest frame | >50 ms ratio | Long tasks | LoAF >100 ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| phone | 390 x 844, touch, 1x | 125 | 16.8 ms | 16.8 ms | 0% | 0 | 0 |
| laptop | 1366 x 768, 1x | 143 | 16.8 ms | 33.4 ms | 0% | 0 | 0 |
| large desktop | 2560 x 1440, 1x | 117 | 33.4 ms | 50.0 ms | 0% | 0 | 0 |
| throttled laptop | 1366 x 768, 4x CPU | 223 | 33.4 ms | 50.1 ms | 0.89% | 0 | 0 |

The `playwright-performance-report/index.html` run used `MOTION_PERF_SAMPLES` defaulting to 3 samples per scenario. The targeted large-desktop command above raised the sample count to 5 and preserved the requested 33.4 ms / 0% / 50.0 ms median.

## Screen matrix

Responsive compatibility is covered by `playwright.responsive.config.ts` across Chromium, Firefox, and WebKit. The documented matrix in `.github/tdd/responsive-compatibility.tdd.md` covers 320-2560 px width sweeps, 320-1200 px height sweeps, phone portrait, phone landscape, tablet, split screen, laptop, desktop, ultrawide, 320 x 320 minimum square, touch input, keyboard/focus behavior, reduced motion, and asset failure. Motion timing and 4x CPU throttling are Chromium-only in `playwright.performance.config.ts`.

## Visual QA

A temporary screenshot run covered phone, laptop, and ultrawide top/projects views. The reviewed frames showed no clipped copy, unintended horizontal overflow, hidden controls, or broken motion-rest states after the performance changes; the temporary screenshots were not committed.

## Documentation basis

- Playwright `browserContext.addInitScript()` runs after document creation and before page scripts, which supports early instrumentation: https://playwright.dev/docs/api/class-browsercontext
- Playwright `browserContext.newCDPSession()` is Chromium-only, so CPU throttling is not asserted for Firefox/WebKit: https://playwright.dev/docs/api/class-browsercontext
- Playwright CDPSession talks raw Chrome DevTools Protocol: https://playwright.dev/docs/api/class-cdpsession
- Chrome DevTools Protocol `Emulation.setCPUThrottlingRate` defines CPU throttling by slowdown rate: https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setCPUThrottlingRate
- MDN documents `requestAnimationFrame()` cadence, refresh-rate variance, and background pause behavior: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- MDN documents `PerformanceObserver.supportedEntryTypes` as browser-varying, so the probe feature-detects `longtask` and `long-animation-frame`: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/supportedEntryTypes_static
- W3C Long Tasks defines long tasks as UI-thread monopolization that blocks critical work: https://www.w3.org/TR/longtasks-1/
- Chrome Long Animation Frames docs describe LoAF as frame-oriented jank evidence and list Chrome/Edge support without Firefox/Safari support: https://developer.chrome.com/docs/web-platform/long-animation-frames

## Limits

Headless emulation cannot guarantee every physical GPU, browser version, OS compositor, display refresh rate, thermal state, or driver path. This evidence is a reproducible current-engine budget over the repository's automated 320-2560 px matrix, with separate Chromium-only timing and 4x CPU checks.
