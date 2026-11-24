#!/usr/bin/env node
const fs=require('fs'),path=require('path'),tax=require('./taxonomy');
const root=path.join(__dirname,'..'),data=require('../data/index.json');
const issues=[];
for(const e of data.hymns){
 const n=tax.byId[e.cat];
 if(!n){
  const psalmTone = /^Venite exsultemus/i.test(e.name||'') && Number(e.liberPage)>=133 && Number(e.liberPage)<=173;
  issues.push({file:e.file,name:e.name,kind:psalmTone?'reference-psalm-tone':'unclassified',category:e.cat||null,page:e.liberPage||null,note:psalmTone?'Invitatory Psalm 94 tone in the reference section; not a missing hymn-hour assignment.':undefined});
  continue;
 }
 if(!e.hour){issues.push({file:e.file,name:e.name,kind:'hour-missing',category:e.cat,page:e.liberPage||null});continue;}
 const choices=(n.slots||[]).filter(s=>s.hour===e.hour);
 if(!choices.length){issues.push({file:e.file,name:e.name,kind:'hour-not-in-taxonomy',category:e.cat,hour:e.hour,page:e.liberPage||null});continue;}
 if(!e.slot){issues.push({file:e.file,name:e.name,kind:choices.length>1?'ambiguous-variant':'variant-mismatch',category:e.cat,hour:e.hour,variant:e.variant||'',page:e.liberPage||null,allowedVariants:choices.map(s=>s.variant||'(unqualified)'),note:'No automatic assignment made; compare the printed rubric before selecting a variant.'});}
}
const summary=Object.fromEntries([...new Set(issues.map(x=>x.kind))].sort().map(k=>[k,issues.filter(x=>x.kind===k).length]));
fs.writeFileSync(path.join(root,'data','slot-consistency-audit.json'),JSON.stringify({summary,issues},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
