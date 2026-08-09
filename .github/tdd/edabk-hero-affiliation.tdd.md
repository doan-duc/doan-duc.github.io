# EDABK hero affiliation — TDD evidence

## Source and user journey

The acceptance criteria were derived from the user's request; no external plan file was used.

As a portfolio visitor, I want to see HUST and EDABK together at the top of the page so that the owner's university and research-lab affiliations are clear without turning EDABK into About content.

## RED / GREEN report

- RED checkpoint: `512a4ee` (`test: require EDABK hero affiliation`).
- RED command: `npm test`.
- RED evidence: 6 tests passed and the new affiliation test failed because `data-hero-affiliations` was absent.
- GREEN command: `npm test`.
- GREEN evidence: 7 tests passed, including the same affiliation test and the About exclusion test.
- Role-correction RED checkpoint: `433cd46` (`test: prevent overstated EDABK role`).
- Role-correction RED evidence: 6 tests passed and the EDABK test failed because `Lab Member` was absent.
- Role-correction GREEN evidence: the same 7-test suite passed after replacing `AI Researcher` with `Lab Member`.
- Motion RED checkpoint: `b2d4fa1` (`test: require spring 3D affiliations`).
- Motion RED evidence: 6 tests passed and the EDABK test failed because the spring-3D surfaces were absent.
- Motion GREEN evidence: the same 7-test suite passed after adding reduced-motion-aware spring surfaces to both affiliations.
- School-acronym RED checkpoint: `f3b9ff7` (`test: require SEEE affiliation acronym`).
- School-acronym RED command: `node --test tests/hero-hust-affiliation.test.mjs`.
- School-acronym RED evidence: 2 tests passed and the EDABK affiliation test failed because the export still displayed `SET, HUST` instead of `SEEE, HUST`.
- School-acronym GREEN evidence: after rebuilding, the same focused suite passed 3/3; the full static suite passed 20/20 and `npm run typecheck` passed.
- Additional validation: `npm run typecheck` passed; `npm audit --audit-level=high` reported 0 vulnerabilities.

## Test specification

| # | What is guaranteed | Test target | Type | Result |
|---|---|---|---|---|
| 1 | HUST remains a single linked hero affiliation with its local logo and official name | `tests/hero-hust-affiliation.test.mjs` | Static-export integration | PASS |
| 2 | EDABK appears exactly once beside HUST, identifies the owner only as a `Lab Member`, links to the official lab page, and uses the supplied local logo | `tests/hero-hust-affiliation.test.mjs` | Static-export integration | PASS |
| 3 | The exported About section contains neither `EDABK` nor `EDA-BK` | `tests/hero-hust-affiliation.test.mjs` | Static-export integration | PASS |
| 4 | Both hero affiliations expose independent spring-3D surfaces while retaining a labelled group | `tests/hero-hust-affiliation.test.mjs` | Static-export integration | PASS |
| 5 | The EDABK card displays the current `SEEE, HUST` school acronym and does not display the retired `SET, HUST` label | `tests/hero-hust-affiliation.test.mjs` | Static-export integration | PASS |

## Coverage and known gaps

This repository uses Node's zero-dependency test runner against the static export and has no line-coverage instrumentation. All acceptance criteria for this change are covered, but a numeric source-line coverage percentage is therefore unavailable.

The GREEN checkpoint is the implementation commit containing this report; the RED checkpoint remains separately reachable in branch history.
