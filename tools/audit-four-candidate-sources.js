#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const entries=[
 {slot:'St Joseph — Invitatory',page:357,filename:'joseph-invitatory.gabc',status:'Feast-specific text required; source ID not verified'},
 {slot:'St Joseph — Lauds',page:358,filename:'joseph-lauds.gabc',gregobaseId:17643,sourceEdition:'Liber Hymnarius 2019',status:'1983 melody comparison required'},
 {slot:'Pentecost — Lauds',page:99,filename:'pentecost-lauds.gabc',gregobaseId:11858,alternateId:9146,sourceEdition:'Liber Usualis 1961 / Antiphonale Monasticum 1934',status:'1983 melody comparison required'},
 {slot:'Conversion of St Paul — Invitatory',page:342,filename:'paul-invitatory.gabc',status:'Feast-specific text required; source ID not verified'}
];
const results=entries.map(e=>({...e,sourceUrl:e.gregobaseId?`https://gregobase.selapa.net/chant.php?id=${e.gregobaseId}`:null,localFile:path.join('gabc/hymns/gregobase-external','candidate-'+e.filename),imported:fs.existsSync(path.join(root,'gabc/hymns/gregobase-external','candidate-'+e.filename))}));
fs.writeFileSync(path.join(root,'data/four-candidate-source-status.json'),JSON.stringify({checkedAt:'2026-11-23',results},null,2)+'\n');
console.log(results.map(e=>`${e.imported?'IMPORTED':'MISSING'} | ${e.slot} | ${e.status}`).join('\n'));
