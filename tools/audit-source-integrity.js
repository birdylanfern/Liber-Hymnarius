#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const index=require(path.join(root,'data/index.json'));
const review=require(path.join(root,'data/complete-reconciliation.json'));
const byFile=new Map();for(const h of index.hymns){const a=byFile.get(h.file)||[];a.push({name:h.name,category:h.cat,hour:h.hour,variant:h.variant,unchecked:!!h.unchecked});byFile.set(h.file,a)}
const missing=[...byFile.keys()].filter(f=>!fs.existsSync(path.join(root,f)));
const reused=[...byFile].filter(([,a])=>a.length>1).map(([file,placements])=>({file,placements}));
const physical=[];function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else if(p.endsWith('.gabc'))physical.push(path.relative(root,p).replaceAll('\\','/'))}}walk(path.join(root,'gabc'));
const auxiliary=require(path.join(root,'data/invitatory-psalm-tone-sources.json')).tones.map(t=>t.file);
const auxiliaryMissing=auxiliary.filter(f=>!fs.existsSync(path.join(root,f)));
const unindexed=physical.filter(f=>!byFile.has(f)&&!auxiliary.includes(f));
const empty=review.slots.filter(s=>s.status!=='populated').map(s=>({section:s.path,hour:s.hour,variant:s.variant,status:s.status,candidates:[...s.sameHourCandidates,...s.uncategorizedHourCandidates].map(x=>({name:x.name,file:x.file}))}));
const report={summary:{catalogueRecords:index.hymns.length,distinctReferencedFiles:byFile.size,physicalGabcFiles:physical.length,missingReferencedFiles:missing.length,unindexedFiles:unindexed.length,auxiliaryPsalmScores:auxiliary.length,missingAuxiliaryPsalmScores:auxiliaryMissing.length,reusedScoreFiles:reused.length,populatedSlots:review.summary.populated,totalSlots:review.summary.definedSlots,emptySlots:empty.length},missing,unindexed,auxiliaryPsalmScores:auxiliary,auxiliaryMissing,reused,empty};
fs.writeFileSync(path.join(root,'data/source-integrity-audit.json'),JSON.stringify(report,null,2)+'\n');
const lines=['# Source integrity and remaining liturgical slots','',`This is a file-integrity and coverage audit, **not** musical verification.`, '',...Object.entries(report.summary).map(([k,v])=>`- ${k}: **${v}**`),'','## Missing scores or rubric decisions','',...empty.map(s=>`- ${s.section} — ${s.hour}${s.variant?' ('+s.variant+')':''}: ${s.status}; ${s.candidates.length?s.candidates.map(c=>c.name).join(', '):'no local candidate'}`),''];
fs.writeFileSync(path.join(root,'SOURCE_INTEGRITY_AND_GAPS.md'),lines.join('\n'));console.log(JSON.stringify(report.summary,null,2));
