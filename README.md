# Cantus — Graduale Simplex & Hymni Liturgiae Horarum

A small static site for browsing, searching, printing and exporting two collections of Latin chant (Novus Ordo):

* **Graduale Simplex**
* **Hymns of the Liturgy of the Hours**

It is a pared-down descendant of [jgabc](https://github.com/bbloomf/jgabc) (public domain): the same
exsurge engine renders the gabc in the browser, with the same fonts, dark mode and
in-browser PDF export. The Mass-propers calendar machinery, psalm-tone tools, readings, and the 1961 Graduale data
have all been removed.

## How the hymns are organised

The hymns follow the contents of the Liber Hymnarius (liberhymnarius.org), as a tree defined in
[`tools/taxonomy.js`](tools/taxonomy.js):

* **Proprium de Tempore**: Advent, Christmas, Lent, the Triduum, Eastertide, and the Sollemnities after Pentecost
* **Proprium de Sanctis**: the saints' feasts, month by month
* **Communia Sanctorum**: Dedication, Our Lady, Apostles, Martyrs, Pastors, Doctors, Virgins, …
* **Tempus per Annum**: the four-week psalter, Sunday to Saturday
* **Alia**: Te Deum

Each place in the tree lists the hours where the Liber Hymnarius has a hymn (Invitatorium, Officium lectionis, Laudes,
Tertia … Vesperae, Completorium). The site shows the whole tree, with empty places dimmed, so you can see at a glance
what is still to be added; "Hide empty" shows only what has hymns. The chips above the list filter by hour.
A hymn without a (valid) category is listed under "Nondum ordinati".

To file a hymn, give it a `category:` and an `hour:` in its gabc header:

```
name: Conditor alme siderum;
category: adventus-ante16;
hour: Vesperae;
%%
```

`node tools/list-categories.js` prints every category id (add a word to search, e.g. `node tools/list-categories.js
pastorum`). Where a place has several hymns for one hour (e.g. *Officium lectionis*, noctu / diurno) add a `variant:`
(e.g. `variant: noctu;`). Instead of `category:` you can put the file in a folder named after the id
(`gabc/hymns/adventus-ante16/…`), or use the liberhymnarius.org style note and link before the header
(`Usque ad diem 16 Decembris` / `* [Ad Vesperas](https://…)`), which is matched to the category when the note is exactly
a category's label. `node tools/build-index.js` prints a warning for any category, hour or variant it cannot place.
To add or rename categories edit `tools/taxonomy.js`.

Keyboard: `/` search · `←` `→` previous / next hymn · `Esc` clears the search.

## Adding chants

1. Put one `.gabc` file per chant in `gabc/simplex/` or `gabc/hymns/` (subfolders are fine).
2. Run `node tools/build-index.js` (Node 14+, no dependencies). This writes `data/index.json`.
3. Serve the folder over HTTP and open `index.html`:

   ```
   npm run serve        # or: python3 -m http.server
   ```

The GitHub Pages workflow in `.github/workflows/static.yml` runs the index build on every push, so you only need to
commit the `.gabc` files.

## Header fields

The standard gabc header is used. Everything is optional except the music after `%%`; the site's filters and
ordering adapt to whichever fields are present.

| Field | Used for |
|---|---|
| `name:` | Title (falls back to the file name) |
| `category:` | Hymns: id of the category in `tools/taxonomy.js` (see above) |
| `hour:` | Hymns: Invitatorium, Vigiliae, Officium lectionis, Laudes, Hora media, Tertia, Sexta, Nona, Vesperae, I / II Vesperae, Completorium (Latin or English names, with or without "Ad"); also "Laudes et Vesperae" and the like |
| `variant:` | Hymns: which hymn of an hour, e.g. `noctu`, `in officio feriali`, `pro uno pastore` |
| `office-part:` | Simplex: Introitus, Graduale, Alleluia, Tractus, Offertorium, Communio, Responsorium, Antiphona… → "Pars" filter and the drop-cap annotation (e.g. *Intr. IV*) |
| `mode:` | Roman numeral in the annotation and the subtitle |
| `season:` | Graduale Simplex: "Tempus" filter and grouping (Adventus, Nativitas, Quadragesima, Tempus paschale, Per annum, Communia…) |
| `occasion:` | Subtitle and search (e.g. `Dominica I Adventus`) |
| `number:` | Order within a group (e.g. `GS 23`); natural sort |
| `meter:` | Hymns, shown in the subtitle |
| `commentary:` | Scripture reference shown above the score and in the PDF |
| `book:` | Source, stored in the index |
| `annotation:` | Up to two lines above the drop cap, used as written (e.g. `annotation: Hymn` then `annotation: 4`). Without them, the part and mode are used |
| `note:` | Short note under the title (e.g. `Usque ad diem 16 Decembris`) |
| `source:` | A link, shown as "Fons" |
| `initial-style: 0` | Turn the drop cap off |

Text placed *before* the header, in the liberhymnarius.org style, is understood too:

```
Usque ad diem 16 Decembris             → note
* [Ad Vesperas](https://…)             → hour (Vesperae) + source link
annotation: Hymn
annotation: 4
%%
```

Without a `name:`, the title is the first phrase of the text (e.g. "Conditor alme síderum"). A season can't be
guessed from a note like "Usque ad diem 16 Decembris", so add `season: Adventus` if you want the Tempus filter.

Graduale Simplex season/part values are sorted liturgically by keyword (Latin or English), otherwise alphabetically.

Example header (the music line is only a placeholder):

```
name: Christe, lux mundi;
office-part: Hymnus;
mode: 8;
category: pa-13-dom;
hour: Laudes;
meter: 8888;
%%
(c4) Text(f)  here(g) ...
```

## GABC conventions

Files from GregoBase work as they are. The renderer converts the Gregorio-style markup they use
(`<sp>V/</sp>`, `<i>…</i>`, `*`/`†` and stanza numbers in rubric red, etc.). Stanzas can follow each other in one file
(`2. Text(…)`), as in the original site.

## Layout

```
index.html  app.js  app.css  fonts.css  theme.css   the app
exsurge.min.js  jquery.min.js  js/                   rendering, dark mode, PDF export
gabc/simplex/  gabc/hymns/                           your chants
data/index.json                                      generated
tools/build-index.js                                 the indexer
```

## License

Public domain (Unlicense), as the original. Check the licence of any chant sources you add.

## 1983 Liber Hymnarius reference and coverage

The supplied 150-page scan is bundled in `reference/Liber_Hymnarius_1983.pdf`.
When a GABC header contains `book: Liber Hymnarius, 1983, p. 43;`, the
chant page links directly to the corresponding scan spread. This is a
**reference**, not evidence that the local melody has been verified.

Run `npm run build && npm run coverage` to regenerate the catalogue and
`COVERAGE.md`. The coverage report lists unfilled taxonomy slots; it is
not a comprehensive inventory of every item in the full printed book.

**Remaining work:** source and check missing GABC transcriptions against
the printed notation. GregoBase transcriptions must be checked for the
correct edition, text and melody before being added. The provided PDF
scan ends at printed page approximately 285, so the full book cannot be
verified using this excerpt alone.


External source candidates for four unresolved scores: see `FOUR_SCORE_EXTERNAL_CANDIDATES.md`.
