# Venite runtime verification — 24 November 2026

## Checks completed
- 49 CSV mappings checked against the JavaScript runtime lookup, Psalm 94 tone selector and existing GABC files.
- All 49 mappings passed these static consistency checks.
- Removed duplicated automatic selection branch for modes II, III and VII.
- Prevented mode-based fallback when a documented printed-book pairing points to an unavailable score. A warning now appears instead.
- `node --check app.js`, `npm run test:venite`, and `npm test` pass.
- Existing smoke test: 508 catalogue records, 499 unique referenced GABC, 0 structural errors, 12 existing warnings.

## Browser test limitation
A real browser navigation attempt using headless Chromium/Playwright was blocked by the environment (`ERR_BLOCKED_BY_ADMINISTRATOR` for localhost). Therefore visual rendering, manual switching, antiphon repetition, and playback are NOT certified as browser-tested. The app currently displays the antiphon and Psalm 94 notation together, but the rubric-directed antiphon repetition remains an instruction, not a fully automatically interleaved musical score.

## To test on Windows
1. `npm ci`
2. `npm run test:venite`
3. `npm test`
4. `npm start`, then open `http://localhost:3000`.
5. Open an invitatory with a printed reference, confirm the prescribed Psalm 94 notation appears and the corresponding selector is pressed; switch tones and use Hide notation. Check Sunday/weekday and Eastertide variants separately.

No note-by-note comparison against the scanned Liber Hymnarius was performed in this test.
