#!/usr/bin/env node
/* Safe offline import of four feast-specific scores after downloading GABC files.
   Usage: node tools/import-four-source-candidates.js /path/to/gabc-folder
   Expected filenames: joseph-invitatory.gabc, joseph-lauds.gabc,
   pentecost-lauds.gabc, paul-invitatory.gabc
*/
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const input=process.argv[2];
if(!input){console.error('Usage: node tools/import-four-source-candidates.js <downloaded-gabc-directory>');process.exit(2)}
const jobs=[
 {file:'joseph-invitatory.gabc',title:'Laudemus Deum nostrum',required:/ioseph|joseph/i,cat:'s-03-19',hour:'inv',page:357,source:'feast-specific St Joseph invitatory'},
 {file:'joseph-lauds.gabc',title:'Caelitum Ioseph',cat:'s-03-19',hour:'l',page:358,source:'GregoBase 17643 (2019 Liber attribution; 1983 unverified)'},
 {file:'pentecost-lauds.gabc',title:'Beata nobis gaudia',cat:'pentecostes',hour:'l',page:99,source:'GregoBase 11858 or 9146 (external edition; 1983 unverified)'},
 {file:'paul-invitatory.gabc',title:'Laudemus Deum',required:/paul|pauli|conversion|gentium/i,cat:'s-01-25',hour:'inv',page:342,source:'feast-specific Conversion of St Paul invitatory'}
];
const fold=s=>s.toLowerCase().replace(/æ/g,'ae').replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
// Only sung words count as feast-specific evidence. Metadata, source comments,
// and filenames may mention a saint even when the score is generic.
function sungText(raw){
 const body=raw.split(/^%%\s*$/m).slice(1).join('\n');
 return body.replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}
const report=[];let count=0;
for(const j of jobs){
 const src=path.join(input,j.file);const record={file:j.file,status:'missing'};
 if(!fs.existsSync(src)){report.push(record);continue}
 const raw=fs.readFileSync(src,'utf8').replace(/\r\n/g,'\n');
 const name=(raw.match(/^name\s*:\s*([^\n;]+)/mi)||[])[1]||'';
 if(!/^%%\s*$/m.test(raw)||!/(\([a-mA-M][^)]*\))/.test(raw)||!fold(name).startsWith(fold(j.title))){record.status='rejected';record.reason='Invalid GABC or title mismatch: '+name;report.push(record);continue}
 if(j.required&&!j.required.test(sungText(raw))){record.status='rejected';record.reason='Feast-specific words absent from sung text; metadata alone is insufficient';report.push(record);continue}
 const dest=path.join(root,'gabc/hymns/gregobase-external','candidate-'+j.file);
 if(fs.existsSync(dest)){record.status='already-present';report.push(record);continue}
 const meta=`provenance: gregobase-external;\ncategory: ${j.cat};\nhour: ${j.hour};\nliber-page: ${j.page};\nclassification-status: unchecked;\ncommentary: EXTERNAL SOURCE - UNCHECKED. ${j.source}. Compare the chant and complete text against Liber Hymnarius 1983 before verification;\n`;
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,meta+raw);
 record.status='imported-unchecked';record.output=path.relative(root,dest);count++;report.push(record);
}
fs.writeFileSync(path.join(root,'data/four-candidate-import-results.json'),JSON.stringify({imported:count,results:report},null,2)+'\n');
console.log(JSON.stringify({imported:count,results:report},null,2));
