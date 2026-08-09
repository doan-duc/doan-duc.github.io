# About identity redesign — TDD evidence

## Source and user journey

The acceptance criteria were derived from the user's request; no external plan file was used.

As a portfolio visitor, I want the About section's left side to carry a distinctive visual identity so that the large story on the right feels intentionally balanced rather than surrounded by empty space.

## RED / GREEN report

- RED checkpoint: `e344688` (`test: require balanced About identity`).
- RED command: `npm test`.
- RED evidence: 7 tests passed and the new About identity test failed because `data-about-identity` was absent from the static export.
- GREEN checkpoint: `413415a` (`feat: redesign About identity`).
- GREEN command: `npm test`.
- GREEN evidence: all 8 tests passed, including the approved-copy and semantic 3D identity assertions.
- Additional validation: `npm run typecheck` passed; `npm audit --audit-level=high` reported 0 vulnerabilities.
- Visual validation: the static export was inspected at 2048 × 1100 and 430 × 932 viewports. Pointer QA produced a real `matrix3d` transform and separated the signal layers to approximately 18px, 62px, and 104px on the Z axis.
- Reduced-motion validation: the browser reported `prefers-reduced-motion: reduce`; pointer movement introduced no rotation and the trace animation was limited to one near-zero-duration iteration.

## Test specification

| # | What is guaranteed | Test target | Type | Result |
|---|---|---|---|---|
| 1 | The three approved About paragraphs remain present in the exported About section | `tests/about-copy.test.mjs` | Static-export integration | PASS |
| 2 | About exposes a visible semantic `h2` and a dedicated identity column | `tests/about-copy.test.mjs` | Static-export integration | PASS |
| 3 | The identity includes a spring-3D instrument with signal, intelligence, and system layers | `tests/about-copy.test.mjs` | Static-export integration | PASS |
| 4 | Existing current-focus, affiliation, and project-video export behavior remains intact | `npm test` | Regression suite | PASS |

## Coverage and known gaps

This repository uses Node's zero-dependency test runner against the static export and has no line-coverage instrumentation. All structural acceptance criteria for this change are covered, but a numeric source-line coverage percentage is unavailable.

Pointer depth, responsive composition, and reduced-motion behavior were verified in a real Chromium render through the DevTools protocol. Those visual and computed-style checks are recorded here but are not yet automated as part of `npm test`.

The RED and GREEN checkpoints remain separately reachable in branch history; no squash is planned for this direct-to-main deployment.
