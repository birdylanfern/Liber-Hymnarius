# PDF review round 8: Common invitatories

Five existing GregoBase transcriptions have been assigned to the Invitatory hour and explicit variant slots. The Apostles entries are distinguished by mode III, mode IV and Eastertide. The Martyrs entries are assigned to feasts/solemnities and memorials; the feast assignment is provisional, based on the common's variant choices and the separate memoria score. This does not constitute a note-by-note comparison with the printed book.

- `gb-10398`: Regem Apostolorum, A.III, printed page 266.
- `gb-16675`: Regem Apostolorum, A.IV, printed page 266.
- `gb-20880`: Regem Apostolorum, in tempore paschali, printed page 266.
- `gb-10558`: Regem martyrum Dominum, in sollemnitatibus et festis, printed page 273 (provisional).
- `gb-20901`: Regem martyrum Dominum, in memoriis, printed page 273.

The five original GABC melodies are unchanged. The automated catalogue reports 228 of 425 populated slots and 451 GABC entries. Outstanding issues: 77 ambiguous variants, 50 missing hours, 46 unclassified entries, and 2 taxonomy disagreements. These counts are not necessarily 175 distinct hymns. The supplied scan only partially covers the original printed volume, so later pages require additional reference material.

Re-run with `node tools/fix-common-invitatories.js && npm run build && npm run audit:slots && npm run coverage`.
