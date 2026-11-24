const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const rows = fs.readFileSync(path.join(root, 'data/venite-printed-pairings.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
const tones = JSON.parse(fs.readFileSync(path.join(root, 'data/invitatory-psalm-tone-sources.json'), 'utf8')).tones;
let problems = [];
for (const line of rows) {
  // The CSV contains quoted commas in the antiphon column; parse from the right.
  const parts = line.match(/(?:"(?:[^"]|"")*"|[^,])+/g) || [];
  if (parts.length !== 8) { problems.push('Malformed CSV: ' + line.slice(0,60)); continue; }
  const id = parts[1], file = parts[6];
  if (!app.includes(JSON.stringify(id) + ': {')) problems.push('Not in runtime: ' + id);
  if (!fs.existsSync(path.join(root,file))) problems.push('Missing score: ' + file);
  if (!tones.some(t => t.file === file)) problems.push('Missing selector score: ' + file);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('PASS: ' + rows.length + ' documented mappings resolve in runtime, selector and filesystem.');
