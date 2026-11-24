# Remaining completion status — evidence-constrained release

This release is **not** a complete musically verified edition. The original 429-slot audit remains 339 populated / 90 unfilled, including 27 populated slots with unchecked assignments. No unverified chant has been substituted to inflate coverage.

## Additional work completed

- Added `npm test`, an automated check of every indexed score reference, auxiliary invitatory score reference, core web asset, GABC separator, and basic notation markers.
- Preserved existing GABC files and the prior audit catalogue.
- Exported machine-readable results in `data/automated-smoke-test.json`.

## Still required

- A complete source for the remainder of the 1983 printed book: the supplied PDF is a 150-image-page scan, and cannot alone establish the entirety of the volume.
- Individual source checks of the 90 unfilled slots and 27 unchecked populated assignments against the printed book and independently obtained GregoBase files.
- Note-by-note validation, full verses, Amen conventions, antiphon/psalm-tone rubrics, and browser interaction tests on Windows.
- A genuinely unavailable GABC list cannot be certified without individual external repository searches and comparison to the full book.

`npm test` is a **structural smoke test**, not musical validation or a browser end-to-end test. Warnings in the JSON output need individual review.
