#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const data=require('../data/index.json');
const slots=[];function walk(nodes,trail=[]){for(const n of nodes){const t=[...trail,n.label];for(const s of n.slots||[])slots.push({category:n.id,path:t.join(' / '),key:s.key,hour:s.hour,variant:s.variant||''});walk(n.kids||[],t)}}walk(data.tree);
const hymns=data.hymns;const byCat=new Map();for(const h of hymns){if(!byCat.has(h.cat))byCat.set(h.cat,[]);byCat.get(h.cat).push(h)}
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const report=slots.map(s=>{const all=byCat.get(s.category)||[];const exact=all.filter(h=>h.slot===s.key);const hourCandidates=all.filter(h=>h.hour===s.hour&&h.slot!==s.key);const withoutHour=all.filter(h=>!h.hour);const sameNameCandidates=hourCandidates.filter(h=>exact.some(e=>norm(e.name)===norm(h.name)));
let status=exact.length?'populated':hourCandidates.length?'needs-variant-or-rubric':withoutHour.length?'needs-hour-identification':'no-local-candidate';
return {...s,status,assigned:exact.map(h=>({file:h.file,name:h.name,unchecked:!!h.unchecked})),sameHourCandidates:hourCandidates.map(h=>({file:h.file,name:h.name,variant:h.variant,slot:h.slot,unchecked:!!h.unchecked})),uncategorizedHourCandidates:withoutHour.map(h=>({file:h.file,name:h.name})),sameNameCandidates:sameNameCandidates.length};});
const count=k=>report.filter(s=>s.status===k).length;const assigned=new Set(report.flatMap(s=>s.assigned.map(h=>h.file)));
const summary={sourceFiles:hymns.length,definedSlots:slots.length,populated:count('populated'),unfilled:slots.length-count('populated'),needsVariantOrRubric:count('needs-variant-or-rubric'),needsHourIdentification:count('needs-hour-identification'),noLocalCandidate:count('no-local-candidate'),assignedFiles:assigned.size,unassignedFiles:hymns.filter(h=>!assigned.has(h.file)).length,uncheckedAssignedSlots:report.filter(s=>s.assigned.some(h=>h.unchecked)).length};
const output={summary,method:'A populated slot means a matching catalogue slot key; not proof of PDF verification. Candidate lists are diagnostic, not approved placements.',slots:report,unassigned:hymns.filter(h=>!assigned.has(h.file)).map(h=>({name:h.name,file:h.file,category:h.cat,hour:h.hour,variant:h.variant,page:h.liberPage}))};
fs.writeFileSync(path.join(root,'data','complete-reconciliation.json'),JSON.stringify(output,null,2)+'\n');
const md=['# Full catalogue reconciliation','',`This is an inventory, not a claim of source verification.`, '',...Object.entries(summary).map(([k,v])=>`- ${k}: **${v}**`),'','## Remaining slots by category','','| Category | Unfilled | With same-hour candidates |','|---|---:|---:|'];
const groups=new Map();for(const s of report.filter(x=>x.status!=='populated')){const key=s.path;const g=groups.get(key)||{n:0,c:0};g.n++;if(s.sameHourCandidates.length)g.c++;groups.set(key,g)}for(const [k,g] of [...groups].sort((a,b)=>b[1].n-a[1].n))md.push(`| ${k.replace(/\|/g,'/')} | ${g.n} | ${g.c} |`);
md.push('','## Important','', 'Do not fill a slot using another hymn merely because it shares the same liturgical hour. The printed rubric must establish the correct text and variant.','');fs.writeFileSync(path.join(root,'COMPLETE_RECONCILIATION.md'),md.join('\n'));
console.log(JSON.stringify(summary,null,2));
