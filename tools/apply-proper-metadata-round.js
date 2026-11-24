#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const edits=[
 {id:15663,hour:'Laudes',basis:'Embedded GABC header explicitly states office-part: Ad Laudes H for the Nativity of St John the Baptist.'},
 {id:15774,hour:'Invitatorium',basis:'Antiphon text Venite adoremus Regem identifies the invitatory for the Assumption; printed rubric still requires independent checking.'},
 {id:16691,hour:'Invitatorium',basis:'Antiphon text Christum natum, qui Innocentes ... venite adoremus identifies the invitatory for the Holy Innocents.'}
];
for(const e of edits){const p=path.join(root,'gabc/hymns/gregobase-liber',`gb-${e.id}.gabc`);let s=fs.readFileSync(p,'utf8');if(!/^hour:/m.test(s))s=`hour: ${e.hour};\nclassification-status: unchecked;\n`+s;fs.writeFileSync(p,s)}
fs.writeFileSync(path.join(root,'data','proper-metadata-round.json'),JSON.stringify({method:'Metadata and incipit-based classification, NOT PDF-verified',edits},null,2)+'\n');
console.log('Applied',edits.length,'source-based provisional assignments');
