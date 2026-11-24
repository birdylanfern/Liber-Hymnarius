# Eastertide Invitatories — printed-source verification

The 1983 *Liber Hymnarius* confirms that the Eastertide Invitatories for the Common of Doctors and Common of Holy Men have **distinct musical settings**. This is stronger evidence than the earlier metadata-only review.

| Section | Ordinary setting locally | Eastertide printed setting | Printed source | Invitatory psalm |
|---|---|---|---|---|
| Common of Doctors: *Fontem sapientiae* | `gb-20870.gabc`, mode IV | **mode VI***, with *alleluia* | p. 301, PDF scan 157 | *Venite*, p. 154 |
| Common of Holy Men: *Mirabilem in sanctis* | `gb-20882.gabc`, mode IV | **mode VI***, with *alleluia* | pp. 311–312, PDF scans 162–163 | *Venite*, p. 154 |

**Decision:** Keep both Eastertide slots unpopulated until their own GABC transcriptions are obtained. The ordinary mode IV scores must not be substituted. The website now displays these precise source requirements inside the empty liturgical slots. No notes were invented or modified.

Run `npm run audit:eastertide-invitatories` to regenerate the evidence JSON and verify that the ordinary source files remain mode IV.
