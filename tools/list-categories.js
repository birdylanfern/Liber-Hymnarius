#!/usr/bin/env node
// Prints the hymn category tree with the ids to use in `category:` headers.
//   node tools/list-categories.js            everything
//   node tools/list-categories.js advent     only lines containing "advent"
const { tree, HOURS } = require('./taxonomy');
const want = (process.argv[2] || '').toLowerCase();
const lines = [];
(function walk(nodes, depth) {
  nodes.forEach(n => {
    const slots = n.slots && n.slots.length ? '   [' + n.slots.map(s => (s.paren ? '(' : '') + s.label + (s.variant ? ': ' + s.variant : '') + (s.paren ? ')' : '')).join(', ') + ']' : '';
    lines.push('  '.repeat(depth) + n.id.padEnd(Math.max(1, 26 - depth * 2)) + ' ' + n.label + slots);
    if (n.kids) walk(n.kids, depth + 1);
  });
})(tree, 0);
console.log(lines.filter(l => !want || l.toLowerCase().includes(want)).join('\n'));
if (!want) console.log('\nhour: ' + HOURS.map(h => h[1]).join(' | '));
