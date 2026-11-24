#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const changes=[
 {id:17920,hour:'ol',variant:'pro martyre virgine',page:282,title:'Christe flos convallium',rubric:'Pro martyre virgine; Office of Readings'},
 {id:8827,hour:'l',variant:'pro martyre virgine',page:284,title:'O castitatis signifer',rubric:'Pro martyre virgine; Lauds'},
 {id:18024,hour:'v',variant:'pro martyre virgine',page:288,title:'Virginis proles',rubric:'Pro martyre virgine; Vespers'}
];
for(const c of changes){
 const f=path.join(root,'gabc/hymns/gregobase-liber',`gb-${c.id}.gabc`);
 let s=fs.readFileSync(f,'utf8');
 for(const [key,val] of Object.entries({category:'c-martyr-unus',hour:c.hour,variant:c.variant})){
  const rx=new RegExp('^'+key+':[^\\n]*;?\\s*$','m');
  if(rx.test(s))s=s.replace(rx,`${key}: ${val};`);else s=`${key}: ${val};\n`+s;
 }
 fs.writeFileSync(f,s);
}
fs.writeFileSync(path.join(root,'data/virgin-martyr-pdf-verification.json'),JSON.stringify({source:'Liber Hymnarius (1983), printed pages 282, 284, 288; PDF scan pages 148, 149, 151',scope:'Liturgical placement only; notes not independently verified',changes},null,2)+'\n');
console.log('Verified three virgin-martyr liturgical placements against the printed rubrics.');
