# PDF review round 6 — missing liturgical slots

Compared the scanned 1983 Liber Hymnarius headings with the website taxonomy, then corrected structural omissions (not musical notes).

- **Baptism of the Lord, printed pp. 43–46:** added *Ad Invitatorium* (printed p. 44). The existing `Christum Filium dilectum` score now occupies its defined slot. The existing shared Office of Readings / II Vespers slot was retained because the book refers back to the same hymn for II Vespers.
- **After the Ascension, printed pp. 90–92:** added the invitatory slot. The existing Ascension invitatory is now displayed in its liturgical position.
- **Trinity Sunday, printed p. 106:** added the invitatory slot for `Deum verum`.
- **Ordinary Time, printed pp. 179–180:** added Sunday invitatory slots in the two alternating weekday cycles. The book prints Sunday invitatory antiphons there.
- **Ordinary Time, printed pp. 192–194 and 219–222:** added Terce, Sext, and None slots to the weekday sections; the book specifies repetition of the midday hymns during the week. This corrects scores that had hours but no corresponding slots.

These changes increase the number of defined slots; an increase in unfilled slots does not indicate that existing GABC files were deleted. The index still contains 451 hymns. No GABC melodies were edited. No speculative substitutions were added.

A new `npm run audit:slots` command writes `data/slot-consistency-audit.json` with missing hours, missing categories, undefined hour slots, and unresolved variant matches. The remaining records require individual review; the automated report is not proof that any individual melody is incorrect.
