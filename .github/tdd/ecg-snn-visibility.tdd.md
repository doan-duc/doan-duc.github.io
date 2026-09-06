# ECG/SNN public-visibility TDD evidence

## Source and journey

The journey was derived from the request: as the portfolio owner, I want the
ECG/SNN material hidden from the rendered GitHub profile and portfolio while
keeping the original source available in comments for later reuse.

## RED / GREEN report

| Surface | RED evidence | GREEN evidence | Guarantee |
|---|---|---|---|
| Portfolio HTML and decoration | `npm run build; node --test tests/ecg-snn-visibility.test.mjs` failed 2/2 | The same test passed 2/2 after the visibility changes | Exported portfolio HTML contains no ECG/SNN copy, repository link, featured section, or ECG-shaped decoration |
| GitHub profile README | `node --test tests/profile-visibility.test.mjs` failed 1/1 in the profile repo | The same test passed 1/1 after commenting the public blocks | README content outside HTML comments contains no ECG/SNN copy or repository link |

## Validation

- `npm run build` — PASS
- `npm run test:static` — PASS, 29/29
- `npm run typecheck` — PASS
- `npm run test:responsive:smoke` — PASS, 4/4 Chromium smoke tests
- Exported HTML/CSS/JavaScript bundle scan — no forbidden public terms or ECG selectors
- `git diff --check` — PASS (line-ending warnings only)

## Known boundary

The original material remains in source comments or dormant components by
design. This hides rendered content; it does not make a separate public GitHub
repository private or erase Git history.
