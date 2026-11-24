# Automatic Venite display (no manual tone buttons)

Invitatory Psalm 94 notation is now loaded automatically only from the existing printed-reference map in `app.js`. All tone-choice and hide-notation buttons have been removed from the invitatory view. If a mapping or score is missing, the site displays a warning rather than substituting a mode-matched score.

Existing 49 documented mappings remain unchanged; provisional mappings remain provisional. The antiphon and psalm are displayed as separate scores, not interleaved at the rubrical repetition points. Browser visual testing remains outstanding.

Validation: `node --check app.js`, `npm run test:venite`, and `npm test` passed (0 structural errors; 12 existing warnings).
