#!/usr/bin/env node
// Auditable, conservative pass over imported GregoBase transcriptions.
// Never assign an hour from page proximity; never overwrite a category.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const index=JSON.parse(fs.readFileSync(path.join(root,'data/index.json'),'utf8'));
const entries=index.hymns, byPage=new Map();
for(const e of entries){if(!e.cat||!Number.isFinite(e.liberPage))continue;const a=byPage.get(e.liberPage)||[];a.push(e);byPage.set(e.liberPage,a);}
const changes=[],pending=[];
for(const e of entries.filter(e=>!e.cat&&e.provenance==='gregobase-liber')){
 const peers=byPage.get(e.liberPage)||[];
 const cats=[...new Set(peers.map(x=>x.cat))];
 // Exact page and only one category; no neighboring-page guessing.
 if(cats.length!==1){pending.push({name:e.name,page:e.liberPage,file:e.file,reason:cats.length?'conflicting categories on page':'no classified entry on exact page'});continue;}
 const file=path.join(root,e.file);let gabc=fs.readFileSync(file,'utf8');
 if(/^category\s*:/mi.test(gabc))continue;
 gabc=`category: ${cats[0]};\nclassification-method: exact-page-provisional;\n`+gabc;
 fs.writeFileSync(file,gabc);
 changes.push({name:e.name,page:e.liberPage,file:e.file,category:cats[0],matched:peers.map(x=>x.name),confidence:'provisional; exact printed-page agreement; hour not inferred'});
}
fs.writeFileSync(path.join(root,'data/final-classification-review.json'),JSON.stringify({newAssignments:changes.length,stillUnclassified:pending.length,changes,pending},null,2)+'\n');
console.log(`Exact-page assignments: ${changes.length}; unresolved: ${pending.length}. No hours inferred.`);
