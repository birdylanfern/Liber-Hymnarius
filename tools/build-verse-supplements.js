#!/usr/bin/env node
// A source-backed comparison aid, not a replacement for missing musical notation.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'), entries=require('../data/index.json').hymns.filter(x=>!x.unchecked);
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const base=s=>s.replace(/\s*\([^()]*\)\s*$/,'');
const get=e=>fs.readFileSync(path.join(root,e.file),'utf8').split(/^%%\s*$/m).slice(-1)[0];
const plain=s=>s.replace(/\([^)]*\)/g,'').replace(/<[^>]*>/g,'').replace(/\b\d+\.\s*/g,'').replace(/\s+/g,' ').trim();
const info=entries.map(e=>{const body=get(e), stanzas=body.split(/(?:^|\n)\s*[2-9]\.\s+/);return {e,body,stanzas,plain:plain(body),first:plain(stanzas[0])};});
const supplements={};let candidates=0;
for(const a of info){
 if(!/hymn/i.test(a.e.part||'') || a.stanzas.length>1)continue;
 const matches=info.filter(b=>b!==a && /hymn/i.test(b.e.part||'') && b.stanzas.length>1 && norm(base(b.e.name))===norm(base(a.e.name)) && b.e.liberPage===a.e.liberPage && norm(b.first).slice(0,55)===norm(a.first).slice(0,55));
 if(!matches.length)continue;
 matches.sort((x,y)=>y.stanzas.length-x.stanzas.length);
 const b=matches[0];
 supplements[a.e.id]={sourceId:b.e.id,sourceName:b.e.name,sourceUrl:b.e.source,stanzas:b.stanzas.length,comparisonText:b.stanzas.map((s,i)=>(i?`${i+1}. `:'')+plain(s)).join('\n\n'),note:'Comparison text from a different GregoBase score with the same printed page and opening stanza. Not verified as the correct verses or musical setting for this variant.'};candidates++;
}
fs.writeFileSync(path.join(root,'data/verse-supplements.json'),JSON.stringify(supplements,null,2)+'\n');
console.log('Source-backed verse comparisons:',candidates);
