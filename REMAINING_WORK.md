# Classification and coverage status

- 451 GABC files indexed.
- 402 have a category, 49 are still unclassified.
- 187/388 taxonomy slots are populated; 201 slots remain unfilled.
- 24 further category assignments were made by exact printed-page correspondence to existing categories. These assignments are **provisional**; no liturgical hours were guessed.
- The imported chants are attributed to GregoBase's Liber Hymnarius source, not independently verified against every printed score.
- A missing taxonomy slot does **not** imply that its GABC is absent. Many categories lack hour or variant metadata; some slots may not have a separate score in the source.
- See `data/final-classification-review.json` for the remaining entries and `COVERAGE.md` for the empty slots.

## Next verification required

Manually check each unresolved chant against the book's section heading and determine the hour/variant. For hymns already classified but without an hour, determine the correct hour from the rubric. Do not infer hours from page proximity alone. Rebuild with `npm run build` and refresh `npm run coverage` after editing headers.
