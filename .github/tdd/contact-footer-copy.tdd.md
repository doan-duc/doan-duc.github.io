# Contact and footer copy — TDD evidence

## Source and user journeys

The acceptance criteria came directly from the user's portfolio copy requests; no external plan file was used.

- As a portfolio visitor, I want the Contact statement to read “Relentless practice builds mastery.” so that the page closes with the approved message.
- As a portfolio visitor, I want the framework credit removed from the footer while retaining the copyright notice.

## RED / GREEN report

- RED checkpoint: `9486446` (`test: require approved contact and footer copy`).
- RED command: `node --test tests/contact-footer-copy.test.mjs`.
- RED evidence: 0 of 2 tests passed. The exported Contact heading still read “Let's build something useful.” and the footer still contained the Next.js/GSAP/Lenis/Framer Motion credit.
- GREEN checkpoint: `653e0ca` (`feat: refine contact and footer copy`).
- GREEN command: `node --test tests/contact-footer-copy.test.mjs`.
- GREEN evidence: 2 of 2 focused tests passed after changing the heading and removing the technology credit.
- Regression command: `npm test`.
- Regression evidence: all 20 tests passed after a production build.
- Additional validation: `npm run typecheck` passed; `npm audit --audit-level=high` reported 0 vulnerabilities.

## Test specification

| # | What is guaranteed | Test target | Type | Result |
|---|---|---|---|---|
| 1 | Generated and deployed Contact sections render the exact approved mastery statement and exclude the former sentence | `tests/contact-footer-copy.test.mjs` | Static-export integration | PASS |
| 2 | Generated and deployed footers omit the framework credit while preserving the copyright notice | `tests/contact-footer-copy.test.mjs` | Static-export integration | PASS |
| 3 | Existing portfolio content and media behavior remain intact | `npm test` | Regression suite | PASS |

## Coverage and known gaps

The repository uses Node's zero-dependency test runner against the production static export and does not have line-coverage instrumentation. Both user-visible acceptance criteria are exercised against `out/index.html` and the root deployment HTML.
