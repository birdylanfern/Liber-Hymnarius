# Feast-specific GABC import safeguard

The four-score importer previously accepted a generic *Laudemus Deum nostrum* when a metadata/comment line merely mentioned Joseph or Paul. It now checks the sung GABC body (after `%%`) rather than headers or commentary for the feast-specific text.

Tested with a deliberately misleading GABC fixture containing 'Joseph' only in commentary; it was rejected. This is a conservative screening check, not full liturgical or musical verification. Missing source scores remain missing, and existing imported GABCs were not modified.

Run: `npm run import:four-candidates -- /path/to/gabc-folder`.
