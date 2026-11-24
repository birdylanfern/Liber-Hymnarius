#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const changes=[
 {id:17946,variant:'pro uno pastore',page:297,reason:'Vir celse forma fulgida addresses one pastor; GregoBase Liber Hymnarius p. 297; exact rubric not independently verified.'},
 {id:17949,variant:'pro pluribus pastoribus',page:299,reason:'Sacrata nobis gaudia addresses duces ovilium (plural); GregoBase Liber Hymnarius p. 299; exact rubric not independently verified.'}
];
for(const c of changes){const p=path.join(root,'gabc/hymns/gregobase-liber',`gb-${c.id}.gabc`);let s=fs.readFileSync(p,'utf8');for(const [key,val] of Object.entries({variant:c.variant,unchecked:'true'})){const re=new RegExp('^'+key+':[^\\n]*$','m');if(re.test(s))s=s.replace(re,`${key}: ${val};`);else s=s.replace(/^(hour:[^\n]*\n)/m,`$1${key}: ${val};\n`)}fs.writeFileSync(p,s)}
fs.writeFileSync(path.join(root,'data/pastors-vespers-provisional.json'),JSON.stringify({status:'UNCHECKED',changes},null,2)+'\n');
console.log('Assigned two explicitly UNCHECKED pastors Vespers candidates');
