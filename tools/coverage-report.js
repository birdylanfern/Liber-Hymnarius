/* Report which Liber Hymnarius taxonomy slots have local GABC transcriptions. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/index.json'), 'utf8'));
const entries = data.hymns || [];
const groups = [];
function visit(nodes, trail) {
  for (const node of nodes) {
    const here = [...trail, node.label];
    if (node.slots && node.slots.length) {
      const slots = node.slots.map(s => ({
        hour: s.label, variant: s.variant || '',
        present: entries.some(e => e.cat === node.id && (e.slot === s.key || (e.hour === s.hour && !s.variant && !e.variant)))
      }));
      groups.push({ section: here.join(' / '), id: node.id, total: slots.length,
        present: slots.filter(s => s.present).length, missing: slots.filter(s => !s.present) });
    }
    if (node.kids) visit(node.kids, here);
  }
}
visit(data.tree, []);
const total = groups.reduce((a,g)=>a+g.total,0);
const present = groups.reduce((a,g)=>a+g.present,0);
const lines = [
  '# Liber Hymnarius — transcription coverage', '',
  `Original GABC files indexed: **${entries.filter(e => !e.unchecked).length}**; provisional slot references: **${entries.filter(e => e.unchecked).length}**`,
  `Taxonomy hour/variant slots populated: **${present} / ${total}**`, '',
  '**WARNING:** UNCHECKED entries are speculative placements, sometimes borrowed from other seasons or hours. Populated slots do not establish liturgical correctness. Verify each placement against the book.', '',
  '## Missing slots', ''
];
for (const g of groups) if (g.missing.length) {
  lines.push(`### ${g.section}`, '', ...g.missing.map(s => `- ${s.hour}${s.variant ? ' — ' + s.variant : ''}`), '');
}
fs.writeFileSync(path.join(root, 'COVERAGE.md'), lines.join('\n'));
console.log(`Coverage: ${present}/${total} slots, ${entries.length} GABC entries; see COVERAGE.md`);
