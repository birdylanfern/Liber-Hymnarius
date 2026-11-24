#!/usr/bin/env node
// Source-backed gaps from the printed 1983 Liber Hymnarius; these are not GABC substitutions.
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const rubrics=[
 {category:'adventus-post16',slot:'ol',expected:'Veni, redemptor gentium',printedPage:11,pdfPage:12,note:'Ad Officium Lectionis. The imported catalogue has no matching GABC.'},
 {category:'quadragesima-hebd1-5',slot:'v|in officio dominicali',expected:'Audi, benigne Conditor',printedPage:48,pdfPage:32,note:'Ad Vesperas, in Officio dominicali. Do not substitute Vexilla regis.'}
];
const d=JSON.parse(fs.readFileSync(path.join(root,'data/complete-reconciliation.json')));
const gaps=rubrics.map(r=>({...r,status:d.slots.find(s=>s.category===r.category&&s.key===r.slot)?.status||'slot-not-found'}));
fs.writeFileSync(path.join(root,'data/source-confirmed-gaps.json'),JSON.stringify(gaps,null,2)+'\n');
console.log(gaps.map(x=>`${x.expected}: ${x.status}`).join('\n'));
