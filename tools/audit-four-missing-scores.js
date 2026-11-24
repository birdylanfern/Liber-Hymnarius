const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const targets=[
 {category:'s-03-19',slot:'inv',expected:'Laudemus Deum nostrum in solemnitate beati Ioseph',page:357},
 {category:'s-03-19',slot:'l',expected:'Caelitum Ioseph',page:358},
 {category:'pentecostes',slot:'l',expected:'Beata nobis gaudia',page:99},
 {category:'s-01-25',slot:'inv',expected:'Laudemus Deum nostrum in conversione Doctoris gentium',page:342}
];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]).filter(x=>x.endsWith('.gabc'))}
function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'')}
const files=walk(path.join(root,'gabc'));
const scores=files.map(file=>{let s=fs.readFileSync(file,'utf8');let name=(s.match(/^name:\s*(.*?);?\s*$/mi)||[])[1]||'';let page=(s.match(/^liber-page:\s*(\d+)/mi)||[])[1]||null;return {file:path.relative(root,file),name:name.replace(/;$/,''),page:page?Number(page):null}});
const result=targets.map(t=>{const first=t.expected.split(' ').slice(0,3).join(' ');const matches=scores.filter(s=>norm(s.name).includes(norm(first))||norm(t.expected).includes(norm(s.name))&&norm(s.name).length>9);return {...t,localTitleMatches:matches,confirmedScore:null,decision:'NOT IMPORTED: matching title alone is insufficient; compare feast, printed page, and melody.'}});
fs.writeFileSync(path.join(root,'data/four-missing-scores-audit.json'),JSON.stringify({totalScanned:files.length,targets:result},null,2)+'\n');
console.log(JSON.stringify({scanned:files.length,matches:result.map(r=>({expected:r.expected,matches:r.localTitleMatches.length}))},null,2));
