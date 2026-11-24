# Full supplied source: corrected audit

The user's newly supplied PDF is SHA-256 identical to the previously supplied PDF. Both have **320 PDF pages** (`pdfinfo`), not 150. The 150-page display was a preview limitation, not the actual PDF length.

A local reference copy is available at `/reference/Liber-Hymnarius-1983.pdf` when running the website. This allows the remaining scanned pages to be inspected alongside the digital edition.

## Structural check

`npm test` reports 495 catalogue records, 486 referenced GABC files, 429 liturgical slot rows, zero missing-reference/structural errors, and 12 notation-format warnings. Existing slot reconciliation is 339 populated, 90 unfilled. None of these checks certifies that a GABC melody is the 1983 printed melody.

## Outstanding editorial work

All 90 unfilled slots and 27 unchecked populated assignments require individual editorial review. Existing unverified GABC files have not been promoted to verified. No guessed melodies or invented verses were inserted. This archive is **not** a complete verified edition.
