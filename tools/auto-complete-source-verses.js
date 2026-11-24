#!/usr/bin/env node
// Safe automatic completion: text only, using existing source-backed transcriptions.
// Does not fabricate neume-to-syllable alignment or modify original GABC.
require('./build-verse-supplements.js');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/verse-supplements.json'),'utf8'));
const out=Object.entries(data).map(([id,x])=>({id,sourceId:x.sourceId,stanzas:x.stanzas,status:'additional text available; musical setting unverified'}));
fs.writeFileSync(path.join(root,'data/automatic-verse-completion-report.json'),JSON.stringify(out,null,2)+'\n');
console.log(`Prepared ${out.length} source-backed full-text comparisons; original GABC notation unchanged.`);
