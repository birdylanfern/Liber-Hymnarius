# Conversion of St Paul: source correction

Printed *Liber Hymnarius* p. 342 (PDF scan p. 178) identifies the invitatory as **Laudemus Deum nostrum in conversione Doctoris gentium**. The previously suggested unassigned score `gb-17971.gabc` is **Excelsam Pauli**, printed under **Ad Vesperas** on p. 343, not an invitatory.

- Set `gb-17971.gabc` to Vespers, retaining an UNCHECKED note because the alternate `gb-4273.gabc` is already indexed there.
- Added the actual missing invitatory to `data/source-confirmed-gaps.json`.
- Did not reuse `gb-10451.gabc`: its text honors St Benedict, not St Paul.
- The populated-slot count correctly remains unchanged.

The local source is still missing a verified GABC for this invitatory.
