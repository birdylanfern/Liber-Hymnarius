# PDF verification: Common of One Martyr, Virgin Martyr

The 1983 *Liber Hymnarius* distinguishes general hymns for one martyr from hymns specifically **Pro martyre virgine**. Three existing GABC files were correctly identified using the printed headings:

| Printed page | Hymn | Hour | Slot |
|---|---|---|---|
| 282 | Christe flos convallium | Office of Readings | `ol|pro martyre virgine` |
| 284 | O castitatis signifer | Lauds | `l|pro martyre virgine` |
| 288 | Virginis proles | Vespers | `v|pro martyre virgine` |

The PDF scan pages are 148, 149, and 151, respectively. The original GABC melodies are unchanged. The assignments were verified against printed rubrics, not note by note.

## Coverage impact

Previous: 312/424. Current: **313/424**. This is a net gain of one because the two hymns previously displayed under generic Lauds and Vespers were reassigned to the more specific virgin-martyr variants. Those generic slots are now empty pending verification of their correct hymns. No artificial substitutes were inserted.

Regenerate with `node tools/verify-virgin-martyr-from-pdf.js && npm run build && npm run reconcile:all`.
