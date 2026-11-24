# Four source candidates — verification update

Two specific GregoBase score pages have been confirmed: [Caelitum Ioseph (17643)](https://gregobase.selapa.net/chant.php?id=17643), which identifies the **2019** Liber Hymnarius, and [Beata nobis gaudia (11858)](https://gregobase.selapa.net/chant.php?id=11858), sourced from the **1961** Liber Usualis / **1960** Liber antiphonarius. An alternate [1934 version (9146)](https://gregobase.selapa.net/chant.php?id=9146) is also available.

These are **external source candidates**, not verified 1983 scores. The feast-specific St Joseph and St Paul invitatory GABC source IDs remain unconfirmed. Do not substitute generic Laudemus Deum nostrum scores.

Direct GABC retrieval failed in this environment (DNS resolution). No new scores were imported. The last confirmed catalogue baseline is **338/429**, with **91** empty slots. To inspect candidate status run `node tools/audit-four-candidate-sources.js`; to import locally obtained files run `npm run import:four-candidates -- /path/to/gabc-folder`, then `npm run build && npm run reconcile:all`.
