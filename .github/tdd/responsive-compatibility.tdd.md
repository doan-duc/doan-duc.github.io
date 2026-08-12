# Responsive compatibility - TDD evidence

## Acceptance scope

The portfolio must remain usable without horizontal overflow or clipped content across small phones, phone landscape, tablets, split-screen windows, laptops, desktops, and ultrawide displays. Navigation, project video dialogs, pinned research content, touch targets, keyboard focus, reduced motion, and failed web-font loading are included in the acceptance criteria.

## RED / GREEN report

- RED checkpoint: `63f5bd0` (`test: add responsive compatibility matrix`).
- Breakpoint RED checkpoint: `7aba8c8` (`test: cover tablet navigation breakpoint`).
- RED command: `npx playwright test --config=playwright.responsive.config.ts --project=chromium`.
- RED evidence: 8 Chromium tests ran; 3 passed and 5 failed. The failures exposed 40 px navigation and icon targets, clipped video controls in short landscape, a pinned Featured Research layout on short/touch tablets, and smooth scrolling under reduced motion.
- Additional RED checks reproduced an About 3D transform under reduced motion, focus escaping an `aria-modal` dialog, Lenis remaining active after a runtime motion-preference change, and a Featured Research heading clipped by WebKit at 1366 x 768.
- GREEN checkpoint: `2307103` (`fix: harden responsive layouts and interactions`).
- GREEN commands: `npm test`, `npm run typecheck`, and `npm audit --audit-level=high`.
- GREEN evidence: the production build passed, all 20 static-export tests passed, and Playwright completed with 19 passed, 14 intentional engine-specific skips, and 0 failures across Chromium, Firefox, and WebKit. TypeScript passed and npm reported 0 vulnerabilities.

## Responsive matrix

| Coverage | Range / cases | Result |
|---|---|---|
| Continuous Chromium width sweep | 320-2560 px in 16 px steps, plus every breakpoint at -1/0/+1 | PASS |
| Height sweep | 320-1200 px at widths 320, 390, 667, 844, 1023, 1024, 1366, and 2560 | PASS |
| Representative layouts | phone portrait/landscape, tablet, split screen, laptop, desktop, ultrawide, portrait monitor, 3840 x 2160 4K, and 320 x 320 minimum square | PASS |
| Browser engines | current bundled Chromium, Firefox, and WebKit | PASS |
| Input and accessibility | touch targets, keyboard menu/modal flow, focus containment/restoration, Escape, reduced motion | PASS |
| Resilience | failed external font, image load/decode, runtime media-query changes | PASS |

## Fixes covered

- Desktop/mobile navigation now switches at 1024 px, uses 44 px touch targets, scrolls safely in short landscape, locks background scrolling, and provides modal keyboard semantics.
- Project video dialogs use flex sizing so native controls stay visible at short viewport heights.
- Featured Research pins only on sufficiently large, tall, fine-pointer viewports and becomes a normal document-flow section elsewhere.
- About, magnetic, tilt, marquee, and scroll-driven depth stay active on compact/coarse-pointer devices; only reduced motion disables them, including runtime preference changes.
- Narrow Recognition spacing and Featured Research heading wrapping no longer overflow or clip.
- The local static test server resolves real paths before serving files and rejects paths outside the export directory.

## Visual QA

Final screenshot and interaction review covered 320 x 568, 390 x 844, 844 x 390 touch landscape, 1024 x 768 touch tablet, 1366 x 768 laptop, 1920 x 1080 desktop, 2560 x 1440 ultrawide, and 3840 x 2160 4K. No clipped copy, inaccessible control, card overlap, console error, or unintended horizontal overflow remained. Touch press retained live tilt/glare, desktop hover reversed smoothly with distinct intermediate transforms, and wheel input produced continuous intermediate scroll positions.

## Coverage boundary

No finite automated suite can guarantee every physical device, browser version, OS text-scaling setting, or future engine change. This suite provides a reproducible compatibility envelope for current engines over continuous widths 320-2560 px, representative 3840 x 2160 coverage, and heights 320-1200 px, with boundary, orientation, touch, keyboard, motion-preference, and asset-failure checks. Real-device spot checks should still accompany future structural or typography changes.
