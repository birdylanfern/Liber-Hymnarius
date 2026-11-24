# GregoBase import health reconciliation

The previous import log still marked GregoBase ID 4241 (*Veni Redemptor gentium*) as failed even after its GABC file was added in a later update. The new audit reconciles that historical log against the files on disk without deleting or overwriting any score.

Run `npm run audit:gregobase-import` to refresh `data/gregobase-import-health.json`.

The local audit cannot fetch missing scores because the working environment could not resolve `gregobase.selapa.net`. It also does not verify melodies against the 1983 printed edition.

**Populated liturgical slots remain 335/429** (94 unfilled); no additional musical score has been sourced in this update.
