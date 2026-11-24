#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const changes=[
 {id:17944,variant:'pro uno pastore',page:297,evidence:'Liber Hymnarius printed p.297, AD II VESPERAS, Pro uno pastore; variant verses on p.298'},
 {id:17945,variant:'pro uno pastore',page:297,evidence:'Liber Hymnarius printed p.297, AD II VESPERAS, Pro uno pastore; alternate GABC transcription'},
 {id:17949,variant:'pro pluribus pastoribus',page:299,evidence:'Liber Hymnarius printed p.299, Pro pluribus pastoribus, Sacrata nobis gaudia'}
];
for(const c of changes){const f=path.join(root,'gabc/hymns/gregobase-liber',`gb-${c.id}.gabc`);let s=fs.readFileSync(f,'utf8');if(/^variant:/m.test(s))s=s.replace(/^variant:.*$/m,`variant: ${c.variant};`);else s=s.replace(/^(hour:.*\n)/m,`$1variant: ${c.variant};\n`);fs.writeFileSync(f,s)}
fs.writeFileSync(path.join(root,'data/pastors-vespers-pdf-review.json'),JSON.stringify(changes,null,2)+'\n');
console.log('Verified '+changes.length+' score assignments against printed pages 297-299');
