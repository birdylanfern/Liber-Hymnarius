#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const d=JSON.parse(fs.readFileSync(path.join(root,'data/complete-reconciliation.json'),'utf8'));
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const entries=d.slots.filter(s=>s.status!=='populated').map(s=>{
 const candidates=[...s.sameHourCandidates.map(c=>({...c,kind:'same-hour'})),...s.uncategorizedHourCandidates.map(c=>({...c,kind:'missing-hour'}))];
 const variants=norm(s.variant);
 const checked=candidates.map(c=>{
  const title=norm(c.name),cv=norm(c.variant||'');
  const titleWords=title.split(' ').filter(w=>w.length>3);
  const variantWords=variants.split(' ').filter(w=>w.length>3);
  const titleOverlap=variantWords.length>=2&&titleWords.length>=2&&variantWords.filter(w=>titleWords.includes(w)).length>=2;
  return {file:c.file,name:c.name,kind:c.kind,sourceVariant:c.variant||'',titleOverlap,needsPrintedRubric:true};
 });
 return {category:s.category,path:s.path,hour:s.hour,variant:s.variant,slot:s.key,candidates:checked,warning:'Candidate is not an approved liturgical assignment; verify the printed rubric and exact GABC setting.'};
});
const counts={totalUnfilled:entries.length,withCandidates:entries.filter(e=>e.candidates.length).length,withoutCandidates:entries.filter(e=>!e.candidates.length).length,candidateLinks:entries.reduce((a,e)=>a+e.candidates.length,0)};
fs.writeFileSync(path.join(root,'data/unfilled-candidate-verification.json'),JSON.stringify({counts,entries},null,2)+'\n');
const lines=['# Unfilled slot candidate verification','',`- Unfilled slots: ${counts.totalUnfilled}`,`- Slots with candidate records: ${counts.withCandidates}`,`- Slots without candidates: ${counts.withoutCandidates}`,`- Candidate links (not confirmed matches): ${counts.candidateLinks}`,'','**No score was assigned automatically.** A same-hour candidate is not proof of the correct hymn.','', '| Section | Hour | Variant | Candidate(s) |','|---|---|---|---|'];
for(const e of entries.filter(x=>x.candidates.length)) lines.push(`| ${e.path.replace(/\|/g,'/')} | ${e.hour} | ${(e.variant||'—').replace(/\|/g,'/')} | ${e.candidates.map(c=>c.name+' ('+c.kind+')').join('; ').replace(/\|/g,'/')} |`);
fs.writeFileSync(path.join(root,'UNFILLED_CANDIDATE_VERIFICATION.md'),lines.join('\n')+'\n');
console.log(JSON.stringify(counts));
