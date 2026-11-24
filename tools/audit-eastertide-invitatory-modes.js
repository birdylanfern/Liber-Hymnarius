const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const index = JSON.parse(fs.readFileSync(path.join(root, 'data/index.json'), 'utf8'));
const expected = [
  {cat:'c-doctores',slot:'inv|fontem sapientiae in tempore paschali',title:'Fontem sapientiae',mode:'6',page:301},
  {cat:'c-viri',slot:'inv|mirabilem in sanctis in tempore paschali',title:'Mirabilem in sanctis',mode:'6',page:311}
];
const entries = index.hymns || [];
if (!Array.isArray(entries) || !entries.length) throw new Error('Index records not found: refusing a false clean audit');
const result = expected.map(e => {
  const matches = entries.filter(x => x.cat === e.cat && x.slot === e.slot);
  const findings = matches.map(x => {
    const filename = path.join(root, x.file || '');
    if (!fs.existsSync(filename)) return {file:x.file,error:'missing GABC file'};
    const gabc = fs.readFileSync(filename,'utf8');
    const mode = (gabc.match(/^mode:\s*([^;\r\n]+)/m)||[])[1]?.trim() || '';
    const hasAlleluia = /allel[uú]ia/i.test(gabc.replace(/\([^)]*\)/g,''));
    return {file:x.file,mode,hasAlleluia,error:mode !== e.mode ? 'WRONG MODE FOR EASTERTIDE' : (!hasAlleluia ? 'ALLELUIA TEXT NOT DETECTED' : null)};
  });
  return {...e,status:matches.length ? (findings.some(f=>f.error)?'REVIEW REQUIRED':'MODE AND ALLELUIA PRESENT; MUSICAL VERIFICATION PENDING'):'MISSING GABC',matches:findings};
});
const out = {reference:'Liber Hymnarius 1983 printed pp. 301 and 311-312',rule:'Distinct Eastertide mode VI* with Alleluia; mode IV ordinary setting is not interchangeable',results:result};
fs.writeFileSync(path.join(root,'data/eastertide-mode-safety-audit.json'),JSON.stringify(out,null,2)+'\n');
console.log(result.map(x=>`${x.title}: ${x.status}`).join('\n'));
if(result.some(x=>x.status==='REVIEW REQUIRED')) process.exitCode=1;
