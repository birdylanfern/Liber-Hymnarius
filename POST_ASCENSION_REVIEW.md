# Post-Ascension Vespers review

Compared with the supplied 1983 Liber Hymnarius, printed pages 88-90 (PDF scan page 51-52).

- In sollemnitate: Iesu nostra redemptio (source gb-4515, printed p. 88).
- In officio dominicali: Veni Creator Spiritus (source gb-14258, printed p. 90).
- In officio feriali: Veni Creator Spiritus (source gb-14258, printed p. 90).

The two Veni Creator references deliberately share the same source score; they are liturgical uses, not new melodies. The three generated reference GABC files are in gabc/hymns/verified-rubric-references. The original source files are unchanged.

The displayed slot count increased from 250/424 to 253/424. This measures populated catalogue slots, not a note-by-note verification of the melodies or complete verification of the website. 171 slots remain unfilled.

To regenerate: `node tools/fix-post-ascension-vespers.js && npm run build && npm run reconcile:all && npm run coverage`.
