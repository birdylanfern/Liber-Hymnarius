#!/usr/bin/env node
// Import a locally downloaded GregoBase GABC, without overwriting existing scores.
// Usage: node tools/import-gregobase.js /path/to/score.gabc CATEGORY HOUR GREGObase_ID [VARIANT]
const fs = require('fs');
const path = require('path');
const taxonomy = require('./taxonomy');
const [input, category, hour, id, variant = ''] = process.argv.slice(2);
if (!input || !category || !hour || !/^\d+$/.test(id || '') || !taxonomy.byId[category]) {
  console.error('Usage: node tools/import-gregobase.js SCORE.gabc CATEGORY_ID HOUR GREGObase_NUMERIC_ID [VARIANT]');
  process.exit(1);
}
const source = fs.readFileSync(input, 'utf8');
if (!/^%%\s*$/m.test(source) || !/\([a-mA-M][^)]*\)/.test(source)) throw Error('Input does not look like a valid GABC score');
const header = `category: ${category};\nhour: ${hour};\n${variant ? `variant: ${variant};\n` : ''}provenance: gregobase;\nsource: https://gregobase.selapa.net/chant.php?id=${id};\ncommentary: Supplementary GregoBase transcription; not verified against Liber Hymnarius (1983);\n`;
const dest = path.join(__dirname, '..', 'gabc', 'hymns', 'gregobase', `gb-${id}--${category}.gabc`);
if (fs.existsSync(dest)) throw Error('Already imported: ' + dest);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, header + source);
console.log('Imported ' + dest + '\nRun npm run build to refresh the site index.');
