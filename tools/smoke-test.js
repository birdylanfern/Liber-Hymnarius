#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=JSON.parse(read('data/index.json'));
const tones=JSON.parse(read('data/invitatory-psalm-tone-sources.json')).tones;
let errors=[],warnings=[],files=new Set();
for(const asset of ['index.html','app.js','app.css','exsurge.min.js','data/index.json'])if(!fs.existsSync(path.join(root,asset)))errors.push('Missing website asset: '+asset);
for(const h of index.hymns){
 if(!h.file || h.file.includes('..') || path.isAbsolute(h.file)){errors.push('Unsafe or absent score path: '+JSON.stringify(h));continue;}
 files.add(h.file);
}
for(const t of tones)files.add(t.file);
for(const file of files){
 const full=path.join(root,file);
 if(!fs.existsSync(full)){errors.push('Missing score: '+file);continue;}
 const gabc=read(file);
 if(!gabc.includes('%%'))errors.push('Missing GABC header separator: '+file);
 if(!/\([cf][1-4]\)/.test(gabc))warnings.push('No conventional clef found: '+file);
 if(!/\(::\)/.test(gabc))warnings.push('No final double bar found: '+file);
}
const review=read('data/liturgical-slot-review.csv').trim().split(/\r?\n/);
if(review.length!==430)warnings.push('Expected 429 slot rows, found '+(review.length-1));
const result={catalogueRecords:index.hymns.length,uniqueReferencedGabc:files.size,slotRows:review.length-1,errors,warnings};
fs.writeFileSync(path.join(root,'data/automated-smoke-test.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({catalogueRecords:result.catalogueRecords,uniqueReferencedGabc:result.uniqueReferencedGabc,slotRows:result.slotRows,errorCount:errors.length,warningCount:warnings.length},null,2));
if(errors.length){console.error(errors.slice(0,20).join('\n'));process.exitCode=1;}
