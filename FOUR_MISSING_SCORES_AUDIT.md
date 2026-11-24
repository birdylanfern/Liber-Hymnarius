# Four remaining source-confirmed score gaps

A fresh scan of 486 local GABC files found no independently established match for any of the four outstanding scores.

| Liturgical slot | Expected score | Printed page | Local result |
|---|---|---:|---|
| St Joseph, Invitatory | Laudemus Deum nostrum in solemnitate beati Ioseph | 357 | Only generic *Laudemus Deum nostrum* (`gb-10451.gabc`, printed p. 556); wrong source page, not assigned |
| St Joseph, Lauds | Caelitum Ioseph | 358 | No matching title |
| Pentecost, Lauds | Beata nobis gaudia | 99 | No matching title |
| Conversion of St Paul, Invitatory | Laudemus Deum nostrum in conversione Doctoris gentium | 342 | Only generic *Laudemus Deum nostrum* (`gb-10451.gabc`, printed p. 556); wrong source page, not assigned |

The audit does not imply these scores are absent from GregoBase, only that the local project does not have confirmed matching scores. The script `node tools/audit-four-missing-scores.js` generates `data/four-missing-scores-audit.json`. No unrelated chant was inserted. No slot-coverage increase is claimed.
