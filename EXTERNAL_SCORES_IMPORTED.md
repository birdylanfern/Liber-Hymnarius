# Two external GABC scores imported — UNCHECKED

Two Gregorian scores were transcribed from the downloadable GregoBase GABC text and added to the existing catalogue. **These are NOT verified transcriptions of the 1983 Liber Hymnarius.** Their source editions are explicitly shown in their metadata and the website displays the UNCHECKED warning.

| Slot | Source | Score | Status |
|---|---|---|---|
| Lent, Sunday Vespers; LH p. 48 | GregoBase 17673, Antiphonale Monasticum Solesmense (1935), p. 337 | `gabc/hymns/gregobase-external/gb-17673.gabc` | EXTERNAL SOURCE — UNCHECKED |
| Common of Apostles, Eastertide II Vespers; LH p. 270 | GregoBase 11203, Antiphonale Monasticum (1934), p. 630 | `gabc/hymns/gregobase-external/gb-11203.gabc` | EXTERNAL SOURCE — UNCHECKED |

Source pages: https://gregobase.selapa.net/chant.php?id=17673 and https://gregobase.selapa.net/chant.php?id=11203

Both sources contain multiple stanzas and a concluding Amen. They must be compared with the printed 1983 melody, verses, and doxology before being designated Liber-verified. The original scores were not changed. The import script `tools/import-external-candidates.js` can import downloaded files `17673.gabc` and `11203.gabc` from a specified folder, validating the header and incipit and refusing to overwrite existing scores.

Populated-slot count after rebuild: **338 / 429**. Of these, two newly populated slots use external, unchecked editions. This is not a claim of musical equivalence to the 1983 Liber Hymnarius.
