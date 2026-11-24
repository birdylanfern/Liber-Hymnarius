#!/usr/bin/env node
const fs=require('fs'),path=require('path'),tax=require('./taxonomy');
const root=path.join(__dirname,'..'),h=require('../data/index.json').hymns;
const out=[];
function visit(nodes,trail=[]){for(const n of nodes){const t=[...trail,n.label];for(const s of n.slots||[]){const exact=h.filter(e=>e.cat===n.id&&e.slot===s.key);const possible=h.filter(e=>e.cat===n.id&&e.hour===s.hour&&!e.slot);out.push({category:n.id,path:t.join(' / '),slot:s.key,hour:s.hour,variant:s.variant||'',status:exact.length?'populated':'unfilled',assigned:exact.map(e=>({name:e.name,file:e.file,source:e.source,page:e.liberPage})),unresolvedSameHour:possible.map(e=>({name:e.name,file:e.file,page:e.liberPage})),note:exact.length?'Catalogue placement only; not independently verified against PDF':'Do not substitute a different hymn without a printed rubric.'});}visit(n.kids||[],t);}}
visit(tax.tree);
fs.writeFileSync(path.join(root,'data','full-slot-review.json'),JSON.stringify({total:out.length,populated:out.filter(x=>x.status==='populated').length,slots:out},null,2)+'\n');
console.log(out.length,'slots;',out.filter(x=>x.status==='populated').length,'populated');
