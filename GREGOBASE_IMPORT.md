# Supplementary GregoBase transcriptions

The app displays a visible **GregoBase · Not verified against Liber Hymnarius** notice for files with `provenance: gregobase;` in their GABC header. The browse list shows `GB · unverified`. The notice includes the original GregoBase link if the `source:` header is present.

## Import a score

1. Locate the missing hymn in the PDF and identify its liturgical category, hour, and incipit. A missing slot is **not** necessarily a missing hymn: some hours reuse the same hymn or refer to another page.
2. Search https://gregobase.selapa.net/ for the incipit and compare candidate versions. Confirm that the candidate is a hymn, not an antiphon or other chant. Note its numeric GregoBase ID.
3. Download the GABC file from the specific GregoBase chant page. Do not replace a pre-existing Liber Hymnarius transcription.
4. Import, for example:

   `node tools/import-gregobase.js ~/Downloads/chant.gabc adventus-ante16 Vesperae 12345`

   Replace the category, hour, and ID with those of the actual score. Optional fifth argument: variant.
5. Run `npm run build` and `npm run coverage` to update the catalogue and coverage report. Preview the chant and check notation compatibility.

The import script intentionally requires a real downloaded GABC file and an explicit source ID; it does not invent missing melodies or silently assume a GregoBase version matches the 1983 book. Importing a GABC transcription does not automatically supply omitted hymn verses.

## Status

No new GregoBase GABC scores have been imported in this revision: network access to the GregoBase download host was unavailable. Existing scores were preserved. The provenance display and local import workflow are implemented and syntax-checked.

## Bulk import of the actual 1983 Liber Hymnarius source list

Run `npm run sync:gregobase-liber` on a computer with Internet access. This command reads GregoBase's [1983 Liber Hymnarius source listing](https://gregobase.selapa.net/source.php?id=15), downloads each linked score from the corresponding `download.php?format=gabc&id=...` endpoint, stores the files under `gabc/hymns/gregobase-liber/`, and rebuilds the site index. It does not overwrite existing scores. A machine-readable report is written to `data/gregobase-liber-sync.json` with successful, skipped, and failed downloads.

These scores are labelled **GB · LH source** in the application: GregoBase explicitly attributes them to Liber Hymnarius, but they have not been independently compared with the scanned book. Other supplementary GregoBase scores retain **GB · unverified**. Automatic placement into liturgical categories is conservative: only an unambiguous match to an existing title is assigned. Scores without a clear match remain searchable in the catalogue, and their categories should be reviewed manually. The source list includes invitatory chants and other material, not only hymns.

**Offline preparation status:** This archive includes the bulk importer, but the remote downloads were not executed because the build environment could not resolve the GregoBase host. No new GABC scores are claimed as imported.
