#!/usr/bin/env node
/* Conservative reconciliation: only assign a category when all categorized
 * transcriptions on the identical printed page agree. Never infer an hour. */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const entries=JSON.parse(fs.readFileSync(path.join(root,'data/index.json'),'utf8')).hymns;
const pageCats=new Map();
for(const e of entries){if(!e.cat||!e.liberPage)continue;const s=pageCats.get(e.liberPage)||new Set();s.add(e.cat);pageCats.set(e.liberPage,s);}
let changed=0;const unresolved=[];
for(const e of entries){if(e.cat||e.provenance!=='gregobase-liber')continue;
 const cats=pageCats.get(e.liberPage);
 if(!cats||cats.size!==1){unresolved.push({name:e.name,page:e.liberPage,file:e.file,reason:cats?'ambiguous page':'no page match'});continue;}
 const file=path.join(root,e.file);let gabc=fs.readFileSync(file,'utf8');
 if(!/^category\s*:/mi.test(gabc)){
  gabc=`category: ${[...cats][0]};\n`+gabc;fs.writeFileSync(file,gabc);changed++;
 }
}
fs.mkdirSync(path.join(root,'data'),{recursive:true});
fs.writeFileSync(path.join(root,'data/classification-review.json'),JSON.stringify({assignedByExactPrintedPage:changed,remainingUnclassified:unresolved.length,unresolved},null,2)+'\n');
console.log(`Assigned ${changed} chants by exact printed-page agreement; ${unresolved.length} require review. No liturgical hours were guessed.`);
