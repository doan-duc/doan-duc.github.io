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
- Additional validation: `npm run typecheck` passed; `npm audit --audit-level=high` reported 0 vulnerabilities.

## Test specification

| # | What is guaranteed | Test target | Type | Result |
|---|---|---|---|---|
| 1 | HUST remains a single linked hero affiliation with its local logo and official name | `tests/hero-hust-affiliation.test.mjs` | Static-export integration | PASS |
| 2 | EDABK appears exactly once beside HUST in one labelled affiliation group, links to the official lab page, and uses the supplied local logo | `tests/hero-hust-affiliation.test.mjs` | Static-export integration | PASS |
| 3 | The exported About section contains neither `EDABK` nor `EDA-BK` | `tests/hero-hust-affiliation.test.mjs` | Static-export integration | PASS |

## Coverage and known gaps

This repository uses Node's zero-dependency test runner against the static export and has no line-coverage instrumentation. All acceptance criteria for this change are covered, but a numeric source-line coverage percentage is therefore unavailable.

The GREEN checkpoint is the implementation commit containing this report; the RED checkpoint remains separately reachable in branch history.
