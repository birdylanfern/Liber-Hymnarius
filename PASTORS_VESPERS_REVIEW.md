# Common of Pastors: Vespers review

Two existing GABC files have been assigned to previously empty Vespers variants:

- `gb-17946.gabc` — *Vir celse forma fulgida*, GregoBase Liber Hymnarius p. 297, `pro uno pastore`.
- `gb-17949.gabc` — *Sacrata nobis gaudia*, GregoBase Liber Hymnarius p. 299, `pro pluribus pastoribus`.

Both assignments are **UNCHECKED**. The textual number and page metadata support the proposed distinctions, but the exact printed rubrics and musical notes have not been independently verified. Existing alternative transcriptions `gb-17944.gabc` and `gb-17945.gabc` remain unassigned rather than silently removed or grouped.

Coverage: 332/429; 97 unfilled. The denominator includes taxonomy slots and coverage does not measure note-by-note verification.

Reapply with `node tools/reconcile-pastors-vespers.js`, then `npm run build && npm run coverage && npm run reconcile:all`.
