#!/usr/bin/env node
// Assign noctu/diurno based on printed Liber Hymnarius pp. 183-239.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const map={
 'pa-13-dom':[['Primo dierum','noctu',183],['Dies aetasque','diurno',183]],
 'pa-13-f2':[['Somno refectis','noctu',190],['Aeterna lux divinitas','diurno',190]],
 'pa-13-f3':[['Consors paterni','noctu',196],['O sacrosancta Trinitas','diurno',196]],
 'pa-13-f4':[['Rerum creator','noctu',198],['Scientiarum Domino','diurno',199]],
 'pa-13-f5':[['Nox atra rerum','noctu',201],['Christe precamur','diurno',201]],
 'pa-13-f6':[['Tu Trinitatis Unitas','noctu',203],['Adesto Christe','diurno',204]],
 'pa-13-sab':[['Summae Deus','noctu',206],['Auctor perennis','diurno',206]],
 'pa-24-dom':[['Mediae noctis','noctu',209],['Salve dies dierum','diurno',210]],
 'pa-24-f2':[['Ipsum nunc nobis','noctu',217],['Vita sanctorum','diurno',217]],
 'pa-24-f3':[['Nocte surgentes','noctu',224],['Ad preces nostras','diurno',225]],
 'pa-24-f4':[['O sator rerum','noctu',228],['Christe lux vera','diurno',229]],
 'pa-24-f5':[['Ales diei nuntius','noctu',232],['Amoris sensus erige','diurno',233]],
 'pa-24-f6':[['Galli cantu','noctu',234],['Adesto rerum conditor','diurno',235]],
 'pa-24-sab':[['Lux aeterna','noctu',237],['Deus de nullo veniens','diurno',238]]
};
const index=JSON.parse(fs.readFileSync(path.join(root,'data/index.json')));
let changed=[];
for(const [cat, entries] of Object.entries(map)) for(const [prefix,variant,page] of entries){
 const matches=index.hymns.filter(x=>x.cat===cat&&x.hour==='ol'&&x.name.toLowerCase().startsWith(prefix.toLowerCase()));
 if(!matches.length) throw Error(`No GABC found: ${cat} ${prefix}`);
 for(const item of matches){
  const f=path.join(root,item.file);let content=fs.readFileSync(f,'utf8');
  if(/^variant:/mi.test(content)) content=content.replace(/^variant:.*$/mi,`variant: ${variant};`);
  else content=content.replace(/^%%\s*$/m,`variant: ${variant};\n%%`);
  fs.writeFileSync(f,content);
  changed.push({category:cat,name:item.name,file:item.file,variant,printedPage:page,source:'Liber Hymnarius 1983 printed rubric'});
 }
}
fs.writeFileSync(path.join(root,'data/ordinary-readings-rubric-fixes.json'),JSON.stringify(changed,null,2)+'\n');
console.log('Updated',changed.length,'score metadata records for',Object.keys(map).length,'liturgical days.');
