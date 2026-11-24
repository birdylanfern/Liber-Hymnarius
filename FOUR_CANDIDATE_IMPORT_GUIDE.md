# Four missing feast-specific scores: import-ready workflow

The four source-confirmed gaps are St Joseph Invitatory (printed p. 357), St Joseph Lauds (p. 358), Pentecost Lauds (p. 99), and Conversion of St Paul Invitatory (p. 342).

Remote retrieval was attempted on 23 November 2026 but DNS lookup for gregobase.selapa.net failed in this environment. **No new musical files have been downloaded or assigned.** The latest confirmed baseline is 338/429 populated slots.

Download the matching GABC scores into one folder and rename them `joseph-invitatory.gabc`, `joseph-lauds.gabc`, `pentecost-lauds.gabc`, `paul-invitatory.gabc`. Sources identified in the prior review include GregoBase 17643 (Caelitum Ioseph), 11858 or 9146 (Beata nobis gaudia). The two invitatories must be feast-specific, not the similarly titled St Benedict chant.

Run `node tools/import-four-source-candidates.js /path/to/folder`, then `npm run build && npm run reconcile:all`. The importer rejects malformed GABC and generic invitatories without feast-specific text, does not overwrite files, and marks every imported score **EXTERNAL SOURCE — UNCHECKED**. A successful import is not musical verification against the 1983 edition.
