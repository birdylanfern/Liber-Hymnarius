# Early Advent classification correction

Nine existing GregoBase GABC files have been assigned to `adventus-ante16`, with hours Vespers, Compline, Invitatory (Sunday and weekday variants), Office of Readings, Lauds, Terce, Sext and None.

These are catalogue metadata assignments based on the source page sequence and hymn usage, not an independent note-for-note verification against the scanned 1983 Liber Hymnarius. The existing GABC melodies and provenance markers are unchanged.

Run `npm run build` after any future changes to GABC headers. Re-run `node tools/fix-early-advent.js` if a subsequent GregoBase sync overwrites these metadata fields. The script is idempotent.

Other sections still have unfilled slots and need separate review.
