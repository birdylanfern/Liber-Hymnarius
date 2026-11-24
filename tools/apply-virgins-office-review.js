#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const changes=[
 {id:15287,variant:'pro una virgine',evidence:'GABC embedded occasion: Commune Unius Virginis; Liber Hymnarius p. 306'},
 {id:17974,variant:'pro pluribus virginibus',evidence:'Hymn opening explicitly celebrates sanctarum Christi virginum (plural); Liber Hymnarius p. 307'}
];
for(const c of changes){const file=path.join(root,`gabc/hymns/gregobase-liber/gb-${c.id}.gabc`);let s=fs.readFileSync(file,'utf8');if(/^variant:/m.test(s))s=s.replace(/^variant:.*$/m,`variant: ${c.variant};`);else s=s.replace(/^(hour:.*\n)/m,`$1variant: ${c.variant};\n`);fs.writeFileSync(file,s);}
fs.writeFileSync(path.join(root,'data/virgins-office-review.json'),JSON.stringify(changes,null,2)+'\n');
console.log('Applied '+changes.length+' source-backed variant assignments');
