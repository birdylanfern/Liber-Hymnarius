# Liber Hymnarius V1.3 - Windows setup and audit

## Installation
1. Install Node.js LTS from https://nodejs.org/ (includes npm).
2. Extract this ZIP to a normal writable directory (for example, Documents\Liber-Hymnarius).
3. Open PowerShell in the extracted directory (the directory containing `package.json`).
4. Run `npm ci` (requires internet access to npm registry). This installs Express and the locked dependencies. Do not run `node server.js` before this step.
5. Run `npm start` and visit `http://localhost:3000` in a browser.
6. Stop the server with Ctrl+C. To use a different port in PowerShell: `$env:PORT=8080; npm start`.

## Reproducible checks
- `npm run build` rebuilds the site index.
- `npm run coverage` regenerates COVERAGE.md.
- `npm run reconcile:all` generates data/complete-reconciliation.json.
- `node tools/export-reconciliation-review.js` generates data/liturgical-slot-review.csv and slot-review.html.
- `npm run audit:slots` reports classification/slot inconsistencies.
- `npm run audit:sources` audits referenced score files.

## Audit result for this package
The baseline was recalculated from the actual supplied V1.3 files, not accepted on trust: 429 defined liturgical slots; 339 populated and 90 unfilled. Among the unfilled, 5 have same-hour candidates needing rubric/variant review, 5 have unidentified-hour candidates, and 80 have no local candidate. There are 27 populated slots assigned unchecked scores. These are **not** 339 musically verified scores.

The source-integrity script reported 495 catalogue records, 486 physical GABC files, 483 distinct referenced files, 0 missing referenced files, 0 unindexed files, and 3 auxiliary psalm scores. The slot consistency audit also reported 12 ambiguous variants, 29 missing hours, 3 hours absent from the taxonomy, 12 psalm-tone references and 34 unclassified records; these are diagnostic counts, not necessarily distinct defects.

## Scope limitation
This is an audited baseline and installation-ready project package, **not a completed or fully PDF-verified digital edition**. The supplied PDF is a 150-image-page scan containing two printed pages per PDF page and only part of the full printed volume; it cannot establish a full-volume audit by itself. No speculative music was added or promoted to verified. No claim is made that all hymn verses, Amens, invitatory tones, variant tabs, or browser behavior were manually checked. External GregoBase access and Windows browser execution were not verified in this environment. An offline `npm ci` was attempted and failed because npm packages were not cached; Windows users should run normal online `npm ci`.

For every slot and candidate, consult `data/liturgical-slot-review.csv` or open `slot-review.html`. The 80 no-local-candidate slots are **not** proven globally unavailable from GregoBase; they are only absent from this project's current local catalogue.
