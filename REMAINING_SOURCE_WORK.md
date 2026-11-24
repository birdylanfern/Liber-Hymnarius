# Full verses and invitatory psalms: source verification status

This project is **not yet a complete musical edition**. The supplied 150-page PDF is a partial scanned reference and the environment cannot retrieve further GregoBase files. Do not interpret the 388/388 liturgical-slot count as verified source completeness: 201 slots were provisionally filled.

## Implemented in this revision

- `data/verse-supplements.json` contains eight source-backed comparisons for short *hymn* GABC files. Candidates require the same normalized title, same printed book page, same opening stanza, and a longer locally available transcription.
- On those short hymn pages, a collapsible panel displays additional Latin verses **as comparison text only**, with a link to the other GregoBase transcription. The original score and melody are untouched.
- `node tools/build-verse-supplements.js` regenerates the comparison dataset from the existing indexed GABC files.

## Still requires source work

- Check all potentially incomplete *hymns* against complete printed or authorized digital editions. The earlier `data/full-verse-followup.json` is only a length-based heuristic and includes invitatory antiphons, which are not multi-stanza hymns.
- Transcribe and verify the correct notes and Latin syllable alignment for each missing stanza and for each separate melody variant. Never use a different melody merely because the hymn text matches.
- Verify the invitatory antiphon with the correct psalm and tone for its occasion. `data/psalm94-invitatory.json` is a **text-only fallback**, not a scored, source-verified pairing.
- Recheck provisional category and hour assignments, including the 201 UNCHECKED placements.

Do not remove UNCHECKED or source warnings until each item is independently checked.
