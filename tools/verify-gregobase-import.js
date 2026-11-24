#!/usr/bin/env node
/** Reconcile saved GregoBase sync results with the files actually on disk. */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const syncPath=path.join(root,'data/gregobase-liber-sync.json');
const report=JSON.parse(fs.readFileSync(syncPath,'utf8'));
const dir=path.join(root,'gabc/hymns/gregobase-liber');
const ids=new Set(fs.readdirSync(dir).filter(x=>/^gb-\d+\.gabc$/.test(x)).map(x=>x.match(/\d+/)[0]));
const problems=[];
for(const id of ids){const file=path.join(dir,`gb-${id}.gabc`),txt=fs.readFileSync(file,'utf8');if(!/^%%\s*$/m.test(txt)||!/(?:\([a-mA-M][^)]*\))/.test(txt))problems.push({id,issue:'invalid gabc'});}
const historicalFailures=(report.failed||[]).map(e=>({...e,resolved:ids.has(String(e.id))}));
const resolved=historicalFailures.filter(x=>x.resolved);
const outstanding=historicalFailures.filter(x=>!x.resolved);
const result={physicalGregobaseFiles:ids.size,invalidFiles:problems,previousFailuresResolved:resolved,previousFailuresOutstanding:outstanding,sourceCountFromLastSync:report.sourceCount,notes:'Last-sync source count is historical, not a fresh remote check. This report does not certify musical or liturgical accuracy.'};
fs.writeFileSync(path.join(root,'data/gregobase-import-health.json'),JSON.stringify(result,null,2)+'\n');
console.log(`GregoBase files: ${ids.size}; invalid: ${problems.length}; historical failures now resolved: ${resolved.length}; outstanding: ${outstanding.length}`);
if(problems.length)process.exitCode=1;
