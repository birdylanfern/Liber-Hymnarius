# Ordinary Time weekday midday hymn cross-references

The printed *Liber Hymnarius* (1983) uses Monday's hymns for the midday hours of the other weekdays in each two-week cycle.

- **Weeks I and III:** printed p. 197 (PDF spread containing pp. 196–197) directs the reader to the Monday hymns on p. 192.
- **Weeks II and IV:** printed p. 227 (PDF spread containing pp. 226–227) directs the reader to the Monday hymns on p. 219.

The project now includes 24 derived, explicitly cross-referenced GABC entries: Tuesday through Friday × Terce, Sext, None × two cycles. Each is copied verbatim from its Monday score, with a `crossref-original` field and a `liber-hymnarius-cross-reference` provenance value. The existing Monday files are unchanged.

The change raises populated-slot coverage from 280/424 to 304/424. This is verified liturgical reuse, **not** a claim of independent note-by-note verification of the underlying GregoBase GABC. A script (`node tools/apply-ordinary-midday-crossrefs.js`) can regenerate the references; `data/ordinary-midday-crossrefs.json` lists all 24.

Other unfilled slots have not been assigned speculatively.
