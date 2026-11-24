#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const taxonomy=path.join(root,'tools/taxonomy.js');
let t=fs.readFileSync(taxonomy,'utf8');
t=t.replace("slots('c-religiosi', 'Pro Religiosis', ['l', 'v'])", "slots('c-religiosi', 'Pro Religiosis', ['v1', 'inv', 'ol', 'l', 'v2'])");
fs.writeFileSync(taxonomy,t);
const chant=path.join(root,'gabc/hymns/gregobase-liber/gb-8826.gabc');
let g=fs.readFileSync(chant,'utf8').replace(/^hour:\s*v;/m,'hour: v2;');
fs.writeFileSync(chant,g);
const f=path.join(root,'data/provisional-slot-aliases.json');
let a=JSON.parse(fs.readFileSync(f,'utf8')).filter(x=>! (x.category==='c-religiosi' && ['v1','ol','inv'].includes(x.slot)));
const specs=[
 ['v1','v1','','gabc/hymns/gregobase-liber/gb-8826.gabc','Laeti colentes famulum','Printed p. 324 explicitly refers I Vespers to the II Vespers hymn on p. 326.'],
 ['ol','ol','','gabc/hymns/gregobase-liber/gb-8826.gabc','Laeti colentes famulum','Printed p. 325 explicitly refers Office of Readings to the II Vespers hymn on p. 326.'],
 ['inv','inv','','gabc/hymns/gregobase-liber/gb-20882.gabc','Mirabilem in sanctis','Printed p. 324 refers the invitatory to Mirabilem in sanctis suis on p. 311; melodic identity requires checking.']
];
for(const [slot,hour,variant,file,name,reason] of specs)a.push({category:'c-religiosi',slot,hour,variant,file,name,reason,pdfRubricChecked:true});
fs.writeFileSync(f,JSON.stringify(a,null,2)+'\n');
fs.writeFileSync(path.join(root,'RELIGIOUS_COMMON_PDF_REVIEW.md'),`# Common of Religious — printed-source reconciliation\n\n- Printed p. 324: I Vespers explicitly uses **Laeti colentes**, as at II Vespers on p. 326.\n- Printed p. 324: Invitatory refers to **Mirabilem in sanctis suis**, p. 311. The existing GABC is reused as an UNCHECKED source-backed reference, not a newly verified melody.\n- Printed p. 325: Office of Readings explicitly uses the hymn at II Vespers, p. 326.\n- Printed p. 325: Lauds prints **O Redemptoris pietas**, already present in the catalogue.\n- Printed p. 326: II Vespers prints **Laeti colentes famulum**, formerly assigned only to generic Vespers.\n\nThe taxonomy now distinguishes I Vespers, Invitatory, Office of Readings, Lauds and II Vespers. Original GABC notes were not changed. Source aliases are labelled UNCHECKED in the app.\n`);
console.log('Reconciled Common of Religious from printed pages 324–326');
