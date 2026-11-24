# Full hymn text and invitatory psalm status

The imported GABC scores are preserved. **Full verses have not been added to all hymns**: the supplied scan and GABC files cannot justify fabricating missing Latin stanzas or their neume alignment. `data/full-verse-followup.json` lists short source files for manual review. The heuristic can include false positives and miss longer incomplete files.

Invitatories without a linked scored psalm now display a **text-only traditional Latin Psalm 94 (95)** beneath the antiphon, with a prominent warning. This does **not** supply a corresponding Gregorian psalm tone or a verified 1983 Liber Hymnarius edition. The text is stored in `data/psalm94-invitatory.json` and can be revised after comparison with the printed source. Existing explicitly linked scored psalms continue to render normally.

For a fully scored edition, obtain and verify the missing hymn verses and correct invitatory psalm tones from licensed/authorized source material, then encode them in GABC. Do not label the current text-only psalm as fully scored.
