# PDF review round 7: variant audit correction

This round corrects the **audit**, not the musical scores. Earlier reporting described 77 records as generic variant-to-slot mismatches. The taxonomy inspection establishes that all 77 have *multiple* candidate slots for their liturgical hour, so they require an explicit rubric/variant choice. Assigning one automatically would repeat the earlier erroneous slot-filling behavior.

The enhanced `npm run audit:slots` report lists `allowedVariants` for every ambiguous entry, making manual comparison with the 1983 Liber Hymnarius easier. It separately reports 55 missing-hour entries, 46 unclassified entries, and 2 hour/taxonomy disagreements. These categories are mutually exclusive under the audit's precedence rules.

The two hour/taxonomy disagreements are `Praeclara custos virginum` (gb-16123, page 475, Vespers) and `Te dicimus praeconio mater` (gb-8243, page 476, Office of Readings), both in `s-12-08`. The supplied PDF scan does not reach those printed pages, so neither assignment has been changed without an adequate source.

**No GABC files or classifications were modified.** All 451 scores are retained. Coverage remains 223 of 425 slots. The previous 77 count was not 77 verified mistakes; it was 77 unresolved variant decisions.
