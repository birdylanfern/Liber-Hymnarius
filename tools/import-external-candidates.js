#!/usr/bin/env node
// Import reviewed external GABC only from explicitly supplied local files.
// This intentionally does not fetch or infer liturgical equivalence.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const candidates=[
 {id:'17673',title:'Audi benigne conditor',cat:'quadragesima-hebd1-5',hour:'v',variant:'in officio dominicali',page:48,book:'Antiphonale Monasticum Solesmense, 1935, p. 337'},
 {id:'11203',title:'Tristes erant Apostoli',cat:'c-apostoli',hour:'v2',variant:'in tempore paschali',page:270,book:'Antiphonale Monasticum, 1934, p. 630'}
];
const input=process.argv[2];
if(!input){console.error('Usage: node tools/import-external-candidates.js /path/to/downloaded-gabc-folder');process.exit(2)}
let added=0;
for(const c of candidates){
 const source=path.join(input,c.id+'.gabc');
 if(!fs.existsSync(source)){console.log('SKIP missing '+source);continue}
 const raw=fs.readFileSync(source,'utf8').replace(/\r\n/g,'\n');
 if(!/^name\s*:/mi.test(raw)||!/^%%\s*$/m.test(raw)||!raw.includes('(::)')){console.log('REJECT invalid GABC '+c.id);continue}
 const name=(raw.match(/^name\s*:\s*(.*?);?\s*$/mi)||[])[1]||'';
 const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
 if(!norm(name).startsWith(norm(c.title))){console.log('REJECT title mismatch '+c.id+': '+name);continue}
 const dest=path.join(root,'gabc/hymns/gregobase-external','gb-'+c.id+'.gabc');
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 if(fs.existsSync(dest)){console.log('SKIP already present '+c.id);continue}
 const metadata=[`provenance: gregobase;`,`source: https://gregobase.selapa.net/chant.php?id=${c.id};`,`category: ${c.cat};`,`hour: ${c.hour};`,`variant: ${c.variant};`,`liber-page: ${c.page};`,`classification-status: unchecked;`,`commentary: EXTERNAL SOURCE - UNCHECKED. ${c.book}. Musical and textual equivalence to Liber Hymnarius 1983 has not been established;`].join('\n');
 fs.writeFileSync(dest,metadata+'\n'+raw);added++;console.log('IMPORTED external unchecked '+c.id);
}
console.log('Added '+added+' external candidate(s). Run npm run build && npm run reconcile:all.');
