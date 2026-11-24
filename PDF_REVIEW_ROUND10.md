# Round 10: systematic slot inventory

This pass examined the entire taxonomy rather than filling gaps with guessed chants.

- All 425 currently defined liturgical slots are enumerated in `data/full-slot-review.json`.
- Two entries explicitly designated for a single pastor were assigned to the `pro uno pastore` variant, resolving two previously ambiguous slots.
- 231 slots now have a catalogue entry, 194 remain unfilled.
- All 451 original GABC scores remain intact.
- The 1983 reference PDF is a partial scan (150 scanned spreads), and does not establish every later feast or common in the 425-slot taxonomy.
- No empty slot has been filled with an unrelated melody; no hymn is marked source-verified merely because a catalogue slot is populated.

Run `npm run review:slots` to regenerate the complete slot-by-slot inventory.

## Outstanding issues

See `data/slot-consistency-audit.json`: 75 ambiguous variants, 50 entries missing an hour, 33 unclassified entries, 12 invitatory psalm tone references, and 2 taxonomy disagreements. These categories are not all independent.
