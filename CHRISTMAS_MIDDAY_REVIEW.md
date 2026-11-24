# Christmas after Epiphany: midday hymn references

Checked against the 1983 *Liber Hymnarius* scan, printed pp. 41-42 (PDF scan page 28-29 in the supplied scan's spread numbering).

- Terce: **Certum tenentes ordinem**, printed p. 41.
- Sext: **Dicamus laudes Domino**, printed p. 42.
- None: **Ternis horarum terminis**, printed p. 42.

The imported project had no GABC scores explicitly attributed to these printed Christmas pages. The three slots now display existing same-title transcriptions from Advent after 16 December (`gb-4238`, `gb-4239`, `gb-4240`). Each is **UNCHECKED**: the printed hymn identity and liturgical hour were checked, but equivalence of the GABC melody to the Christmas notation has not been established note by note. The original Advent entries and files are unchanged.

Run `node tools/reconcile-christmas-midday.js && npm run build && npm run reconcile:all` to reproduce the three provisional aliases. This script is idempotent.

After rebuilding: 325/429 populated slots; 104 remain empty. This is a catalogue population count, not a verified score count.
