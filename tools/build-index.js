#!/usr/bin/env node
// Scans gabc/simplex and gabc/hymns (recursively) and writes data/index.json,
// which the site loads to list, filter and search the chants.
//
//   node tools/build-index.js
//
// Each .gabc file's header is read for: name, office-part, mode, book, commentary,
// and these optional fields used for browsing:
//   category:  (hymns) id of a node in tools/taxonomy.js, e.g. adventus-ante16 (run tools/list-categories.js)
//   hour:      (hymns) e.g. Vesperae, Laudes, Officium lectionis, Invitatorium, Completorium …
//   variant:   (hymns) optional, e.g. noctu, "in officio feriali", "pro uno pastore"
//   season:    e.g. Adventus, Nativitas, Quadragesima, Tempus Paschale, Per annum, Communia
//   occasion:  e.g. "Dominica I Adventus", "S. Ioseph"
//   number:    e.g. GS 23 (Graduale Simplex page/number) – used for ordering
//   meter:     (hymns) e.g. 8888
//   annotation: up to two lines shown above the drop cap (e.g. "Hymn" then "4"); used as written
// Free text *before* the header is also understood (the liberhymnarius.org style):
//   Usque ad diem 16 Decembris            → note (shown under the title)
//   * [Ad Vesperas](https://…)            → hour (here "Vesperae") and a source link
// Anything missing is simply left out; the site adapts its filters to what is present.

const fs = require('fs');
const path = require('path');

const taxonomy = require('./taxonomy');

const root = path.join(__dirname, '..');
const collections = { simplex: 'gabc/simplex', hymns: 'gabc/hymns' };

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.gabc$/i.test(entry.name) ? [full] : [];
  });
}

function parseHeader(text) {
  const split = text.search(/^%%\s*$/m);
  const headerText = split < 0 ? '' : text.slice(0, split);
  const body = split < 0 ? text : text.slice(text.indexOf('\n', split) + 1);
  const header = {}, annotations = [], notes = [];
  // "key: value;" – a value can't contain a semicolon; the key is case-insensitive
  const kv = /^([A-Za-z][\w-]*)\s*:\s*(.*?)\s*;?$/;
  headerText.split('\n').forEach(raw => {
    const line = raw.trim();
    if (!line) return;
    const m = kv.exec(line);
    if (m) {
      const key = m[1].toLowerCase();
      if (key === 'annotation') annotations.push(m[2].trim());
      else header[key] = m[2].trim();
      return;
    }
    const link = /^[*-]\s*\[([^\]]+)\]\(([^)\s]+)\)\s*$/.exec(line);   // "* [Ad Vesperas](url)"
    if (link) {
      if (!header.hour) header.hour = link[1].trim();
      if (!header.source) header.source = link[2];
      return;
    }
    notes.push(line.replace(/^[*-]\s+/, ''));
  });
  if (notes.length && !header.note) header.note = notes.join(' · ');
  return { header, annotations, body };
}

// the lyrics only: no notes, tags or markup
function lyrics(body) {
  return body
    .replace(/<sp>'?(ae|AE|Ae|æ|Æ)<\/sp>/g, 'æ').replace(/<sp>'?(oe|OE|Oe|œ|Œ)<\/sp>/g, 'œ')   // s<sp>'ae</sp>culum
    .replace(/\([^)]*\)/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\\[a-z]+\{[^}]*\}/gi, '')
    .replace(/[{}^_*†~|%]/g, '')
    .replace(/\b\d+\.?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// lowercase, no accents, æ→ae, œ→oe, j→i, v→u, so that "Jesu" finds "Iesu" and "Dóminus" finds "dominus"
function fold(s) {
  return s.toLowerCase()
    .replace(/[æǽ]/g, 'ae').replace(/[œ]/g, 'oe')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/j/g, 'i').replace(/v/g, 'u')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const natural = (a, b) => a.localeCompare(b, 'la', { numeric: true, sensitivity: 'base' });

// ---- hymn categories ----
// A hymn's category is, in order: its `category:` header (an id from tools/taxonomy.js, or the exact label),
// a folder of that name above it (gabc/hymns/adventus-ante16/…), or a note before the header that is exactly
// one category's label (the liberhymnarius.org files say e.g. "Usque ad diem 16 Decembris").
const labelsFolded = {};
Object.values(taxonomy.byId).forEach(n => { (labelsFolded[taxonomy.fold(n.label)] = labelsFolded[taxonomy.fold(n.label)] || []).push(n.id); });
function findCategory(header, relPath) {
  const c = (header.category || '').trim();
  if (c) {
    if (taxonomy.byId[c]) return c;
    const hit = labelsFolded[taxonomy.fold(c)];
    if (hit && hit.length === 1) return hit[0];
    warn(relPath + ': unknown category "' + c + '"');
    return '';
  }
  const folders = relPath.split('/').slice(0, -1).reverse();
  for (const f of folders) if (taxonomy.byId[f]) return f;
  const byNote = labelsFolded[taxonomy.fold(header.note || '')];
  return byNote && byNote.length === 1 ? byNote[0] : '';
}
const warnings = [];
function warn(msg) { warnings.push(msg); }

const index = { generated: new Date().toISOString(), hours: taxonomy.HOURS, tree: taxonomy.tree, simplex: [], hymns: [] };

for (const [key, dir] of Object.entries(collections)) {
  for (const file of walk(path.join(root, dir))) {
    const rel = path.relative(path.join(root, 'gabc'), file).split(path.sep).join('/');
    const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const { header, annotations, body } = parseHeader(text);
    const lyr = lyrics(body);
    // no name: → the first phrase of the text, e.g. "Conditor alme síderum"
    const first = lyr.split(/[,;:.!?]/)[0].trim().split(' ').slice(0, 5).join(' ').toLowerCase();
    const name = header.name || (first ? first.charAt(0).toUpperCase() + first.slice(1) :
      path.basename(file, '.gabc').replace(/[-_]+/g, ' '));
    let cat = '', hour = '', variant = '', slot = '';
    if (key === 'hymns') {
      cat = findCategory(header, rel);
      hour = header.hour ? taxonomy.hourKey(header.hour) : '';
      if (header.hour && !hour) warn(rel + ': unknown hour "' + header.hour + '"');
      variant = header.variant || '';
      if (cat && hour) {
        const slots = taxonomy.byId[cat].slots || [];
        const exact = slots.find(x => x.key === taxonomy.slotKey(hour, variant));
        const loose = slots.filter(x => x.hour === hour);
        slot = exact ? exact.key : (loose.length === 1 && (!variant || !loose[0].variant) ? loose[0].key : '');
        if (!slot && !variant && loose.length > 1) warn(rel + ': "' + header.hour + '" has several variants in "' + cat + '"; add a variant: field');
        if (!slots.some(x => x.hour === hour)) warn(rel + ': "' + cat + '" has no ' + header.hour + ' slot (listed there anyway)');
      }
    }
    let psalmLyrics = '';
    const psalmPath = (header.psalm || '').trim();
    if (psalmPath) {
      const fullPsalm = path.join(root, psalmPath);
      if (fs.existsSync(fullPsalm)) {
        const psText = fs.readFileSync(fullPsalm, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
        const psParsed = parseHeader(psText);
        psalmLyrics = [psParsed.header.name, psParsed.header['text-right'], lyrics(psParsed.body)].filter(Boolean).join(' ');
      } else {
        warn(rel + ': missing psalm file "' + psalmPath + '"');
      }
    }
    index[key].push({
      id: rel.replace(/\.gabc$/i, ''),
      file: 'gabc/' + rel,
      psalm: psalmPath,
      name,
      part: header['office-part'] || '',
      mode: header.mode || '',
      book: header.book || '',
      season: header.season || '',
      cat, hour, variant, slot,
      unchecked: header['classification-status'] === 'unchecked',
      uncheckedReason: header['classification-status'] === 'unchecked' ? (header.commentary || 'Liturgical assignment or musical setting not yet verified') : '',
      occasion: header.occasion || '',
      number: header.number || '',
      meter: header.meter || '',
      note: header.note || '',
      source: /^https?:\/\//i.test(header.source || '') ? header.source : '',
      provenance: ['gregobase', 'gregobase-liber'].includes((header.provenance || '').toLowerCase()) ? (header.provenance || '').toLowerCase() : 'local',
      liberPage: Number(header['liber-page']) || null,
      annotations: annotations.slice(0, 2),
      commentary: header.commentary || '',
      incipit: lyr.split(' ').slice(0, 8).join(' '),
      search: fold([name, header.occasion, header.season, header.note, header.number, header.hour, header.variant, cat && taxonomy.byId[cat].label, lyr, psalmLyrics].filter(Boolean).join(' '))
    });
  }
  index[key].sort((a, b) => natural(a.number || '\uffff', b.number || '\uffff') || natural(a.name, b.name));
}

// Explicit, reversible provisional references to an existing GABC score.
// These are not additional transcriptions or verified liturgical assignments.
const aliasPath = path.join(root, 'data/provisional-slot-aliases.json');
if (fs.existsSync(aliasPath)) {
  const aliases = JSON.parse(fs.readFileSync(aliasPath, 'utf8'));
  for (const [i, a] of aliases.entries()) {
    const original = index.hymns.find(h => h.file === a.file);
    if (!original) { warn('provisional alias missing source: ' + a.file); continue; }
    const valid = (taxonomy.byId[a.category]?.slots || []).some(s => s.key === a.slot);
    if (!valid) { warn('provisional alias invalid slot: ' + a.category + '/' + a.slot); continue; }
    if (index.hymns.some(h => h.cat === a.category && h.slot === a.slot)) continue;
    index.hymns.push({ ...original, id: original.id + '--provisional-' + i,
      cat: a.category, hour: a.hour, variant: a.variant, slot: a.slot,
      unchecked: true, uncheckedReason: a.reason,
      note: [original.note, 'PROVISIONAL CROSS-REFERENCE: same score reused; rubric unverified'].filter(Boolean).join(' | '),
      search: original.search + ' ' + a.variant + ' provisional unchecked' });
  }
}

fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data/index.json'), JSON.stringify(index));
warnings.forEach(w => console.warn('warning: ' + w));
console.log(`Indexed ${index.simplex.length} Graduale Simplex chants and ${index.hymns.length} hymns → data/index.json`);
