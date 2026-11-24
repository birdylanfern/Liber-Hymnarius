# Automatic verse completion

Run `npm run complete:verses` to re-evaluate short hymn scores against longer locally available GABC transcriptions sharing the same title, printed page, and opening text.

The website now displays the source-backed **complete Latin text** by default when a match exists, rather than hiding it in a collapsed comparison. These are **not** newly scored GABC verses: melody and syllable alignment must be verified before adding neumes. The original GABC is preserved.

The report `data/automatic-verse-completion-report.json` lists all eligible comparisons. Scores with no matching complete text remain incomplete; this automation does not invent missing stanzas. Previously supplied complete GABCs remain in place.
