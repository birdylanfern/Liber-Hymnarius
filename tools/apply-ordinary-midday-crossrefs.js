#!/usr/bin/env node
// Liber Hymnarius p. 197 (Weeks I/III) and p. 227 (Weeks II/IV):
// subsequent weekdays use the same Hora Media hymns as Monday.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'gabc/hymns/verified-crossrefs');
fs.mkdirSync(out,{recursive:true});
const changes=[];
for(const [cycle,page] of [['13',197],['24',227]]){
  for(const [hour,label] of [['t','Tertia'],['s','Sexta'],['n','Nona']]){
    const index=require('../data/index.json');
    const source=index.hymns.find(h=>h.cat===`pa-${cycle}-f2`&&h.hour===hour&&h.slot===hour);
    if(!source)throw Error(`Missing Monday source for ${cycle} ${hour}`);
    const content=fs.readFileSync(path.join(root,source.file),'utf8');
    const body=content.slice(content.indexOf('%%'));
    for(const day of [3,4,5,6]){
      const category=`pa-${cycle}-f${day}`;
      const file=`ordinary-${cycle}-f${day}-${hour}.gabc`;
      const target=path.join(out,file);
      const header=[`name: ${source.name};`,`category: ${category};`,`hour: ${hour};`,`office-part: Hymnus;`,`provenance: liber-hymnarius-cross-reference;`,`source: ${source.source||''};`,`liber-page: ${page};`,`crossref-original: ${source.file};`,`commentary: The printed Liber Hymnarius p. ${page} explicitly reuses Monday's Hora Media hymns on subsequent weekdays; musical transcription copied unchanged from ${source.file};`];
      fs.writeFileSync(target,header.join('\n')+'\n'+body);
      changes.push({category,hour,name:source.name,from:source.file,to:`gabc/hymns/verified-crossrefs/${file}`,rubricPage:page});
    }
  }
}
fs.writeFileSync(path.join(root,'data','ordinary-midday-crossrefs.json'),JSON.stringify(changes,null,2)+'\n');
console.log(`Created ${changes.length} cross-referenced weekday scores`);
