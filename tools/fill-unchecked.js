#!/usr/bin/env node
/* Adds clearly marked, non-authoritative candidate placements for every empty slot.
   Original GABC files and their metadata are never modified. */
const fs = require('fs');
const path = require('path');
const taxonomy = require('./taxonomy');
const root = path.resolve(__dirname, '..');
const indexFile = path.join(root, 'data/index.json');
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
const originals = index.hymns.filter(e => !e.unchecked);
const paths = {};
function visit(nodes, parent=[]) { for(const n of nodes){paths[n.id] = [...parent,n.id]; visit(n.kids || [], paths[n.id]);} }
visit(taxonomy.tree);
const hourCompatible = (a,b) => a===b || (['v','v1','v2','v12'].includes(a) && ['v','v1','v2','v12','lv','olv'].includes(b)) || (a==='l' && b==='lv') || (a==='ol' && b==='olv') || (a==='vig' && b==='vv');
function similarity(a,b){const x=paths[a]||[], y=paths[b]||[]; let i=0; while(i<x.length&&i<y.length&&x[i]===y[i])i++; return i;}
const results=[];
for(const [cat,node] of Object.entries(taxonomy.byId)){
 for(const slot of node.slots || []){
  // Do not substitute a different hymn for Christe qui splendor.
  if(cat==='pa-compl' && /christe qui splendor/i.test(slot.key)) continue;
  if(originals.some(e=>e.cat===cat && e.slot===slot.key)) continue;
  // Strong preference for same section and liturgical hour; no assertion of correctness.
  const ranked=originals.map(e=>{
    const sim=similarity(cat,e.cat);
    const sameCat=e.cat===cat;
    const hourMatch=hourCompatible(slot.hour,e.hour);
    const score=(sameCat?10000:0)+sim*1000+(hourMatch?350:0)+(e.part && /hymn/i.test(e.part)?60:0)+(e.provenance==='gregobase-liber'?20:0);
    return {e,score,sim,hourMatch,sameCat};
  }).sort((a,b)=>b.score-a.score || (a.e.liberPage||9999)-(b.e.liberPage||9999) || a.e.id.localeCompare(b.e.id));
  const choice=ranked[0];
  if(!choice) continue;
  const e=choice.e;
  const id='unchecked/'+cat+'/'+slot.key.replace(/[^a-z0-9]+/gi,'-');
  const candidate={...e,id,cat,hour:slot.hour,variant:slot.variant||'',slot:slot.key,unchecked:true,originalId:e.id,
    uncheckedReason:choice.sameCat?'Existing score from this section; hour/variant not verified':choice.sim>=2?'Candidate borrowed from a related section; placement not verified':'Fallback candidate from elsewhere in the collection; likely requires replacement',
    search:e.search+' unchecked provisional '+taxonomy.fold(node.label)};
  index.hymns.push(candidate);
  results.push({category:cat,slot:slot.key,hymn:e.name,sourceFile:e.file,originalCategory:e.cat,originalHour:e.hour,confidence:choice.sameCat?'same-section':choice.sim>=2?'related-section':'fallback',note:candidate.uncheckedReason});
 }
}
fs.writeFileSync(indexFile,JSON.stringify(index));
fs.writeFileSync(path.join(root,'data/unchecked-placements.json'),JSON.stringify({generated:new Date().toISOString(),warning:'These are NOT verified liturgical assignments. Some fallback candidates may be incorrect. Original scores remain unchanged.',count:results.length,placements:results},null,2));
console.log(`Added ${results.length} visibly UNCHECKED candidate placements (originals preserved).`);
