#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const tax=path.join(root,'tools/taxonomy.js');
let t=fs.readFileSync(tax,'utf8');
t=t.replace("slots('s-06-29', '29 · Ss. Petri & Pauli', ['v1', 'ol', 'l', 'v2'])", "slots('s-06-29', '29 · Ss. Petri & Pauli', ['v1', 'inv', 'ol', 'l', 'v2'])");
fs.writeFileSync(tax,t);
const chant=path.join(root,'gabc/hymns/gregobase-liber/gb-19988.gabc');
let gabc=fs.readFileSync(chant,'utf8');
if(!/^hour:/m.test(gabc))gabc='hour: v1;\n'+gabc;
fs.writeFileSync(chant,gabc);
const alias=path.join(root,'data/provisional-slot-aliases.json');
let a=JSON.parse(fs.readFileSync(alias,'utf8'));
a=a.filter(x=>!(x.category==='s-06-29'&&x.slot==='inv'));
a.push({category:'s-06-29',slot:'inv',hour:'inv',variant:'',file:'gabc/hymns/gregobase-liber/gb-10398.gabc',name:'Regem Apostolorum',reason:'Liber Hymnarius printed p. 390 refers the invitatory to Regem Apostolorum on p. 266. Mode III selected as a provisional option; mode IV also exists.',pdfRubricChecked:true});
fs.writeFileSync(alias,JSON.stringify(a,null,2)+'\n');
fs.writeFileSync(path.join(root,'PETER_PAUL_PDF_REVIEW.md'),`# Saints Peter and Paul — printed PDF review\n\n- Printed p. 388 (PDF spread 201): **Aurea luce et decore roseo** is the hymn at I Vespers. Existing gb-19988.gabc is now assigned to v1.\n- Printed p. 390 (PDF spread 202): Invitatory is **Regem Apostolorum**, referred to the Common of Apostles p. 266. Added the missing Invitatory taxonomy slot and a source-backed alias to gb-10398.gabc (mode III). The mode IV alternative gb-16675.gabc is retained separately in the Commons. This alias is UNCHECKED as to melodic choice.\n- Printed p. 390: Office of Readings begins **Felix per omnes**.\n- Printed p. 391: Lauds begins **Apostolorum passio**.\n- All original GABC musical notation is unchanged.\n`);
console.log('Applied printed p. 388–391 assignments for Ss. Peter and Paul');
