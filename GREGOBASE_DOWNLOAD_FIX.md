# GregoBase source download correction

The previous bulk importer used `download.php?format=gabc&id=...`, omitting the `elem=1` parameter used by GregoBase's actual GABC download links. This caused at least GregoBase ID 4241 to fail validation and remain absent.

The importer now requests `download.php?elem=1&format=gabc&id=...`.

Imported manually from the published GABC response for ID 4241:
- `gabc/hymns/gregobase-liber/gb-4241.gabc`
- *Veni Redemptor gentium*, Liber Hymnarius (1983), printed p. 11.
- Advent after December 16, Office of Readings.
- All seven stanzas and Amen are included in the GABC.

Rebuild outcome: 335 of 429 liturgical slots populated; 94 remain unfilled. No other scores were fetched or added during this correction. To retry source-list entries on an internet-connected machine, run `npm run sync:gregobase-liber` then `npm run build && npm run coverage`.

The GABC is sourced from GregoBase and has not been verified note-by-note against the printed scan. The original GregoBase provenance marker remains applicable.
