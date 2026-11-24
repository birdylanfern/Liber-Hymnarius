#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const changes=[
 {id:17984,hour:'ol',variant:'pro una sancta muliere',page:319,title:'Hae feminae laudabiles'},
 {id:19205,hour:'v',variant:'pro una sancta muliere',page:322,title:'Fortem virili pectore'},
 {id:17955,hour:'v',variant:'pro pluribus sanctis mulieribus',page:323,title:'Christe cunctorum sator'}
];
for(const c of changes){const f=path.join(root,'gabc/hymns/gregobase-liber',`gb-${c.id}.gabc`);let s=fs.readFileSync(f,'utf8');for(const [k,v] of Object.entries({category:'c-mulieres',hour:c.hour,variant:c.variant})){const re=new RegExp('^'+k+':[^\\n]*$','m');if(re.test(s))s=s.replace(re,`${k}: ${v};`);else s=`${k}: ${v};\n`+s;}fs.writeFileSync(f,s);}
fs.writeFileSync(path.join(root,'data/holy-women-pdf-review.json'),JSON.stringify({source:'Liber Hymnarius 1983 printed pages 319, 322, 323 (PDF scans 166, 168)',verification:'Liturgical headings and incipits, not note-by-note',changes},null,2)+'\n');
console.log('Updated '+changes.length+' source-verified Common of Holy Women assignments');
