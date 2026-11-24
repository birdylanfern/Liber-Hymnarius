# Proper of Saints: metadata reconciliation

Three additional chant files have been classified by their **embedded GABC metadata or incipits**, not by an independent reading of the printed PDF. All three carry `classification-status: unchecked` in the site.

- `gb-15663.gabc` — **O nimis felix**; Nativity of St John the Baptist, **Lauds**. The embedded header explicitly says `office-part: Ad Laudes H`.
- `gb-15774.gabc` — **Venite adoremus Regem**; Assumption, **Invitatory**. This is an inference from its antiphon text and category.
- `gb-16691.gabc` — **Christum natum, qui Innocentes**; Holy Innocents, **Invitatory**. This is an inference from its antiphon text and category.

The site now populates **308 of 424 defined slots** (72.6%). This is *catalogue coverage*, not musical verification. The other **116** slots remain unfilled. All original GABC melodies were preserved.

The changes can be reproduced with `node tools/apply-proper-metadata-round.js`, followed by `npm run build` and `npm run reconcile:all`.
