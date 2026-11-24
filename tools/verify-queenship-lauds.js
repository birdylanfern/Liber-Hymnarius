const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '../gabc/hymns/gregobase-liber/gb-19273.gabc');
let content = fs.readFileSync(target, 'utf8');
if (!/^category: s-08-22;$/m.test(content)) throw Error('Unexpected category');
if (!/^liber-page: 420;$/m.test(content)) throw Error('Unexpected source page');
if (!/^name:O quam glorifica;$/m.test(content)) throw Error('Unexpected hymn');
if (!/^hour: l;$/m.test(content)) {
  if (/^hour:/m.test(content)) throw Error('Conflicting hour');
  content = content.replace(/^category: s-08-22;$/m, 'category: s-08-22;\nhour: l;\nclassification-method: printed-rubric-p420;\nclassification-status: unchecked;');
  fs.writeFileSync(target, content);
}
console.log('Queenship Lauds: O quam glorifica, p. 420; score comparison remains unchecked.');
