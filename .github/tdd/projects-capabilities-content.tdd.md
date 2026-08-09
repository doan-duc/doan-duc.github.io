# Portfolio content cleanup — TDD evidence

## Source and user journeys

The acceptance criteria were derived directly from the user's requested portfolio copy; no external plan file was used.

- As a portfolio visitor, I want Selected Work to show only the two substantive system projects so that the section stays focused.
- As a recruiter or supervisor, I want each project to explain its problem, implementation, learning, and significance accurately.
- As a portfolio visitor, I want the capability section to use the approved four-part taxonomy so that the tools and methods behind the work are easy to scan.
- As a portfolio visitor, I want the SCIC scholarship placed directly after the HSIL Hackathon and the Bosch entry removed so that Recognition reflects the approved achievements.
- As a portfolio visitor, I want no CV download action or PDF file so that the site does not expose an outdated document.

## RED / GREEN report

### Selected Work

- RED checkpoint: `8cd6913` (`test: require two approved project stories`).
- RED command: `npm test`.
- RED evidence: 8 tests passed and 3 new tests failed because the export contained three cards, the new Jetson title was absent, and the new OSCO copy was absent.
- GREEN checkpoint: `9dada4c` (`feat: focus selected work on two projects`).
- GREEN command: `npm test`.
- GREEN evidence: all 11 tests passed; the export contained exactly two ordered cards with the approved project stories.

### What I Work With

- RED checkpoint: `ef6ed59` (`test: require approved capability taxonomy`).
- RED command: `node --test tests/capabilities-content.test.mjs`.
- RED evidence: both new tests failed because the old subtitle and capability taxonomy were still rendered.
- GREEN checkpoint: `11a49ba` (`feat: refine capabilities and tooling`).
- GREEN command: `npm test`.
- GREEN evidence: all 13 tests passed, including the approved heading, four ordered panels, descriptions, and tags.

### Recognition

- RED checkpoint: `2197add` (`test: require SCIC recognition after HSIL`).
- RED command: `node --test tests/recognition-content.test.mjs`.
- RED evidence: both tests failed because the second node was UTokyo instead of SCIC and the Bosch entry remained in the export.
- GREEN checkpoint: `1c078bf` (`feat: add SCIC scholarship recognition`).
- GREEN command: `npm test`.
- GREEN evidence: all 15 tests passed; SCIC followed HSIL and Bosch was absent.

### CV removal

- RED checkpoint: `d3d9a8a` (`test: require complete CV removal`).
- RED command: `node --test tests/contact-cv-removal.test.mjs`.
- RED evidence: both tests failed because the CTA/URL and exported PDF were still present.
- GREEN checkpoint: `b2adbcd` (`feat: remove CV download and file`).
- GREEN command: `npm test`.
- GREEN evidence: all 17 tests passed; no CTA, URL, source PDF, or deployed PDF remained.
- Deployment RED checkpoint: `368f31b` (`test: cover deployed CV references`).
- Deployment RED command: `node --test tests/contact-cv-removal.test.mjs`.
- Deployment RED evidence: the generated export was clean, but the root deployment HTML and README still referenced the removed CV.
- Deployment GREEN checkpoint: `bd211c3` (`chore: publish portfolio content updates`).
- Deployment GREEN command: `node --test tests/contact-cv-removal.test.mjs`.
- Deployment GREEN evidence: all 3 focused tests passed after synchronizing the root static export and removing the stale README references.
- Refactor checkpoint: `b815e04` (`refactor: derive marquee from capability tags`). The same 17-test suite passed after deriving marquee items directly from the approved panels.

Final validation: all 18 tests passed; `npm run typecheck` passed; `npm audit --audit-level=high` reported 0 vulnerabilities.

## Test specification

| # | What is guaranteed | Test target | Type | Result |
|---|---|---|---|---|
| 1 | Selected Work exports exactly two ordered project cards and excludes the former RAG project 03 | `tests/projects-content.test.mjs` | Static-export integration | PASS |
| 2 | Project 01 contains the approved Jetson title and four narrative blocks | `tests/projects-content.test.mjs` | Static-export integration | PASS |
| 3 | Project 02 contains the approved OSCO title and four narrative blocks | `tests/projects-content.test.mjs` | Static-export integration | PASS |
| 4 | What I Work With renders the approved heading and exactly four panels | `tests/capabilities-content.test.mjs` | Static-export integration | PASS |
| 5 | Every capability panel contains its approved title, description, and tags | `tests/capabilities-content.test.mjs` | Static-export integration | PASS |
| 6 | SCIC is the second Recognition node immediately after HSIL and Bosch is absent | `tests/recognition-content.test.mjs` | Static-export integration | PASS |
| 7 | The CV CTA, URL, source asset, exported PDF, deployed HTML reference, and README reference are absent | `tests/contact-cv-removal.test.mjs` | Static-export integration | PASS |
| 8 | Existing videos, affiliations, About, and current-focus behavior remains intact | `npm test` | Regression suite | PASS |

## Coverage and known gaps

This repository uses Node's zero-dependency test runner against the static export and has no line-coverage instrumentation. The user-visible acceptance criteria for these content changes are covered, but a numeric source-line coverage percentage is unavailable.

The RED and GREEN checkpoints remain separately reachable in branch history; no squash is planned for this direct-to-main deployment.
