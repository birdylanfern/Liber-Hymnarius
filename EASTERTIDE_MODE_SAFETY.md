# Eastertide invitatory mode safety check

The 1983 Liber Hymnarius prints a distinct mode VI* Eastertide setting with Alleluia for Fontem sapientiae (p. 301) and Mirabilem in sanctis (pp. 311-312). The imported ordinary settings gb-20870.gabc and gb-20882.gabc are mode IV and must not be silently reused in these Eastertide slots.

Run `npm run audit:eastertide-modes` after rebuilding the index. It checks the two Eastertide catalogue slots, reads the GABC mode and detects Alleluia text when a score is assigned, and writes `data/eastertide-mode-safety-audit.json`. A missing score is reported as MISSING GABC, not a success. A wrongly assigned score causes the audit command to fail. Matching mode and Alleluia are necessary checks, not proof of musical identity.

Current result: both distinct Eastertide scores are still missing. No new scores were imported and populated-slot coverage remains 339/429 (last confirmed baseline).
