#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const assignments={
 'gb-7424':['v',''],
 'gb-8225':['inv','in dominica'],
 'gb-8226':['inv','in feriis'],
 'gb-16423':['c',''],
 'gb-8227':['ol',''],
 'gb-20362':['l',''],
 'gb-18010':['t',''],
 'gb-18012':['s',''],
 'gb-18015':['n','']
};
for(const [id,[hour,variant]] of Object.entries(assignments)){
 const file=path.join(__dirname,'..','gabc','hymns','gregobase-liber',id+'.gabc');
 if(!fs.existsSync(file))throw Error('Missing '+file);
 let s=fs.readFileSync(file,'utf8');
 if(!s.includes('%%'))throw Error('Invalid GABC '+file);
 s=s.replace(/^category:.*\r?\n/gm,'').replace(/^hour:.*\r?\n/gm,'').replace(/^variant:.*\r?\n/gm,'');
 s=`category: adventus-ante16;\nhour: ${hour};\n${variant?'variant: '+variant+';\n':''}`+s;
 fs.writeFileSync(file,s);
 console.log(id,hour,variant);
}
