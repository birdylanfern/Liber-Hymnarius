#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const p=path.join(root,'data/provisional-slot-aliases.json');
let a=JSON.parse(fs.readFileSync(p,'utf8'));
const items=[
 {slot:'t',file:'gb-4238.gabc',name:'Certum tenentes ordinem',page:41},
 {slot:'s',file:'gb-4239.gabc',name:'Dicamus laudes Domino',page:42},
 {slot:'n',file:'gb-4240.gabc',name:'Ternis horarum terminis',page:42}
];
for(const i of items){
 a=a.filter(v=>!(v.category==='nativitatis-post-epiph'&&v.slot===i.slot));
 a.push({category:'nativitatis-post-epiph',slot:i.slot,hour:i.slot,variant:'',file:'gabc/hymns/gregobase-liber/'+i.file,name:i.name,reason:`Liber Hymnarius (1983), printed p. ${i.page}, specifies this hymn at this hour after Epiphany. Existing GABC belongs to Advent after 16 December; identical musical setting has NOT been verified. UNCHECKED cross-season candidate.`,pdfRubricChecked:true,unchecked:true});
}
fs.writeFileSync(p,JSON.stringify(a,null,2)+'\n');
console.log('Added 3 UNCHECKED Christmas midday references.');
