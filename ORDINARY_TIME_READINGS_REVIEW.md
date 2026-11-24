# Ordinary Time Office of Readings: PDF rubric reconciliation

The 1983 *Liber Hymnarius* prints separate Office of Readings hymns when the office is celebrated **noctu** versus **diurno tempore**. This pass matched existing imported GABC titles to those printed rubrics for Ordinary Time Weeks I/III and II/IV, Sunday through Saturday.

- 14 liturgical days examined; 28 noctu/diurno slot assignments.
- 37 GABC metadata records updated (including alternative rhythmic transcriptions).
- No musical notes or lyric texts changed.
- Populated slot count increased from 253/424 to 280/424; the difference is 27 because one slot was already populated.
- The source for each record is logged in `data/ordinary-readings-rubric-fixes.json` with printed page references.
- This establishes the printed hour/variant rubric, **not** note-by-note verification of the GABC transcription.

Run `node tools/verify-ordinary-readings.js`, `npm run build`, `npm run reconcile:all` to reproduce. Note: the correction script expects the original imported metadata; it is safe to rerun and replaces existing variant headers.

Remaining: 144 unfilled slots, including 21 same-hour ambiguous cases, 21 missing-hour cases, and 102 slots without local same-section candidates. These categories are reconciliation diagnostics, not proof that 102 new chants are missing.
