#!/usr/bin/env node
/** Import every score explicitly listed under GregoBase's Liber Hymnarius (1983) source.
 * Requires network access. Safe to rerun; existing local scores are never overwritten.
 * node tools/sync-gregobase-liber.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const origin = 'https://gregobase.selapa.net';
const dry = process.argv.includes('--dry-run');
const decode = s => s.replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_,n)=>String.fromCodePoint(+n)).replace(/&(?:aacute|eacute|iacute|oacute|uacute|aelig|AElig);/g, m=>({'&aacute;':'á','&eacute;':'é','&iacute;':'í','&oacute;':'ó','&uacute;':'ú','&aelig;':'æ','&AElig;':'Æ'})[m]).replace(/<[^>]+>/g,'').trim();
const fold = s => String(s).toLowerCase().replace(/æ/g,'ae').replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const pause = ms => new Promise(r=>setTimeout(r,ms));
async function get(url) {
  for(let n=0;n<3;n++) {
    try { const r=await fetch(url,{headers:{'User-Agent':'LiberHymnariusCatalog/1.0 (source-attributed research import)'}}); if(!r.ok)throw Error(`${r.status} ${url}`);return await r.text(); }
    catch(e) { if(n===2)throw e; await pause(800*(n+1)); }
  }
}
function sourceEntries(html) {
  // Page number is the table's first column; collect every linked chant, including variants.
  const entries=[];
  const rows=html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)||[];
  for(const row of rows) {
    const cells=row.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi)||[];
    if(cells.length<2)continue;
    const page=Number(decode(cells[0]).match(/\d+/)?.[0]);
    const links=[...cells.slice(1).join('').matchAll(/<a\b[^>]*href=["']([^"']*chant\.php\?[^"']*\bid=(\d+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    for(const m of links)entries.push({id:m[2],page:Number.isFinite(page)?page:null,title:decode(m[3])});
  }
  // Site markup can change; fail rather than silently importing an incomplete source.
  if(entries.length<100)throw Error(`Only ${entries.length} source entries detected; source page structure may have changed`);
  return [...new Map(entries.map(e=>[e.id,e])).values()];
}
function headerOf(text) { const h={}; for(const m of text.split(/^%%\s*$/m)[0].matchAll(/^([\w-]+)\s*:\s*(.*?);?\s*$/gm))h[m[1].toLowerCase()]=m[2].replace(/;$/,'').trim();return h; }
function existingIndex() {try{return JSON.parse(fs.readFileSync(path.join(root,'data/index.json'),'utf8')).hymns;}catch{return [];}}
async function main(){
  const html=await get(`${origin}/source.php?id=15`);
  const entries=sourceEntries(html);
  const existing=existingIndex();
  const byName=new Map();
  for(const e of existing){const k=fold(e.name);if(e.cat){const arr=byName.get(k)||[];arr.push(e);byName.set(k,arr);}}
  const dest=path.join(root,'gabc/hymns/gregobase-liber');
  fs.mkdirSync(dest,{recursive:true});
  const report={source:`${origin}/source.php?id=15`,sourceCount:entries.length,downloaded:[],alreadyPresent:[],failed:[]};
  for(let i=0;i<entries.length;i++){
    const e=entries[i],file=path.join(dest,`gb-${e.id}.gabc`);
    if(fs.existsSync(file)){report.alreadyPresent.push(e.id);continue;}
    if(dry){report.downloaded.push({id:e.id,title:e.title,page:e.page,dryRun:true});continue;}
    try{
      const gabc=await get(`${origin}/download.php?elem=1&format=gabc&id=${e.id}`);
      if(!/^%%\s*$/m.test(gabc)||!/\([a-mA-M][^)]*\)/.test(gabc))throw Error('Invalid or empty GABC');
      const matches=byName.get(fold(e.title))||[];
      const uniqueCats=[...new Set(matches.map(x=>x.cat))];
      const cat=uniqueCats.length===1?uniqueCats[0]:'';
      const uniqueHours=[...new Set(matches.filter(x=>x.cat===cat).map(x=>x.hour).filter(Boolean))];
      const hour=uniqueHours.length===1?uniqueHours[0]:'';
      const prefix=`provenance: gregobase-liber;\nsource: ${origin}/chant.php?id=${e.id};\nliber-page: ${e.page||''};\n${cat?`category: ${cat};\n`:''}${hour?`hour: ${hour};\n`:''}commentary: GregoBase transcription indexed under Liber Hymnarius (1983); not independently checked against the scan;\n`;
      fs.writeFileSync(file,prefix+gabc);
      report.downloaded.push({id:e.id,title:e.title,page:e.page,category:cat||null,hour:hour||null});
    }catch(err){report.failed.push({id:e.id,title:e.title,error:String(err)});}
    if((i+1)%20===0)console.log(`${i+1}/${entries.length} checked`);
    await pause(120);
  }
  fs.writeFileSync(path.join(root,'data/gregobase-liber-sync.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`Source entries ${entries.length}; newly imported ${report.downloaded.length}; already present ${report.alreadyPresent.length}; failed ${report.failed.length}`);
  if(report.failed.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
