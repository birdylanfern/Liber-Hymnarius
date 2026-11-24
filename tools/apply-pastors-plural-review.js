#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const edits=[
 {id:8701,variant:'pro pluribus pastoribus',evidence:'Opening Dum sacerdotum celebrant fideles is plural; GregoBase Liber Hymnarius p. 292. Placement provisional.'},
 {id:17985,variant:'pro pluribus pastoribus',evidence:'Opening Hi sacerdotes Domini sacrati is plural; GregoBase Liber Hymnarius p. 296. Placement provisional.'}
];
for(const e of edits){const p=path.join(root,'gabc/hymns/gregobase-liber',`gb-${e.id}.gabc`);let s=fs.readFileSync(p,'utf8');if(!/^variant:/m.test(s))s=s.replace(/^(hour:[^\n]*\n)/m,`$1variant: ${e.variant};\n`);else s=s.replace(/^variant:.*$/m,`variant: ${e.variant};`);if(!/^unchecked:/m.test(s))s=s.replace(/^(variant:[^\n]*\n)/m,'$1unchecked: true;\n');fs.writeFileSync(p,s)}
fs.writeFileSync(path.join(root,'data/pastors-plural-review.json'),JSON.stringify(edits,null,2)+'\n');
console.log('Assigned two provisional plural-pastors variants');
