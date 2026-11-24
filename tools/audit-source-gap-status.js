#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const report=JSON.parse(fs.readFileSync(path.join(root,'data/complete-reconciliation.json'),'utf8'));
const gaps=JSON.parse(fs.readFileSync(path.join(root,'data/source-confirmed-gaps.json'),'utf8'));
const slots=new Map(report.slots.map(s=>[s.category+'|'+s.key,s]));
const results=gaps.map(g=>{const s=slots.get(g.category+'|'+g.slot);return {...g,currentStatus:!s?'SLOT NOT FOUND':s.status==='populated'?'POPULATED — verify source and melody':'MISSING SCORE',assigned:s?.assigned||[],candidateCount:(s?.sameHourCandidates||[]).length};});
const pending=results.filter(x=>x.currentStatus==='MISSING SCORE');
fs.writeFileSync(path.join(root,'data/source-gap-current-status.json'),JSON.stringify({generatedFrom:'complete-reconciliation.json',results},null,2)+'\n');
const lines=['# Current source-confirmed gaps','','Historical source-gap records must not be treated as live missing-score counts. This audit cross-checks each recorded gap against the current catalogue. A populated slot is not necessarily verified against the 1983 score.','',`- Source-gap records: ${results.length}`,`- Still unfilled: ${pending.length}`,`- Now populated: ${results.filter(x=>x.currentStatus.startsWith('POPULATED')).length}`,`- Slot keys not found: ${results.filter(x=>x.currentStatus==='SLOT NOT FOUND').length}`,'','| Printed hymn | Liturgical slot | Current status |','|---|---|---|',...results.map(r=>`| ${r.expected.replace(/\|/g,'/')} | ${r.category} / ${r.slot} | ${r.currentStatus} |`),'','The full status including assigned file names is in `data/source-gap-current-status.json`.'];
fs.writeFileSync(path.join(root,'SOURCE_GAPS_CURRENT_STATUS.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({total:results.length,pending:pending.length,populated:results.filter(x=>x.currentStatus.startsWith('POPULATED')).length,notFound:results.filter(x=>x.currentStatus==='SLOT NOT FOUND').length}));
