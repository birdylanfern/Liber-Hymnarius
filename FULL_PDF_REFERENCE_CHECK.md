# PDF reference verification

The newly supplied 320-page PDF and the existing `reference/Liber_Hymnarius_1983.pdf` have identical SHA-256 hashes. The project already held the full scan, but `app.js` incorrectly restricted printed-page links to PDF pages 1–150. That limit is now 320.

The full PDF contains two printed pages per scan. This correction restores direct reference links to later printed sections, including Proper of Saints and Commons. It does not change GABC classifications, claim new verified placements, or alter the current 253/424 populated-slot baseline.

Further classification must be based on rubric-by-rubric comparison, not a claim that a new PDF has unlocked missing content.
