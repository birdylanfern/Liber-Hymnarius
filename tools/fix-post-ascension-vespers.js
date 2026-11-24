#!/usr/bin/env node
// Idempotent rubric-based mapping for Liber Hymnarius pp. 88 and 90.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'gabc/hymns/verified-rubric-references');
fs.mkdirSync(dir,{recursive:true});
const specs=[
 {id:4515,variant:'in sollemnitate',name:'iesu-nostra-redemptio-sollemnitate'},
 {id:14258,variant:'in officio dominicali',name:'veni-creator-dominicali'},
 {id:14258,variant:'in officio feriali',name:'veni-creator-feriali'}
];
for(const x of specs){
 const source=path.join(root,`gabc/hymns/gregobase-liber/gb-${x.id}.gabc`);
 let content=fs.readFileSync(source,'utf8');
 // Preserve the source chant; the new file is an explicit liturgical reference.
 content=`variant: ${x.variant};\ncommentary: Liturgical-use reference verified against Liber Hymnarius printed pp. 88-90; melody itself not independently checked note by note;\n`+content.replace(/^variant:.*\r?\n/m,'');
 fs.writeFileSync(path.join(dir,x.name+'.gabc'),content);
}
console.log('Created 3 rubric-based references for post-Ascension Vespers.');
