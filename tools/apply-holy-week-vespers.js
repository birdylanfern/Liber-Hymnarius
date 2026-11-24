#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const src=path.join(root,'gabc/hymns/gregobase-liber/gb-19794.gabc');
const dest=path.join(root,'gabc/hymns/verified-rubric-references/vexilla-regis-holy-week.gabc');
const original=fs.readFileSync(src,'utf8');
const header=`category: hebdomada-sancta;\nhour: v;\nliber-page: 58;\ncrossref-original: gabc/hymns/gregobase-liber/gb-19794.gabc;\ncommentary: Liturgical placement verified against Liber Hymnarius printed p. 58 (Holy Week Vespers). Original GregoBase notation has not been independently verified note by note;\n`;
fs.mkdirSync(path.dirname(dest),{recursive:true});
fs.writeFileSync(dest,original.replace(/^category:\s*[^;]+;/m,'category: hebdomada-sancta;').replace(/^hour:\s*[^;]+;/m,'hour: v;').replace(/^liber-page:\s*[^;]+;/m,'liber-page: 58;').replace(/^commentary:\s*[^;]+;/m,'commentary: Placement checked against Liber Hymnarius printed p. 58; musical notation is GregoBase-derived and not note-by-note verified;').replace('%%', 'crossref-original: gabc/hymns/gregobase-liber/gb-19794.gabc;\n%%'));
console.log('Added source-backed Holy Week Vespers reference: '+path.relative(root,dest));
