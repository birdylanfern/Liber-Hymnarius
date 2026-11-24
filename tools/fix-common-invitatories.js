#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const changes={
 '10398':['Regem Apostolorum A.III','Liber Hymnarius p. 266: invitatory, mode III'],
 '16675':['Regem Apostolorum A.IV','Liber Hymnarius p. 266: invitatory, mode IV'],
 '20880':['Regem Apostolorum, in tempore paschali','Liber Hymnarius p. 266: Eastertide invitatory'],
 '10558':['in sollemnitatibus et festis','Liber Hymnarius p. 273: common of several martyrs; provisional feast assignment'],
 '20901':['in memoriis','GregoBase identifies memoria; Liber Hymnarius p. 273']
};
let updated=[];
for(const [id,[variant,reason]] of Object.entries(changes)){
 const f=path.join(root,'gabc/hymns/gregobase-liber',`gb-${id}.gabc`);
 let s=fs.readFileSync(f,'utf8');
 if(!/^hour:/m.test(s)) s=`hour: Invitatorium;\n${s}`;
 if(!/^variant:/m.test(s)) s=`variant: ${variant};\n${s}`;
 if(!/^classification-method:/m.test(s)) s=`classification-method: pdf-review-round8;\n${s}`;
 fs.writeFileSync(f,s);
 updated.push({file:`gb-${id}.gabc`,variant,reason});
}
fs.writeFileSync(path.join(root,'data/pdf-review-round8.json'),JSON.stringify(updated,null,2)+'\n');
console.log('Assigned',updated.length,'invitatory scores');
