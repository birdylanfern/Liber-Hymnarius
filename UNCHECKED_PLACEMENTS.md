# Provisional UNCHECKED placements

The site now shows a candidate GABC score for every previously empty taxonomy slot. **These placements are NOT confirmed against the 1983 Liber Hymnarius.** A fallback may be from another season, feast, or liturgical hour and can be entirely inappropriate. Do not use these assignments as authoritative liturgical directions.

- 451 original GABC files are untouched.
- 201 additional *catalogue references* point to existing GABC files; they are not new transcriptions.
- Each additional reference has `unchecked: true`, an `originalId`, and an explanation shown on its chant page.
- Review all candidates in `data/unchecked-placements.json` (including their original category and hour).
- Rebuilding with `npm run build` regenerates these references. The original GABC metadata is never changed.
- Replace provisional placements by assigning the correct original GABC file to the slot, then rebuild. Once an original score fills the slot, its temporary candidate disappears.

**Coverage figures count provisional entries**; 388/388 is not 388 verified scores.
