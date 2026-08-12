# Signal cursor — TDD evidence

## Scope

The portfolio uses a fine-pointer-only signal cursor: a direct dot, spring
follower, speed-reactive ECG trail, contextual `VIEW`, `PLAY`, and `OPEN ↗`
labels, plus a reusable click pulse. Existing 3D hover, touch tilt, ambient
motion, native touch scrolling, and wheel behavior remain independent.

## RED

- Checkpoint: `38f13c9` (`test: define signal cursor interactions`).
- Command: `npx playwright test --config playwright.responsive.config.ts tests/e2e/responsive-cursor.spec.ts --project=chromium`.
- Result: 5 intended failures and 1 pass before implementation. The missing
  root, dot, ring, contextual labels, click pulse, and hot-path contract failed;
  coarse-pointer/reduced-motion native behavior passed.
- Review-driven regression REDs additionally reproduced runtime
  reduced-motion not unmounting the cursor and a stale `PLAY` state after a
  project dialog opened.

## GREEN contract

- One passive pointer stream writes only the latest sample; one bounded
  `requestAnimationFrame` updates transforms and opacity.
- The dot follows the latest sample while the ring converges through visible
  intermediate frames; rapid event bursts do not recreate DOM or trigger
  layout reads.
- `VIEW` is scoped to the clickable video preview, `PLAY` to its play glyph,
  and `OPEN ↗` to external affiliation/repository links.
- Touch never renders the synthetic cursor. Hybrid touch suppresses
  compatibility mouse events, while a subsequent real mouse PointerEvent can
  reactivate it.
- Text selection, video controls, dialogs, inputs, runtime reduced motion, and
  Windows High Contrast use the platform cursor.

## Verification commands

```powershell
npm run typecheck
npm run build
npm run test:static
npm run test:responsive:run
npm run test:performance
npm audit --audit-level=high
```

The responsive cursor spec covers Chromium, Firefox, and WebKit; frame-level
sampling and hot-path instrumentation run once in Chromium. The existing
responsive matrix covers 320 px phone layouts through representative 4K,
touch/coarse pointers, short landscapes, keyboard behavior, and reduced
motion. The performance suite retains the existing wheel/frame/long-task
budgets without loosening them for this feature.

## Visual QA

Fine-pointer captures at 820×900, 1366×768, 1920×1080, 2560×1440, and
3840×2160 confirmed crisp dot/ring geometry, readable capsules, distinct HUST
and EDABK tones, a bounded ECG trail, and no overflow. The overlay remains
`pointer-events: none`; mobile keeps the native cursor/touch path and all
existing touch animation.

## Limit

Browser emulation cannot represent every physical GPU, accessibility cursor,
driver, refresh rate, or thermal state. The repository therefore combines
cross-engine behavior checks, continuous responsive geometry sweeps,
deterministic hot-path instrumentation, CPU-throttled frame budgets, and
manual visual review.
