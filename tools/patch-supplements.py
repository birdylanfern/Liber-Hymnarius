from pathlib import Path
p=Path('/mnt/data/lh-final/app.js');s=p.read_text();s=s.replace('  var invitatoryPsalmPromise = null;','  var verseSupplementPromise = null;\n  function getVerseSupplements() {\n    if (!verseSupplementPromise) verseSupplementPromise = fetch("data/verse-supplements.json").then(function(r) { if (!r.ok) throw Error("Verse comparisons unavailable"); return r.json(); });\n    return verseSupplementPromise;\n  }\n  var invitatoryPsalmPromise = null;')
needle='''        if (other) {
          var link = make('a', { href: hrefFor(other) }, 'Compare another transcription of this hymn');
          el.provenance.appendChild(link);
        }
'''
replacement=needle+'''        // Show source-backed additional stanzas as comparison text only. Never
        // silently append a different melody's verses to this GABC score.
        if (/hymn/i.test(entry.part || '')) getVerseSupplements().then(function(all) {
          if (state.current !== entry.id || !all[entry.id]) return;
          var candidate = all[entry.id];
          var panel = make('details', { 'class': 'verse-comparison' });
          panel.appendChild(make('summary', null, 'Additional verses in another transcription (' + candidate.stanzas + ' stanzas)'));
          panel.appendChild(make('p', { 'class': 'verse-warning' }, candidate.note));
          panel.appendChild(make('pre', { 'class': 'verse-comparison-text' }, candidate.comparisonText));
          if (candidate.sourceUrl) panel.appendChild(make('a', { href: candidate.sourceUrl, target: '_blank', rel: 'noopener' }, 'View comparison source on GregoBase'));
          el.provenance.appendChild(panel);
        }).catch(function() {});
'''
assert needle in s;s=s.replace(needle,replacement);p.write_text(s)
p=Path('/mnt/data/lh-final/theme.css');p.write_text(p.read_text()+'''\n.verse-comparison { margin: 1rem 0; padding: .75rem 1rem; border: 1px solid currentColor; border-radius: .4rem; }\n.verse-comparison summary { cursor: pointer; font-weight: 700; }\n.verse-comparison-text { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; line-height: 1.7; }\n''')
