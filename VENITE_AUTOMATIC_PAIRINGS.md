# Automatic Venite Psalm 94 pairings

The website now automatically renders the notated Psalm 94 beneath invitatory antiphons for which an explicit Liber Hymnarius reference has been recorded. The pairing is never inferred from antiphon mode alone.

## Automatic pairs
- `hymns/christum-dominum-passum-user-supplied`: Tone IV*, printed p. 141; `gabc/common/ps--venite_exsultemus_94--4.gabc`.
- `hymns/cor-iesu-invitatory-user-supplied`: Tone IV*, printed p. 141; same existing source.

All other invitatories retain the complete text of Psalm 94 and manual notation selection. Their pairings are NOT marked verified. The project currently has complete local GABC settings only for tones IV*, V, and VI; additional Psalm 94 tones printed in the volume must be transcribed or sourced before every invitatory can be displayed automatically and correctly.

The controls allow users to override or hide notation. `npm test` passes structural checks; browser-level musicological verification of all antiphons is not complete.
