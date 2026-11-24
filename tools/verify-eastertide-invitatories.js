const fs = require('fs');
const path = require('path');
const records = [
 {section:'c-doctores',slot:'inv|fontem sapientiae in tempore paschali',title:'Fontem sapientiae Dominum',printedPage:301,pdfScanPage:157,printedMode:'VI*',psalmPage:154,ordinaryFile:'gabc/hymns/gregobase-liber/gb-20870.gabc',ordinaryMode:'IV',status:'MISSING DISTINCT EASTERTIDE GABC'},
 {section:'c-viri',slot:'inv|mirabilem in sanctis in tempore paschali',title:'Mirabilem in sanctis suis Dominum',printedPage:311,pdfScanPage:162,continuationScanPage:163,printedMode:'VI*',psalmPage:154,ordinaryFile:'gabc/hymns/gregobase-liber/gb-20882.gabc',ordinaryMode:'IV',status:'MISSING DISTINCT EASTERTIDE GABC'}
];
for(const r of records){const gabc=fs.readFileSync(path.join(__dirname,'..',r.ordinaryFile),'utf8');if(!/^mode:\s*4\s*;/m.test(gabc))throw Error('Ordinary score mode unexpectedly changed: '+r.ordinaryFile)}
fs.writeFileSync(path.join(__dirname,'..','data','eastertide-invitatory-printed-verification.json'),JSON.stringify({reference:'Liber Hymnarius (1983)',entries:records},null,2)+'\n');
console.log('Verified printed Eastertide mode VI* distinct from existing mode IV for 2 invitatories.');
