/* Cantus: Hymni Liturgiae Horarum & Graduale Simplex.
 * Browses data/index.json (built by tools/build-index.js) and renders each chant's GABC with exsurge.
 * The hymns are organised by the category tree in tools/taxonomy.js (the Liber Hymnarius contents). */
(function () {
  'use strict';

  var COLLECTIONS = {
    hymns: { label: 'Officium', folder: 'gabc/hymns' },
    simplex: {
      label: 'Graduale Simplex',
      folder: 'gabc/simplex',
      group: 'season',
      filters: [{ key: 'season', label: 'Tempus', order: 'season' }, { key: 'part', label: 'Pars', order: 'part' }]
    }
  };
  var DEFAULT_COLLECTION = 'hymns';

  // what the five sections hold, for the front page
  var CAPTIONS = {
    tempore: 'Advent, Christmas, Lent, Easter and the Sollemnities of the Lord',
    sanctis: 'Feasts and memorials of the saints, month by month',
    communia: 'Dedication, Our Lady, Apostles, Martyrs, Pastors, Doctors, Virgins, Defunct…',
    'per-annum': 'Ordinary Time: the four-week psalter, Sunday to Saturday',
    alia: 'Te Deum and other hymns'
  };
  var HOUR_SHORT = { inv: 'Inv.', vig: 'Vig.', ol: 'Lect.', l: 'Laud.', hm: 'Med.', t: 'Tert.', s: 'Sext.', n: 'Non.', v: 'Vesp.', c: 'Compl.' };
  // which stored hours a filter chip stands for (a hymn for "Laudes et Vesperae" turns up under both)
  var HOUR_GROUP = { inv: ['inv'], vig: ['vig', 'vv'], ol: ['ol', 'olv'], l: ['l', 'lv'], hm: ['hm'], t: ['t'], s: ['s'], n: ['n'],
    v: ['v1', 'v', 'v2', 'v12', 'lv', 'olv', 'vv'], c: ['c'] };
  var KICKER = { inv: 'Ad Invitatorium', vig: 'Ad Vigilias', ol: 'Ad Officium lectionis', l: 'Ad Laudes matutinas', hm: 'Ad Horam mediam',
    t: 'Ad Tertiam', s: 'Ad Sextam', n: 'Ad Nonam', v1: 'Ad I Vesperas', v: 'Ad Vesperas', v2: 'Ad II Vesperas', c: 'Ad Completorium',
    lv: 'Ad Laudes et Vesperas', olv: 'Ad Officium lectionis et Vesperas', v12: 'Ad I et II Vesperas', vv: 'Ad Vigilias et Vesperas' };
  var SCALES = [0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75];

  // keywords (lowercase) used to put seasons and parts of the Graduale Simplex in liturgical rather than alphabetical order
  var ORDERS = {
    season: [['advent'], ['nativ', 'natal', 'christmas'], ['epiph', 'baptis'], ['quadrag', 'lent'], ['triduum', 'passion', 'hebdomad'],
      ['pasch', 'easter'], ['pentecost'], ['per annum', 'ordinary'], ['sanct', 'saint'], ['commun']],
    part: [['introit'], ['gradual', 'responsor'], ['alleluia', 'tract'], ['offert'], ['commun'], ['antiph']]
  };

  var PART_ABBREV = { introitus: 'Intr.', graduale: 'Grad.', alleluia: 'All.', tractus: 'Tract.', offertorium: 'Off.',
    communio: 'Comm.', responsorium: 'Resp.', antiphona: 'Ant.', hymnus: 'Hymn' };
  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  var index = { simplex: [], hymns: [] };
  var tree = [], nodes = {}, hourNames = {}, hourOrder = [];
  var UNSORTED = { id: 'unsorted', label: 'Unclassified GregoBase chants · review needed', depth: 0, entries: [], virtual: true };
  var state = { view: '', collection: DEFAULT_COLLECTION, q: '', filters: {}, hour: '', hideEmpty: false, open: {}, current: null, cat: null, scale: 1 };
  var visible = [];            // chants in the order they are listed (what Prev / Next walk through)
  var gabcCache = {};
  var verseSupplementPromise = null;
  function getVerseSupplements() {
    if (!verseSupplementPromise) verseSupplementPromise = fetch("data/verse-supplements.json").then(function(r) { if (!r.ok) throw Error("Verse comparisons unavailable"); return r.json(); });
    return verseSupplementPromise;
  }
  // Explicit Liber Hymnarius Psalm 94 cross-references only. Never infer a tone
  // solely from the antiphon's mode; the book contains distinct variants.
  var VERIFIED_VENITE_REFERENCES = {
      "hymns/gregobase-liber/gb-8225": {
          "label": "Tonus V",
          "file": "gabc/hymns/gregobase-liber/gb-10248.gabc",
          "printedPage": 146
      },
      "hymns/gregobase-liber/gb-8226": {
          "label": "Tonus VI",
          "file": "gabc/hymns/gregobase-liber/gb-9664.gabc",
          "printedPage": 149
      },
      "hymns/gregobase-liber/gb-19798": {
          "label": "Tonus IV*",
          "file": "gabc/common/ps--venite_exsultemus_94--4.gabc",
          "printedPage": 141
      },
      "hymns/gregobase-liber/gb-19799": {
          "label": "Tonus VI",
          "file": "gabc/hymns/gregobase-liber/gb-9664.gabc",
          "printedPage": 149
      },
      "hymns/gregobase-liber/gb-8699": {
          "label": "Tonus II",
          "file": "gabc/hymns/gregobase-liber/gb-8218.gabc",
          "printedPage": 133
      },
      "hymns/gregobase-liber/gb-19801": {
          "label": "Tonus V",
          "file": "gabc/hymns/gregobase-liber/gb-10248.gabc",
          "printedPage": 146
      },
      "hymns/gregobase-liber/gb-15366": {
          "label": "Tonus V",
          "file": "gabc/hymns/gregobase-liber/gb-10248.gabc",
          "printedPage": 146
      },
      "hymns/gregobase-liber/gb-10363": {
          "label": "Tonus VII",
          "file": "gabc/hymns/gregobase-liber/gb-9834.gabc",
          "printedPage": 160
      },
      "hymns/christum-dominum-passum-user-supplied": {
          "label": "Tonus IV*",
          "file": "gabc/common/ps--venite_exsultemus_94--4.gabc",
          "printedPage": 141
      },
      "hymns/cor-iesu-invitatory-user-supplied": {
          "label": "Tonus IV*",
          "file": "gabc/common/ps--venite_exsultemus_94--4.gabc",
          "printedPage": 141
      },
      "hymns/gregobase-liber/gb-15595": {
          "label": "Tonus E",
          "file": "gabc/hymns/gregobase-liber/gb-9642.gabc",
          "printedPage": 168
      },
      "hymns/gregobase-liber/gb-4666": {
          "label": "Tonus VI",
          "file": "gabc/hymns/gregobase-liber/gb-9664.gabc",
          "printedPage": 149
      },
      "hymns/gregobase-liber/gb-15596": {
          "label": "Tonus E",
          "file": "gabc/hymns/gregobase-liber/gb-9642.gabc",
          "printedPage": 168
      },
      "hymns/gregobase-liber/gb-15597": {
          "label": "Tonus VI",
          "file": "gabc/hymns/gregobase-liber/gb-9664.gabc",
          "printedPage": 149
      },
      "hymns/gregobase-liber/gb-15598": {
          "label": "Tonus E",
          "file": "gabc/hymns/gregobase-liber/gb-9642.gabc",
          "printedPage": 168
      },
      "hymns/gregobase-liber/gb-15599": {
          "label": "Tonus E",
          "file": "gabc/hymns/gregobase-liber/gb-9642.gabc",
          "printedPage": 168
      },
      "hymns/gregobase-liber/gb-15600": {
          "label": "Tonus D",
          "file": "gabc/hymns/gregobase-liber/gb-9707.gabc",
          "printedPage": 165
      },
      "hymns/gregobase-liber/gb-20911": {
          "label": "Tonus V",
          "file": "gabc/hymns/gregobase-liber/gb-10248.gabc",
          "printedPage": 146
      },
      "hymns/gregobase-liber/gb-20913": {
          "label": "Tonus II",
          "file": "gabc/hymns/gregobase-liber/gb-8218.gabc",
          "printedPage": 133
      },
      "hymns/gregobase-liber/gb-20912": {
          "label": "Tonus VI*",
          "file": "gabc/hymns/gregobase-liber/gb-10035.gabc",
          "printedPage": 154
      },
      "hymns/gregobase-liber/gb-7270": {
          "label": "Tonus IV*",
          "file": "gabc/common/ps--venite_exsultemus_94--4.gabc",
          "printedPage": 141
      },
      "hymns/gregobase-liber/gb-7276": {
          "label": "Tonus E",
          "file": "gabc/hymns/gregobase-liber/gb-9642.gabc",
          "printedPage": 168
      },
      "hymns/gregobase-liber/gb-16425": {
          "label": "Tonus IV",
          "file": "gabc/hymns/gregobase-liber/gb-15508.gabc",
          "printedPage": 138
      },
      "hymns/gregobase-liber/gb-7281": {
          "label": "Tonus IV",
          "file": "gabc/hymns/gregobase-liber/gb-15508.gabc",
          "printedPage": 138
      },
      "hymns/gregobase-liber/gb-18100": {
          "label": "Tonus IV*",
          "file": "gabc/common/ps--venite_exsultemus_94--4.gabc",
          "printedPage": 141
      },
      "hymns/gregobase-liber/gb-19800": {
          "label": "Tonus E",
          "file": "gabc/hymns/gregobase-liber/gb-9642.gabc",
          "printedPage": 168
      },
      "hymns/gregobase-liber/gb-19803": {
          "label": "Tonus VII",
          "file": "gabc/hymns/gregobase-liber/gb-9834.gabc",
          "printedPage": 160
      },
      "hymns/gregobase-liber/gb-7290": {
          "label": "Tonus VI*",
          "file": "gabc/hymns/gregobase-liber/gb-10035.gabc",
          "printedPage": 154
      },
      "hymns/gregobase-liber/gb-15456": {
          "label": "Tonus IV",
          "file": "gabc/hymns/gregobase-liber/gb-15508.gabc",
          "printedPage": 138
      },
      "hymns/gregobase-liber/gb-16103": {
          "label": "Tonus VII",
          "file": "gabc/hymns/gregobase-liber/gb-9834.gabc",
          "printedPage": 160
      },
      "hymns/gregobase-liber/gb-10398": {
          "label": "Tonus III",
          "file": "gabc/hymns/gregobase-liber/gb-10397.gabc",
          "printedPage": 135
      },
      "hymns/gregobase-liber/gb-16675": {
          "label": "Tonus IV*",
          "file": "gabc/common/ps--venite_exsultemus_94--4.gabc",
          "printedPage": 141
      },
      "hymns/gregobase-liber/gb-20880": {
          "label": "Tonus VI*",
          "file": "gabc/hymns/gregobase-liber/gb-10035.gabc",
          "printedPage": 154
      },
      "hymns/gregobase-liber/gb-10558": {
          "label": "Tonus IV*",
          "file": "gabc/common/ps--venite_exsultemus_94--4.gabc",
          "printedPage": 141
      },
      "hymns/gregobase-liber/gb-20901": {
          "label": "Tonus E",
          "file": "gabc/hymns/gregobase-liber/gb-9642.gabc",
          "printedPage": 168
      },
      "hymns/gregobase-liber/gb-15664": {
          "label": "Tonus VII",
          "file": "gabc/hymns/gregobase-liber/gb-9834.gabc",
          "printedPage": 160
      },
      "hymns/gregobase-liber/gb-16691": {
          "label": "Tonus IV*",
          "file": "gabc/common/ps--venite_exsultemus_94--4.gabc",
          "printedPage": 141
      },
      "hymns/gregobase-liber/gb-20895": {
          "label": "Tonus IV*",
          "file": "gabc/common/ps--venite_exsultemus_94--4.gabc",
          "printedPage": 141
      },
      "hymns/gregobase-liber/gb-20870": {
          "label": "Tonus IV",
          "file": "gabc/hymns/gregobase-liber/gb-15508.gabc",
          "printedPage": 138
      },
      "hymns/laudemus-deum-conversione-pauli-user-supplied": {
          "label": "Tonus II",
          "file": "gabc/hymns/gregobase-liber/gb-8218.gabc",
          "printedPage": 133
      },
      "hymns/laudemus-deum-ioseph-user-supplied": {
          "label": "Tonus II",
          "file": "gabc/hymns/gregobase-liber/gb-8218.gabc",
          "printedPage": 133
      },
      "hymns/gregobase-liber/gb-20882": {
          "label": "Tonus IV",
          "file": "gabc/hymns/gregobase-liber/gb-15508.gabc",
          "printedPage": 138
      },
      "hymns/gregobase-liber/gb-20833": {
          "label": "Tonus V",
          "file": "gabc/hymns/gregobase-liber/gb-10248.gabc",
          "printedPage": 146
      },
      "hymns/gregobase-liber/gb-15774": {
          "label": "Tonus IV",
          "file": "gabc/hymns/gregobase-liber/gb-15508.gabc",
          "printedPage": 138
      },
      "hymns/gregobase-liber/gb-16079": {"label": "Tonus E", "file": "gabc/hymns/gregobase-liber/gb-9642.gabc", "printedPage": 168},
      "hymns/gregobase-liber/gb-14205": {"label": "Tonus D", "file": "gabc/hymns/gregobase-liber/gb-9707.gabc", "printedPage": 165},
      "hymns/gregobase-liber/gb-20870--provisional-0": {"label": "Tonus IV", "file": "gabc/hymns/gregobase-liber/gb-15508.gabc", "printedPage": 138},
      "hymns/gregobase-liber/gb-20882--provisional-6": {"label": "Tonus IV", "file": "gabc/hymns/gregobase-liber/gb-15508.gabc", "printedPage": 138},
      "hymns/gregobase-liber/gb-10398--provisional-7": {"label": "Tonus III", "file": "gabc/hymns/gregobase-liber/gb-10397.gabc", "printedPage": 135}
  };  var invitatoryPsalmPromise = null;
  function getInvitatoryPsalm() {
    if (!invitatoryPsalmPromise) invitatoryPsalmPromise = fetch("data/psalm94-invitatory.json").then(function(r) { if (!r.ok) throw Error("Psalm text unavailable"); return r.json(); });
    return invitatoryPsalmPromise;
  }
  var shown = null;            // { entry, text, parsed }
  var countCache = {};
  var el = {};

  // ---------- helpers ----------
  function byId(id) { return document.getElementById(id); }
  function fold(s) {
    return String(s).toLowerCase().replace(/[æǽ]/g, 'ae').replace(/œ/g, 'oe')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/j/g, 'i').replace(/v/g, 'u').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function rank(kind, value) {
    var v = String(value || '').toLowerCase(), groups = ORDERS[kind] || [];
    for (var i = 0; i < groups.length; i++) {
      for (var j = 0; j < groups[i].length; j++) if (v.indexOf(groups[i][j]) >= 0) return i;
    }
    return 99;
  }
  function make(tag, props, text) {
    var node = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) { node.setAttribute(k, props[k]); });
    if (text != null) node.textContent = text;
    return node;
  }
  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem('cantus.' + key); localStorage.setItem('cantus.' + key, value); } catch (e) { /* private mode */ }
    return null;
  }
  function collectionOfId(id) { return id.split('/')[0]; }
  function findEntry(id) {
    var list = index[collectionOfId(id)] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function hrefFor(entry) { return '#' + encodeURIComponent(entry.id); }
  function catHref(id) { return '#cat:' + encodeURIComponent(id); }
  function slotLabel(label, variant, paren) {
    var t = label + (variant ? ' · ' + variant : '');
    return paren ? '(' + t + ')' : t;
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  // ---------- hymn categories ----------
  function prepareTree(list, depth) {
    list.forEach(function (n) {
      n.depth = depth; n.entries = []; nodes[n.id] = n;
      if (n.kids) prepareTree(n.kids, depth + 1);
    });
  }
  function nodeOf(entry) { return (entry.cat && nodes[entry.cat]) || UNSORTED; }
  function pathOf(node) {          // root … node
    var out = [];
    while (node) { out.unshift(node); node = node.parent ? nodes[node.parent] : null; }
    return out;
  }
  function openPath(node) { pathOf(node).forEach(function (n) { state.open[n.id] = true; }); }

  // a stable "liturgical" order for all hymns: tree order, then slot order, then the order of the index
  function assignOrder() {
    var counter = 0;
    (function walk(list) {
      list.forEach(function (n) {
        n.ord = counter++;
        if (n.kids) walk(n.kids);
      });
    })(tree);
    UNSORTED.ord = counter++;
    index.hymns.forEach(function (e, i) {
      var n = nodeOf(e), s = -1;
      (n.slots || []).forEach(function (slot, k) { if (slot.key === e.slot && s < 0) s = k; });
      e.ord = n.ord * 1e6 + (s < 0 ? 9999 : s) * 1e3 + Math.min(i, 999);
      n.entries.push(e);
    });
    index.hymns.sort(function (a, b) { return a.ord - b.ord; });
    (function sortEntries(list) {
      list.forEach(function (n) { n.entries.sort(function (a, b) { return a.ord - b.ord; }); if (n.kids) sortEntries(n.kids); });
    })(tree);
    UNSORTED.entries.sort(function (a, b) { return a.ord - b.ord; });
  }

  // Group alternate settings only within the same liturgical section and hour.
  // Keep distinct texts/incipits separate; never collapse a hymn across feasts.
  function variantSuffix(e) {
    var name = e.name || '';
    var m = /\s*\(([^()]*)\)\s*$/.exec(name);
    return m ? m[1].trim() : '';
  }
  function baseHymnName(e) {
    return fold((e.name || '').replace(/\s*\([^()]*\)\s*$/, '').trim());
  }
  function variantsOf(e) {
    if (!e || e.collection !== 'hymns' || e.unchecked) return [];
    var name = baseHymnName(e);
    var list = (index.hymns || []).filter(function (x) {
      return !x.unchecked && x.cat === e.cat && x.hour === e.hour && baseHymnName(x) === name;
    });
    if (list.length < 2) return [];
    // Require a genuine distinguishing label or melody, not duplicated imports.
    var distinct = {};
    list.forEach(function (v) { distinct[fold(variantSuffix(v) || v.variant || '') + '|' + v.file] = true; });
    if (Object.keys(distinct).length < 2) return [];
    list.sort(function (x, y) { return (x.ord || 0) - (y.ord || 0) || x.id.localeCompare(y.id); });
    return list;
  }
  function isSecondaryVariant(e) {
    var vars = variantsOf(e);
    return vars.length > 1 && vars[0].id !== e.id;
  }
  function primaryIdOf(id) {
    if (!id) return id;
    var e = findEntry(id), vars = e ? variantsOf(e) : [];
    return vars.length > 1 ? vars[0].id : id;
  }
  function displayHymnName(e) {
    return variantsOf(e).length > 1 ? (e.name || '').replace(/\s*\([^()]*\)\s*$/, '').trim() : e.name;
  }
  function dayLabel(e) {
    return variantSuffix(e) || e.variant || ('Melody ' + (variantsOf(e).indexOf(e) + 1));
  }

  // ---------- filtering ----------
  function tokens() { return fold(state.q).split(' ').filter(Boolean); }
  function hourOk(e) { return !state.hour || HOUR_GROUP[state.hour].indexOf(e.hour) >= 0; }
  function textOk(e, toks) {
    for (var i = 0; i < toks.length; i++) if (e.search.indexOf(toks[i]) < 0) return false;
    return true;
  }
  function matchesHymn(e) {
    if (isSecondaryVariant(e) || !hourOk(e)) return false;
    var toks = tokens();
    if (textOk(e, toks)) return true;
    var vars = variantsOf(e);
    for (var i = 0; i < vars.length; i++) if (textOk(vars[i], toks)) return true;
    return false;
  }
  function slotOk(s) { return !state.hour || HOUR_GROUP[state.hour].indexOf(s.hour) >= 0; }

  function countNode(n) {
    if (countCache[n.id] != null) return countCache[n.id];
    var c = n.entries.filter(matchesHymn).length;
    (n.kids || []).forEach(function (k) { c += countNode(k); });
    return (countCache[n.id] = c);
  }
  function hasHourSlot(n) {
    return (n.slots || []).some(slotOk) || (n.kids || []).some(hasHourSlot) || n.entries.some(hourOk);
  }
  function nodeVisible(n) {
    if (countNode(n) > 0) return true;
    if (state.hideEmpty) return false;
    return !state.hour || hasHourSlot(n);
  }
  // the hours of a node, each with the hymns in it: [{ label, entries, paren }]
  var sourceConfirmedGaps = {
    'c-doctores|inv|fontem sapientiae in tempore paschali': 'Fontem sapientiae Dominum — distinct Eastertide melody, mode VI*, printed p. 301 (PDF scan 157); Venite p. 154. Existing mode IV score is NOT interchangeable. GABC missing',
    'c-viri|inv|mirabilem in sanctis in tempore paschali': 'Mirabilem in sanctis suis Dominum — distinct Eastertide melody, mode VI*, printed pp. 311–312 (PDF scans 162–163); Venite p. 154. Existing mode IV score is NOT interchangeable. GABC missing',
    'adventus-post16|ol': 'Veni, redemptor gentium (Liber Hymnarius p. 11; GABC missing)',
    'quadragesima-hebd1-5|v|in officio dominicali': 'Audi, benigne Conditor (Liber Hymnarius p. 48; GABC missing)',
    'c-apostoli|v2|in tempore paschali': 'Tristes erant Apostoli (Liber Hymnarius p. 270; GABC missing)',
    'pentecostes|c': 'Iesu redemptor saeculi (Liber Hymnarius p. 97; GABC unverified or missing)',
    'pentecostes|l': 'Beata nobis gaudia (Liber Hymnarius p. 99; GABC unverified or missing)',
    's-03-19|l': 'Caelitum Ioseph (Liber Hymnarius p. 358; GABC unverified or missing)',
    's-03-19|inv': 'Laudemus Deum nostrum in solemnitate beati Ioseph (Liber Hymnarius p. 357; GABC unverified or missing)'
  };
  function groupsFor(n) {
    var ents = n.entries.filter(matchesHymn), used = {}, groups = [];
    (n.slots || []).forEach(function (s) {
      if (!slotOk(s)) return;
      var list = ents.filter(function (e) { return e.slot === s.key; });
      list.forEach(function (e) { used[e.id] = true; });
      if (!list.length && (state.hideEmpty || (s.variant && /ferial/i.test(s.variant) && ents.some(function (e) { return variantsOf(e).some(function (v) { return v.slot === s.key; }); })))) return;
      var expected = !list.length ? sourceConfirmedGaps[n.id + '|' + s.key] : null;
      groups.push({ label: slotLabel(s.label, s.variant, s.paren) + (expected ? ' · SOURCE IDENTIFIED: ' + expected : ''), entries: list });
    });
    var rest = ents.filter(function (e) { return !used[e.id]; }), byHour = {}, order = [];
    rest.forEach(function (e) {
      var key = e.hour ? slotLabel(hourNames[e.hour] || e.hour, e.variant) : 'Hora nondum assignata';
      if (e.hour && !e.slot && (n.slots || []).filter(function (sl) { return sl.hour === e.hour; }).length > 1) key += ' · VARIANS INCERTA';
      if (!byHour[key]) { byHour[key] = []; order.push(key); }
      byHour[key].push(e);
    });
    order.forEach(function (k) { groups.push({ label: k, entries: byHour[k], extra: true }); });
    return groups;
  }
  function subOf(e) {
    var vars = variantsOf(e);
    if (vars.length > 1) return 'In dominica / In feriis · switchable';
    var mode = ROMAN[parseInt(e.mode, 10)];
    return [mode && 'Modus ' + mode, e.meter, e.variant].filter(Boolean).join(' · ');
  }
  function pathLabel(e) {
    var p = pathOf(nodeOf(e)).map(function (n) { return n.label; });
    var h = e.hour ? slotLabel(hourNames[e.hour] || e.hour, e.variant) : '';
    return p.concat(h ? [h] : []).join(' › ');
  }

  // ---------- GABC → what exsurge needs ----------
  function parseGabc(text) {
    text = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    var m = /^%%[ \t]*$/m.exec(text), header = {}, body = text, annotations = [];
    if (m) {
      var kv = /^([A-Za-z][\w-]*)\s*:\s*(.*?)\s*;?$/;
      text.slice(0, m.index).split('\n').forEach(function (line) {
        var r = kv.exec(line.trim());           // free text before the header is ignored here
        if (!r) return;
        if (r[1].toLowerCase() === 'annotation') annotations.push(r[2].trim());
        else header[r[1].toLowerCase()] = r[2].trim();
      });
      body = text.slice(m.index + m[0].length).replace(/^\n/, '');
    }
    return { header: header, annotations: annotations, gabc: exsurgeGabc(body) };
  }
  // Gregorio-style markup that GregoBase files use, turned into what exsurge understands
  function exsurgeGabc(gabc) {
    return gabc
      .replace(/<sp>'(ae|æ)<\/sp>/g, 'ǽ').replace(/<sp>'(AE|Æ)<\/sp>/g, 'Ǽ')
      .replace(/<sp>(ae|AE|Ae|æ|Æ)<\/sp>/g, function (_, m) { return (m === 'ae' || m === 'æ') ? 'æ' : 'Æ'; })
      .replace(/<sp>'?(oe|OE|Oe)<\/sp>/g, function (_, m) { return m === 'oe' ? 'œ' : 'Œ'; })
      .replace(/<v>\\([VRA])bar<\/v>/g, '$1/.')
      .replace(/<sp>([VRA])\/<\/sp>\.?/g, '$1/.')                  // versicle / response signs
      .replace(/\\hspace\{[^}]*\}/g, '')
      .replace(/\[[ou]ll:[01]?[{}][01]?\]/ig, '')                  // ledger line hints exsurge can't use
      .replace(/\\emph\{([^(}]+)\}/g, '_$1_')
      .replace(/(?:\{\})?<i>\(([^)]+)\)<\/i>/g, '_{}$1_')          // an open parenthesis can't be escaped in exsurge
      .replace(/<\/?i>/g, '_')
      .replace(/(^|[\s)])([*†])\(/g, '$1^$2^(')                    // asterisks and daggers in red
      .replace(/(^|\n)(\d+\.)[ \t]+(?=[^\s()]+\()/g, '$1^$2^ ')     // stanza numbers in red
      .replace(/\)\s*\(\)/g, ')');
  }
  function makeCtxt(scale) {
    scale = scale || 1;
    var ctxt = new exsurge.ChantContext(exsurge.TextMeasuringStrategy.Canvas);
    ctxt.condenseLineAmount = 1;
    ctxt.lineBreaking = 'optimal';
    ctxt.setGlyphScaling(scale / 16);
    // follow the page's colour so light/dark mode works without re-rendering (see theme.css)
    ctxt.textColor = 'currentColor';
    ctxt.staffLineColor = ctxt.neumeLineColor = ctxt.dividerLineColor = 'currentColor';
    ctxt.negativeFillColor = 'var(--exsurge-negative-fill, #fff)';
    ctxt.setFont("'Crimson Text', serif", 19.2 / 0.9 * scale);
    ctxt.spaceBetweenSystems = 0;
    ctxt.textStyles.dropCap.size = 64 * scale;
    ctxt.textStyles.annotation.size = 12.8 * scale;
    ctxt.minLyricWordSpacing *= 0.7;
    ctxt.accidentalSpaceMultiplier = 1.5;
    ctxt.specialCharProperties['font-family'] = "'Versiculum'";
    ctxt.specialCharProperties['font-variant'] = 'normal';
    ctxt.specialCharProperties['font-weight'] = '400';
    var defaultSpecialCharText = ctxt.specialCharText;
    ctxt.specialCharText = function (c) { return defaultSpecialCharText(c).toLowerCase(); };
    ctxt.setRubricColor('var(--rubric-color, #d00)');
    return ctxt;
  }
  function makeScore(parsed, entry, scale) {
    var ctxt = makeCtxt(scale);
    var dropCap = parsed.header['initial-style'] !== '0';
    var score = new exsurge.ChantScore(ctxt, exsurge.Gabc.createMappingsFromSource(ctxt, parsed.gabc), dropCap);
    var written = (parsed.annotations || []).filter(Boolean).slice(0, 2);
    if (dropCap && written.length) {
      // annotation: lines in the header are used as written (e.g. "Hymn" over "4")
      score.annotation = written[1]
        ? new exsurge.Annotations(ctxt, '%' + written[0] + '%', '%' + written[1] + '%')
        : new exsurge.Annotations(ctxt, '%' + written[0] + '%');
    } else if (dropCap) {
      var abbr = PART_ABBREV[String(entry.part || parsed.header['office-part'] || '').toLowerCase()];
      var mode = ROMAN[parseInt(entry.mode || parsed.header.mode, 10)];
      if (abbr && mode) score.annotation = new exsurge.Annotations(ctxt, '%' + abbr + '%', '%' + mode + '%');
      else if (mode) score.annotation = new exsurge.Annotations(ctxt, '%' + mode + '%');
    }
    return { score: score, ctxt: ctxt };
  }

  var fontsReady = Promise.all(['16px "Crimson Text"', 'italic 16px "Crimson Text"', 'bold 16px "Crimson Text"',
    'italic bold 16px "Crimson Text"', '16px Versiculum'].map(function (f) {
    return document.fonts && document.fonts.load ? document.fonts.load(f) : null;
  })).catch(function () {});

  var renderToken = 0;
  function scoreWidth() { return Math.max(260, Math.min(760, el.score.clientWidth || 760)); }
  function layoutScoreAsync(made, width) {
    return new Promise(function (resolve) {
      made.ctxt.width = width;
      made.score.performLayoutAsync(made.ctxt, function () {
        made.score.layoutChantLines(made.ctxt, width);
        resolve(made);
      });
    });
  }
  function renderScore() {
    if (!shown) return;
    var token = ++renderToken, container = el.score, width = scoreWidth();
    fontsReady.then(function () {
      if (token !== renderToken) return;
      var tasks = [layoutScoreAsync(makeScore(shown.parsed, shown.entry, state.scale), width)];
      if (shown.psalm) {
        tasks.push(layoutScoreAsync(makeScore(shown.psalm.parsed, shown.entry, state.scale), width));
      }
      Promise.all(tasks).then(function (results) {
        if (token !== renderToken) return;
        container.textContent = '';
        var scores = [];
        results.forEach(function (made, idx) {
          if (idx > 0 && shown.psalm) {
            var sep = make('div', { 'class': 'score-sep' });
            sep.appendChild(make('div', { 'class': 'rule', 'aria-hidden': 'true' })).appendChild(make('i'));
            var heading = shown.psalm.parsed.header['text-right'] || shown.psalm.parsed.header.name || '';
            if (heading) sep.appendChild(make('div', { 'class': 'score-heading' }, heading));
            container.appendChild(sep);
          }
          container.appendChild(made.score.createSvgNode(made.ctxt));
          scores.push(made.score);
        });
        if (shown.invitatoryPsalmSection) container.appendChild(shown.invitatoryPsalmSection);
        container.setAttribute('data-width', width);
        if (window.ChantPlayer) ChantPlayer.bindSvg(scores.length === 1 ? scores[0] : scores, container);
      });
    });
  }

  // ---------- the browser (left): hymns as a tree, searches and the Graduale Simplex as flat lists ----------
  function entriesForCollection() { return index[state.collection] || []; }

  function buildHourChips() {
    el.hours.textContent = '';
    if (state.collection !== 'hymns') return;
    var present = {};
    index.hymns.forEach(function (e) { present[e.hour] = true; });
    var all = make('button', { type: 'button', 'class': 'chip', 'aria-pressed': state.hour ? 'false' : 'true', title: 'All hours' }, 'Omnes');
    all.addEventListener('click', function () { setHour(''); });
    el.hours.appendChild(all);
    hourOrder.forEach(function (h) {
      if (!HOUR_SHORT[h]) return;
      var b = make('button', { type: 'button', 'class': 'chip', 'data-hour': h, 'aria-pressed': state.hour === h ? 'true' : 'false', title: hourNames[h] }, HOUR_SHORT[h]);
      b.addEventListener('click', function () { setHour(state.hour === h ? '' : h); });
      el.hours.appendChild(b);
    });
  }
  function setHour(h) { state.hour = h; buildHourChips(); refresh(); }

  function buildFilters() {   // Graduale Simplex: dropdowns
    var box = el.filters, cfg = COLLECTIONS[state.collection];
    box.textContent = '';
    (cfg.filters || []).forEach(function (f) {
      var values = {};
      entriesForCollection().forEach(function (e) { if (e[f.key]) values[e[f.key]] = true; });
      var names = Object.keys(values).sort(function (a, b) { return rank(f.order, a) - rank(f.order, b) || a.localeCompare(b, 'la'); });
      if (!names.length) return;
      var select = make('select', { 'data-key': f.key, 'aria-label': f.label });
      select.appendChild(make('option', { value: '' }, f.label + ': omnia'));
      names.forEach(function (n) { select.appendChild(make('option', { value: n }, n)); });
      select.value = state.filters[f.key] || '';
      select.addEventListener('change', function () { state.filters[f.key] = select.value; refresh(); });
      box.appendChild(select);
    });
  }

  function hymnLink(e, withPath) {
    var vars = variantsOf(e);
    var isActive = e.id === state.current || vars.some(function (v) { return v.id === state.current; });
    var a = make('a', { 'class': 'hymn' + (isActive ? ' active' : ''), href: hrefFor(e), 'data-id': e.id });
    a.appendChild(document.createTextNode(displayHymnName(e)));
    if (e.unchecked) a.appendChild(make('span', { 'class': 'unchecked-marker', title: e.uncheckedReason || 'Placement not verified' }, 'UNCHECKED'));
    if (!e.slot && e.hour && (function(){ var node = nodes[e.cat]; return node && (node.slots || []).filter(function(sl){return sl.hour === e.hour;}).length > 1; })()) a.appendChild(make('span', { 'class': 'unchecked-marker', title: 'Multiple liturgical variants exist; this transcription has not been assigned to one.' }, 'VARIANT UNCHECKED'));
    if ((e.provenance === 'gregobase' || e.provenance === 'gregobase-liber')) a.appendChild(make('span', { 'class': 'provenance-mini', title: 'GregoBase transcription; not verified against Liber Hymnarius' }, e.provenance === 'gregobase-liber' ? 'GB · LH source' : 'GB · unverified'));
    var sub = withPath ? pathLabel(e) : subOf(e);
    if (sub) a.appendChild(make('span', { 'class': 'sub' }, sub));
    return a;
  }

  function appendNode(ul, n) {
    if (!nodeVisible(n)) return;
    var c = countNode(n), open = !!state.open[n.id];
    var hasBody = (n.kids && n.kids.length) || n.entries.length || (n.slots && n.slots.length);
    var li = make('li', { 'class': 'node d' + Math.min(n.depth, 3) + (open ? ' open' : '') + (c ? '' : ' empty') + (state.cat === n.id ? ' current' : ''), 'data-node': n.id });
    li.style.setProperty('--d', n.depth);
    var row = make('div', { 'class': 'nrow' });
    var chev = make('button', { type: 'button', 'class': 'chev' + (hasBody ? '' : ' none'), 'aria-expanded': open ? 'true' : 'false', 'aria-label': (open ? 'Close ' : 'Open ') + n.label });
    chev.addEventListener('click', function () { state.open[n.id] = !state.open[n.id]; renderBrowser(); });
    var lbl = n.virtual ? make('span', { 'class': 'lbl' }, n.label) : make('a', { 'class': 'lbl', href: catHref(n.id) }, n.label);
    row.appendChild(chev); row.appendChild(lbl);
    row.appendChild(make('span', { 'class': 'cnt' }, c ? String(c) : ''));
    li.appendChild(row);
    if (open) {
      var inner = make('ul');
      (n.kids || []).forEach(function (k) { appendNode(inner, k); });
      groupsFor(n).forEach(function (g) {
        var h = make('li', { 'class': 'slot-h' + (g.entries.length ? '' : ' none') }, g.label || 'Officium');
        h.style.setProperty('--d', n.depth);
        if (g.label || !g.entries.length) inner.appendChild(h);
        g.entries.forEach(function (e) {
          var item = make('li'); item.style.setProperty('--d', n.depth);
          item.appendChild(hymnLink(e)); inner.appendChild(item);
        });
      });
      li.appendChild(inner);
    }
    ul.appendChild(li);
  }

  function renderBrowser(scrollToCurrent) {
    countCache = {};
    var box = el.list, keep = box.scrollTop;
    box.textContent = '';
    if (state.collection === 'hymns' && !state.q) {
      var ul = make('ul', { 'class': 'tree' });
      tree.forEach(function (n) { appendNode(ul, n); });
      appendNode(ul, UNSORTED);
      if (!ul.children.length) box.appendChild(make('div', { 'class': 'none-found' }, 'No hymns for this hour yet.'));
      else box.appendChild(ul);
      el.hideEmptyWrap.hidden = el.expand.hidden = el.collapse.hidden = false;
    } else {
      renderFlat(box);
      el.hideEmptyWrap.hidden = el.expand.hidden = el.collapse.hidden = true;
    }
    visible = listedEntries();
    var total = entriesForCollection().filter(function (e) { return !isSecondaryVariant(e); }).length;
    el.count.textContent = total ? (visible.length === total ? plural(total, 'chant', 'chants') : visible.length + ' / ' + total) : '';
    box.scrollTop = keep;
    if (scrollToCurrent) {
      var t = box.querySelector('a.hymn.active') || box.querySelector('.node.current > .nrow');
      if (t && t.scrollIntoView) t.scrollIntoView({ block: 'center' });
    }
    updateNav();
  }

  function listedEntries() {
    if (state.collection === 'hymns') return index.hymns.filter(matchesHymn);
    var toks = tokens(), cfg = COLLECTIONS.simplex, groupKey = cfg.group;
    var list = index.simplex.filter(function (e) {
      for (var k in state.filters) if (state.filters[k] && e[k] !== state.filters[k]) return false;
      return textOk(e, toks);
    });
    var order = cfg.filters.filter(function (f) { return f.key === groupKey; })[0];
    return list.map(function (e, i) { return { e: e, i: i }; }).sort(function (a, b) {
      var ga = a.e[groupKey] || '', gb = b.e[groupKey] || '';
      return (rank(order.order, ga) - rank(order.order, gb)) || (ga === gb ? 0 : ga.localeCompare(gb, 'la')) || a.i - b.i;
    }).map(function (d) { return d.e; });
  }

  function renderFlat(box) {
    var wrap = make('div', { 'class': 'flat' }), last = null, hymns = state.collection === 'hymns';
    var list = listedEntries();
    if (!list.length) {
      box.appendChild(make('div', { 'class': 'none-found' }, entriesForCollection().length ? 'Nothing matches.' : COLLECTIONS[state.collection].label + ': no chants yet.'));
      return;
    }
    list.forEach(function (e) {
      var g = hymns ? '' : (e.season || '');
      if (g && g !== last) wrap.appendChild(make('div', { 'class': 'group' }, g));
      last = g;
      var a = hymnLink(e, hymns);
      if (!hymns) {
        var s = [e.part, e.occasion, e.note, e.incipit].filter(Boolean)[0];
        a.textContent = (e.number ? e.number + ' · ' : '') + e.name;
        if ((e.provenance === 'gregobase' || e.provenance === 'gregobase-liber')) a.appendChild(make('span', { 'class': 'provenance-mini', title: 'Not verified against Liber Hymnarius' }, e.provenance === 'gregobase-liber' ? 'GB · LH source' : 'GB · unverified'));
        if (s && s !== e.name) a.appendChild(make('span', { 'class': 'sub' }, s));
      }
      wrap.appendChild(a);
    });
    box.appendChild(wrap);
  }

  // something in the browser changed (search, hour, filters): redraw it and, if a contents page is showing, that too
  function refresh() {
    renderBrowser();
    if (state.view === 'root') showRootPage(true);
    else if (state.view === 'cat') showCategoryPage(true);
  }

  function updateNav() {
    var ids = visible.map(function (e) { return e.id; }), i = ids.indexOf(primaryIdOf(state.current));
    el.prev.disabled = i <= 0;
    el.next.disabled = i < 0 || i >= ids.length - 1;
  }
  function step(delta) {
    var ids = visible.map(function (e) { return e.id; }), i = ids.indexOf(primaryIdOf(state.current)), target = visible[i + delta];
    if (target) location.hash = hrefFor(target);
  }

  // ---------- the viewer (right) ----------
  function crumbs(node, last, nav) {
    nav = nav || el.crumbs;
    nav.textContent = '';
    function add(text, href) {
      if (nav.firstChild) nav.appendChild(make('span', { 'class': 'sep', 'aria-hidden': 'true' }, '›'));
      nav.appendChild(href ? make('a', { href: href }, text) : make('span', null, text));
    }
    add(COLLECTIONS[state.collection].label, '#' + state.collection);
    if (node) pathOf(node).forEach(function (n) { add(n.label, n.virtual ? null : catHref(n.id)); });
    if (last) add(last);
    return nav;
  }
  // kind: 'chant' | 'page'; pane: which side a narrow screen shows ('browse' = the index, 'read' = the page)
  function setView(kind, pane) {
    el.chant.hidden = kind !== 'chant';
    el.page.hidden = kind !== 'page';
    Array.prototype.forEach.call(document.querySelectorAll('[data-for="chant"]'), function (b) { b.hidden = kind !== 'chant'; });
    el.layout.setAttribute('data-pane', pane);
    if (el['settings-btn']) el['settings-btn'].classList.toggle('active', state.view === 'settings');
    if (kind === 'page') {
      shown = null;
      if (window.ChantPlayer) ChantPlayer.stop();
    }
    window.scrollTo(0, 0);
  }

  function tocRow(label, href, count, cls) {
    var li = make('li', cls ? { 'class': cls } : null), a = make('a', { href: href });
    a.appendChild(make('span', { 'class': 't' }, label));
    a.appendChild(make('span', { 'class': 'dots' }));
    a.appendChild(make('span', { 'class': 'cnt' }, count ? String(count) : '–'));
    li.appendChild(a);
    return li;
  }

  function showRootPage(quiet) {
    var cfg = COLLECTIONS[state.collection], page = el.page;
    page.textContent = '';
    state.current = null; state.cat = null; state.view = 'root';
    if (state.collection === 'hymns') {
      page.appendChild(make('h2', null, 'Officium Liturgiae Horarum'));
      page.appendChild(make('p', { 'class': 'lead' }, 'Arranged as in the Liber Hymnarius'));
      page.appendChild(make('div', { 'class': 'rule' })).appendChild(make('i'));
      var cards = make('div', { 'class': 'cards' });
      countCache = {};
      tree.forEach(function (n) {
        var a = make('a', { 'class': 'card', href: catHref(n.id) });
        a.appendChild(make('h3', null, n.label));
        a.appendChild(make('p', null, CAPTIONS[n.id] || ''));
        a.appendChild(make('span', { 'class': 'n' }, plural(countNode(n), 'hymn', 'hymns')));
        cards.appendChild(a);
      });
      if (UNSORTED.entries.length) {
        var u = make('a', { 'class': 'card', href: catHref('unsorted') });
        u.appendChild(make('h3', null, UNSORTED.label));
        u.appendChild(make('p', null, 'Hymns without a category yet'));
        u.appendChild(make('span', { 'class': 'n' }, plural(UNSORTED.entries.length, 'hymn', 'hymns')));
        cards.appendChild(u);
      }
      page.appendChild(cards);
      if (!index.hymns.length) {
        page.appendChild(make('p', { 'class': 'empty-note' })).innerHTML = 'No hymns yet. Put <code>.gabc</code> files in <code>' + cfg.folder +
          '/</code>, give each a <code>category:</code> and <code>hour:</code> in its header, and run <code>node tools/build-index.js</code>.';
      }
      page.appendChild(make('p', { 'class': 'hint' })).innerHTML = 'Open a section, or search by title or words. Filter by hour with the chips on the left. <kbd>/</kbd> search · <kbd>←</kbd> <kbd>→</kbd> previous / next hymn';
    } else {
      page.appendChild(make('h2', null, cfg.label));
      page.appendChild(make('div', { 'class': 'rule' })).appendChild(make('i'));
      var p = make('p', { 'class': 'empty-note' });
      if (index.simplex.length) p.textContent = 'Choose a chant from the list.';
      else p.innerHTML = 'No chants yet. Put <code>.gabc</code> files in <code>' + cfg.folder + '/</code> and run <code>node tools/build-index.js</code>, then reload. See the README for the header fields used for browsing.';
      page.appendChild(p);
    }
    el.crumbs.textContent = '';
    if (quiet) return;
    document.title = 'Cantus – ' + cfg.label;
    setView('page', 'browse');
    renderBrowser();
  }

  function showCategoryPage(quiet) {
    var node = state.cat === 'unsorted' ? UNSORTED : nodes[state.cat], page = el.page;
    if (!node) return showRootPage(quiet);
    state.view = 'cat';
    countCache = {};
    page.textContent = '';
    var bar = make('nav', { 'class': 'crumbs', 'aria-label': 'Breadcrumb' });
    page.appendChild(bar);
    crumbs(node.parent ? nodes[node.parent] : null, node.label, bar);
    page.appendChild(make('h2', null, node.label));
    var c = countNode(node);
    page.appendChild(make('p', { 'class': 'lead' }, node.id in CAPTIONS ? CAPTIONS[node.id] : plural(c, 'hymn', 'hymns')));
    page.appendChild(make('div', { 'class': 'rule' })).appendChild(make('i'));
    var kids = (node.kids || []).filter(nodeVisible);
    if (kids.length) {
      var toc = make('ul', { 'class': 'toc' + (kids.length > 8 ? ' cols' : '') });
      kids.forEach(function (k) { toc.appendChild(tocRow(k.label, catHref(k.id), countNode(k), countNode(k) ? '' : 'empty')); });
      page.appendChild(toc);
    }
    groupsFor(node).forEach(function (g) {
      page.appendChild(make('div', { 'class': 'hours-h' + (g.entries.length ? '' : ' none') }, g.label || 'Officium'));
      if (!g.entries.length) return;
      var ul = make('ul', { 'class': 'hl' });
      g.entries.forEach(function (e) {
        var li = make('li'), a = hymnLink(e); a.className = '';
        var sub = subOf(e); a.textContent = displayHymnName(e);
        if ((e.provenance === 'gregobase' || e.provenance === 'gregobase-liber')) a.appendChild(make('span', { 'class': 'provenance-mini', title: 'Not verified against Liber Hymnarius' }, e.provenance === 'gregobase-liber' ? 'GB · LH source' : 'GB · unverified'));
        if (sub) a.appendChild(make('span', { 'class': 'sub' }, sub));
        li.appendChild(a); ul.appendChild(li);
      });
      page.appendChild(ul);
    });
    if (!kids.length && !node.entries.length && !(node.slots || []).length) page.appendChild(make('p', { 'class': 'empty-note' }, 'No hymns here yet.'));
    if (quiet) return;
    document.title = node.label + ' – Cantus';
    setView('page', 'read');
    state.current = null;
    openPath(node);
    renderBrowser(true);
  }

  // ---------- show a chant ----------
  function loadText(url) {
    if (gabcCache[url]) return Promise.resolve(gabcCache[url]);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return r.text();
    }).then(function (t) { return (gabcCache[url] = t); });
  }
  function loadGabc(entry) {
    return loadText(entry.file);
  }

  function openEntry(entry) {
    if (window.ChantPlayer) ChantPlayer.stop();
    state.current = entry.id; state.cat = null;
    var hymn = entry.collection === 'hymns', mode = ROMAN[parseInt(entry.mode, 10)];
    state.view = 'chant';
    setView('chant', 'read');
    if (hymn) { openPath(nodeOf(entry)); crumbs(nodeOf(entry)); }
    else crumbs(null);
    el.kicker.textContent = hymn ? (KICKER[entry.hour] || '') : (entry.part || '');
    el.title.textContent = displayHymnName(entry);
    var bits = hymn ? [entry.variant, mode && 'Modus ' + mode, entry.meter && 'Metrum ' + entry.meter, entry.note] :
      [entry.part, mode && 'Modus ' + mode, entry.season, entry.occasion, entry.note, entry.number];
    el.meta.textContent = bits.filter(Boolean).join(' · ');
    el.provenance.hidden = !entry.unchecked && entry.provenance !== 'gregobase' && entry.provenance !== 'gregobase-liber';
    el.provenance.textContent = '';
    if (entry.unchecked) {
      el.provenance.appendChild(make('strong', { 'class': 'unchecked-marker' }, 'UNCHECKED · PROVISIONAL PLACEMENT'));
      el.provenance.appendChild(make('span', null, ' ' + (entry.uncheckedReason || 'Not verified') + '. This is an existing GABC score shown as a candidate for this slot, NOT an authenticated assignment from Liber Hymnarius.'));
      if (entry.originalId) el.provenance.appendChild(make('span', null, ' Original catalogue entry: ' + entry.originalId + '.'));
    }
    if ((entry.provenance === 'gregobase' || entry.provenance === 'gregobase-liber')) {
      el.provenance.appendChild(make('strong', null, entry.provenance === 'gregobase-liber' ? 'GregoBase · Listed under Liber Hymnarius (1983)' : 'GregoBase · Not verified against Liber Hymnarius'));
      el.provenance.appendChild(make('span', null, entry.provenance === 'gregobase-liber' ? ' This score is explicitly indexed by GregoBase as a Liber Hymnarius source, but has not been independently compared note-for-note with the scan.' : ' Supplementary transcription; the melody and text may differ from the 1983 edition.'));
      if (entry.source) el.provenance.appendChild(make('a', { href: entry.source, target: '_blank', rel: 'noopener' }, ' View GregoBase source ↗'));
    }
    var vars = variantsOf(entry);
    el.variants.textContent = '';
    if (vars.length > 1) {
      el.variants.hidden = false;
      vars.forEach(function (v) {
        var active = v.id === entry.id;
        el.variants.appendChild(make('a', {
          'class': 'vtab' + (active ? ' active' : ''),
          role: 'tab',
          'aria-selected': active ? 'true' : 'false',
          href: hrefFor(v)
        }, dayLabel(v)));
      });
    } else {
      el.variants.hidden = true;
    }
    el.commentary.textContent = entry.commentary || '';
    el.colophon.textContent = '';
    if (entry.book) el.colophon.appendChild(make('p', null, entry.book));
    // The supplied scan has two printed pages per PDF page. Printed p. 3
    // appears on PDF page 9; the scan's printed pages increase consecutively.
    var bookPage = /Liber Hymnarius[^\n]*?\bp\.?\s*(\d+)/i.exec(entry.book || '');
    if (bookPage) {
      var printed = Number(bookPage[1]);
      var pdfPage = Math.floor((printed + 14) / 2) + 1;
      if (printed >= 1 && pdfPage <= 320) {
        var ref = make('p', { 'class': 'book-reference' });
        ref.appendChild(make('a', {
          href: 'reference/Liber_Hymnarius_1983.pdf#page=' + pdfPage,
          target: '_blank', rel: 'noopener'
        }, 'View printed page ' + printed + ' in Liber Hymnarius (1983) ↗'));
        el.colophon.appendChild(ref);
      }
    }
    if (entry.source && /^https?:\/\//i.test(entry.source)) {
      var p = make('p'); p.appendChild(make('a', { href: entry.source, target: '_blank', rel: 'noopener' }, 'Fons'));
      el.colophon.appendChild(p);
    }
    document.title = entry.name + ' – Cantus';
    el.score.textContent = '';
    if (window.ChantPlayer) ChantPlayer.loadScore(null);
    renderBrowser(true);
    var loads = [loadGabc(entry)];
    if (entry.psalm) loads.push(loadText(entry.psalm));
    Promise.all(loads).then(function (texts) {
      if (state.current !== entry.id) return;
      var text = texts[0];
      var psalmText = texts[1] || '';
      var psalmObj = psalmText ? { text: psalmText, parsed: parseGabc(psalmText) } : null;
      shown = { entry: entry, text: text, parsed: parseGabc(text), psalm: psalmObj };
      // GABC downloads are not necessarily complete hymns. Explicitly flag short
      // transcriptions instead of silently presenting a first stanza as complete.
      var verseCount = (text.split(/^%%\s*$/m)[1] || '').match(/\(.*?\)\s*\(::\)/g);
      var hasNumberedVerses = /(?:^|\n)\s*[2-9]\.\s+/.test(text);
      var shortScore = !hasNumberedVerses && text.length < 850;
      if (shortScore) {
        var warning = make('p', { 'class': 'verse-warning' },
          'TEXT MAY BE INCOMPLETE · This GABC appears to contain only the opening stanza. Do not treat it as the full hymn.');
        el.provenance.hidden = false;
        el.provenance.appendChild(warning);
        var other = (index.hymns || []).filter(function (v) {
          return v.id !== entry.id && baseHymnName(v) === baseHymnName(entry) &&
            v.cat === entry.cat && !v.unchecked && v.file !== entry.file;
        }).sort(function (a,b) { return (b.gabcLength || 0) - (a.gabcLength || 0); })[0];
        if (other) {
          var link = make('a', { href: hrefFor(other) }, 'Compare another transcription of this hymn');
          el.provenance.appendChild(link);
        }
        // Show source-backed additional stanzas as comparison text only. Never
        // silently append a different melody's verses to this GABC score.
        if (/hymn/i.test(entry.part || '')) getVerseSupplements().then(function(all) {
          if (state.current !== entry.id || !all[entry.id]) return;
          var candidate = all[entry.id];
          var panel = make('details', { 'class': 'verse-comparison', open: 'open' });
          panel.appendChild(make('summary', null, 'Full hymn text from a matching source (' + candidate.stanzas + ' stanzas; melody unverified)'));
          panel.appendChild(make('p', { 'class': 'verse-warning' }, candidate.note));
          panel.appendChild(make('pre', { 'class': 'verse-comparison-text' }, candidate.comparisonText));
          if (candidate.sourceUrl) panel.appendChild(make('a', { href: candidate.sourceUrl, target: '_blank', rel: 'noopener' }, 'View comparison source on GregoBase'));
          el.provenance.appendChild(panel);
        }).catch(function() {});
      }
      el.source.textContent = psalmText ? (text.trim() + '\n\n/* ─── Psalmus ─── */\n\n' + psalmText.trim()) : text;
      if (window.ChantPlayer) {
        var mainScore = makeScore(shown.parsed, shown.entry, 1).score;
        var playerScores = psalmObj ? [mainScore, makeScore(psalmObj.parsed, shown.entry, 1).score] : mainScore;
        ChantPlayer.loadScore(playerScores);
      }
      renderScore();
      if (entry.hour === 'inv' && !entry.psalm) {
        getInvitatoryPsalm().then(function (ps) {
          if (state.current !== entry.id) return;
          var section = make('section', { 'class': 'invitatory-psalm-text' });
          section.appendChild(make('h3', null, ps.title));
          section.appendChild(make('p', { 'class': 'verse-warning' }, ps.notice));
          section.appendChild(make('p', null, 'Antiphona: ' + displayHymnName(entry) + ' — repeat the antiphon according to the appropriate invitatory rubric.'));
          ps.verses.forEach(function(v, i) {
            section.appendChild(make('p', null, (i + 1) + '. ' + v));
          });
          // Manual source selection: no automatic antiphon/psalm pairing is asserted.
          fetch('data/invitatory-psalm-tone-sources.json').then(function(r) {
            if (!r.ok) throw Error('Psalm tone list unavailable');
            return r.json();
          }).then(function(toneSources) {
            if (state.current !== entry.id) return;
            var panel = make('section', { 'class': 'verse-comparison' });
            panel.appendChild(make('h3', null, 'Psalmus invitatorius — notated score'));
            var verified = VERIFIED_VENITE_REFERENCES[entry.id];
            if (verified) {
              panel.appendChild(make('p', null, 'Automatically selected from printed Liber Hymnarius reference: ' + verified.label + ', p. ' + verified.printedPage + '.'));
            }

            if (!verified) {
              panel.appendChild(make('p', { 'class': 'verse-warning' },
                'No printed Psalm 94 pairing is recorded for this invitatory. Musical notation is withheld rather than selecting an unverified tone.'));
            } else {
              var automaticTone = toneSources.tones.find(function(t) { return t.file === verified.file; });
              if (!automaticTone) {
                panel.appendChild(make('p', { 'class': 'verse-warning' },
                  'The prescribed Psalm 94 score is unavailable. No substitute has been selected.'));
              } else {
                panel.appendChild(make('p', null, 'Psalmus invitatorius: ' + automaticTone.label + ' (Liber Hymnarius p. ' + verified.printedPage + ').'));
                loadText(automaticTone.file).then(function(gabc) {
                  if (state.current !== entry.id) return;
                  shown.psalm = { text: gabc, parsed: parseGabc(gabc) };
                  el.source.textContent = shown.text.trim() + '\n\n/* Psalmus — printed reference */\n\n' + gabc.trim();
                  if (window.ChantPlayer) {
                    ChantPlayer.loadScore([makeScore(shown.parsed, shown.entry, 1).score,
                      makeScore(shown.psalm.parsed, shown.entry, 1).score]);
                  }
                  renderScore();
                }).catch(function() {
                  if (state.current === entry.id) panel.appendChild(make('p', { 'class': 'verse-warning' },
                    'Could not load the prescribed psalm notation. No substitute was selected.'));
                });
              }
            }
            section.appendChild(panel);
            renderScore();
          }).catch(function () {});
          shown.invitatoryPsalmSection = section;
          renderScore();
        }).catch(function () {});
      }
    }).catch(function (err) {
      if (window.ChantPlayer) ChantPlayer.loadScore(null);
      el.score.textContent = 'Could not load this chant (' + err.message + ').';
    });
  }

  // ---------- routing ----------
  function selectCollection(name) {
    if (!COLLECTIONS[name]) name = DEFAULT_COLLECTION;
    var changed = state.collection !== name;
    state.collection = name;
    if (changed) { state.filters = {}; state.q = ''; state.hour = ''; el.q.value = ''; }
    Array.prototype.forEach.call(el.tabs.children, function (a) {
      a.classList.toggle('active', a.getAttribute('data-collection') === name);
    });
    el.q.placeholder = name === 'hymns' ? 'Search hymns by title or words…  ( / )' : 'Search chants by title or words…  ( / )';
    if (changed || !el.hours.children.length) { buildHourChips(); buildFilters(); }
  }

  var lastBrowseHash = '';

  function showSettingsPage() {
    var page = el.page;
    state.view = 'settings';
    state.current = null;
    state.cat = null;
    page.textContent = '';

    var bar = make('nav', { 'class': 'crumbs', 'aria-label': 'Breadcrumb' });
    bar.appendChild(make('a', { href: '#' + state.collection }, COLLECTIONS[state.collection].label));
    bar.appendChild(make('span', { 'class': 'sep', 'aria-hidden': 'true' }, '›'));
    bar.appendChild(make('span', null, 'Settings'));
    page.appendChild(bar);

    page.appendChild(make('h2', null, 'Settings'));
    page.appendChild(make('p', { 'class': 'lead' }, 'Organ playback and reading preferences'));
    page.appendChild(make('div', { 'class': 'rule' })).appendChild(make('i'));

    var st = window.ChantPlayer ? ChantPlayer.getStatus() : {
      organ: 'flute', legato: false, bpm: 143, minBpm: 80, maxBpm: 200, reverb: 50, minReverb: 0, maxReverb: 100, transpose: 0, minTranspose: -12, maxTranspose: 12
    };

    var list = make('div', { 'class': 'settings-list' });

    function addRow(title, desc, ctrl) {
      var row = make('div', { 'class': 'setting-row' });
      var info = make('div', { 'class': 'setting-info' });
      info.appendChild(make('div', { 'class': 'setting-title' }, title));
      if (desc) info.appendChild(make('div', { 'class': 'setting-desc' }, desc));
      var right = make('div', { 'class': 'setting-ctrl' });
      right.appendChild(ctrl);
      row.appendChild(info);
      row.appendChild(right);
      list.appendChild(row);
      return right;
    }

    // 1. Legato toggle
    var legWrap = make('label', { 'class': 'setting-toggle' });
    var legInput = make('input', { type: 'checkbox', id: 'opt-legato' });
    legInput.checked = !!st.legato;
    var legText = make('span', null, st.legato ? 'On' : 'Off');
    legInput.addEventListener('change', function () {
      legText.textContent = legInput.checked ? 'On' : 'Off';
      if (window.ChantPlayer) ChantPlayer.setLegato(legInput.checked);
    });
    legWrap.appendChild(legInput);
    legWrap.appendChild(legText);
    addRow('Legato', 'Smoothly overlap consecutive organ pipes instead of separating each note.', legWrap);

    // 2. Organ voice
    var orgSelect = make('select', { 'class': 'tool', id: 'opt-organ', 'aria-label': 'Organ sound' });
    [['flute', 'Flute Organ'], ['wind', 'Wind Organ'], ['classic', 'Classic Pipe Organ']].forEach(function (opt) {
      orgSelect.appendChild(make('option', { value: opt[0] }, opt[1]));
    });
    orgSelect.value = st.organ;
    orgSelect.addEventListener('change', function () {
      if (window.ChantPlayer) ChantPlayer.setOrgan(orgSelect.value, false);
    });
    addRow('Organ sound', 'Choose between Flute, airy Wind, or Classic Pipe organ stops.', orgSelect);

    // 3. Reverb
    var revWrap = make('span', { 'class': 'setting-ctrl' });
    var revInput = make('input', { type: 'range', id: 'opt-reverb', min: String(st.minReverb), max: String(st.maxReverb), step: '5', value: String(st.reverb), 'aria-label': 'Reverb' });
    var revVal = make('span', { 'class': 'setting-val' }, st.reverb === 0 ? 'Off' : (st.reverb + '%'));
    revInput.addEventListener('input', function () {
      var v = parseInt(revInput.value, 10);
      revVal.textContent = v === 0 ? 'Off' : (v + '%');
      if (window.ChantPlayer) ChantPlayer.setReverb(v);
    });
    revWrap.appendChild(revInput);
    revWrap.appendChild(revVal);
    addRow('Reverb', 'Church acoustics and resonance around the organ pipes.', revWrap);

    // 3. Tempo
    var bpmWrap = make('span', { 'class': 'setting-ctrl' });
    var bpmInput = make('input', { type: 'range', id: 'opt-bpm', min: String(st.minBpm), max: String(st.maxBpm), step: '5', value: String(st.bpm), 'aria-label': 'Tempo' });
    var bpmVal = make('span', { 'class': 'setting-val' }, st.bpm + ' BPM');
    bpmInput.addEventListener('input', function () {
      var v = parseInt(bpmInput.value, 10);
      bpmVal.textContent = v + ' BPM';
      if (window.ChantPlayer) ChantPlayer.setBpm(v);
    });
    bpmWrap.appendChild(bpmInput);
    bpmWrap.appendChild(bpmVal);
    addRow('Tempo', 'Pulse speed for chant playback.', bpmWrap);

    // 4. Starting pitch transposition
    var pitchWrap = make('span', { 'class': 'pitch-ctrl' });
    var pDown = make('button', { type: 'button', 'class': 'tool icon', 'aria-label': 'Lower starting pitch' }, '−');
    var pVal = make('button', { type: 'button', 'class': 'tool pitch-readout', title: 'Click to reset to default' },
      st.transpose === 0 ? '0 st' : ((st.transpose > 0 ? '+' : '') + st.transpose + ' st'));
    var pUp = make('button', { type: 'button', 'class': 'tool icon', 'aria-label': 'Higher starting pitch' }, '+');
    function syncPitchCtrl() {
      var cur = window.ChantPlayer ? ChantPlayer.getStatus() : st;
      pVal.textContent = cur.transpose === 0 ? '0 st' : ((cur.transpose > 0 ? '+' : '') + cur.transpose + ' st');
      pVal.classList.toggle('transposed', cur.transpose !== 0);
      pDown.disabled = cur.transpose <= cur.minTranspose;
      pUp.disabled = cur.transpose >= cur.maxTranspose;
    }
    pDown.addEventListener('click', function () { if (window.ChantPlayer) { ChantPlayer.shiftPitch(-1); syncPitchCtrl(); } });
    pUp.addEventListener('click', function () { if (window.ChantPlayer) { ChantPlayer.shiftPitch(1); syncPitchCtrl(); } });
    pVal.addEventListener('click', function () { if (window.ChantPlayer) { ChantPlayer.resetPitch(); syncPitchCtrl(); } });
    syncPitchCtrl();
    pitchWrap.appendChild(pDown);
    pitchWrap.appendChild(pVal);
    pitchWrap.appendChild(pUp);
    addRow('Pitch transposition', 'Global semitone shift applied to the starting pitch.', pitchWrap);

    page.appendChild(list);

    var actions = make('div', { 'class': 'settings-actions' });
    var backBtn = make('a', { 'class': 'tool', href: lastBrowseHash || ('#' + state.collection) }, '‹ Back');
    actions.appendChild(backBtn);
    page.appendChild(actions);

    document.title = 'Settings – Cantus';
    setView('page', 'read');
    renderBrowser();
  }

  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (h === 'settings') return showSettingsPage();
    lastBrowseHash = location.hash || ('#' + state.collection);
    if (/^cat:/.test(h)) {
      selectCollection('hymns');
      state.cat = h.slice(4);
      return showCategoryPage();
    }
    if (COLLECTIONS[h]) { selectCollection(h); return showRootPage(); }
    var entry = h && findEntry(h);
    if (entry) { selectCollection(entry.collection); return openEntry(entry); }
    selectCollection(state.collection);
    showRootPage();
  }

  // ---------- actions ----------
  function download(name, text, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' }));
    var a = make('a', { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function getPdfOptions() {
    var made = makeScore(shown.parsed, shown.entry, 1);
    var chants = [{ score: made.score, ctxt: made.ctxt, commentary: shown.entry.commentary || null, pageBreak: false }];
    if (shown.psalm) {
      var psMade = makeScore(shown.psalm.parsed, shown.entry, 1);
      chants.push({
        score: psMade.score,
        ctxt: psMade.ctxt,
        commentary: shown.psalm.parsed.header['text-right'] || shown.psalm.parsed.header.name || null,
        pageBreak: false
      });
    }
    return {
      title: shown.entry.name,
      paper: { width: 7.5, height: 11, fontSize: 20 },
      chants: chants
    };
  }
  function setScale(delta) {
    var i = SCALES.indexOf(state.scale);
    i = Math.max(0, Math.min(SCALES.length - 1, (i < 0 ? 2 : i) + delta));
    state.scale = SCALES[i];
    store('scale', String(state.scale));
    el.smaller.disabled = i === 0; el.larger.disabled = i === SCALES.length - 1;
    renderScore();
  }
  function typing(e) { var t = e.target; return t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable); }

  function init() {
    ['q', 'hours', 'filters', 'count', 'list', 'page', 'chant', 'crumbs', 'kicker', 'title', 'meta', 'provenance', 'variants', 'commentary', 'score', 'colophon', 'source',
      'prev', 'next', 'layout', 'tabs', 'smaller', 'larger', 'expand', 'collapse', 'toindex', 'settings-btn',
      'play', 'play-label', 'stop', 'seek', 'organ', 'pitch-down', 'pitch-reset', 'pitch-up']
      .forEach(function (id) { el[id] = byId(id); });
    el.hideEmptyWrap = byId('hide-empty-wrap');
    el.hideEmpty = byId('hide-empty');

    var saved = parseFloat(store('scale'));
    if (SCALES.indexOf(saved) >= 0) state.scale = saved;
    el.smaller.disabled = state.scale === SCALES[0]; el.larger.disabled = state.scale === SCALES[SCALES.length - 1];
    state.hideEmpty = store('hideEmpty') === '1'; el.hideEmpty.checked = state.hideEmpty;

    if (window.ChantPlayer) {
      var savedTranspose = parseInt(store('transpose'), 10);
      var savedOrgan = store('organ') || 'flute';
      var savedLegato = store('legato') === '1';
      var savedBpm = parseInt(store('tempo'), 10);
      var savedReverb = parseInt(store('reverb'), 10);
      ChantPlayer.init({
        transpose: isNaN(savedTranspose) ? 0 : savedTranspose,
        organ: savedOrgan,
        legato: savedLegato,
        bpm: isNaN(savedBpm) ? 143 : savedBpm,
        reverb: isNaN(savedReverb) ? 50 : savedReverb,
        onChange: function (st) {
          el.play.disabled = !st.hasNotes;
          el.play.classList.toggle('playing', st.playing);
          el.play.classList.toggle('paused', !st.playing && st.paused);
          el.play.setAttribute('aria-pressed', st.playing ? 'true' : 'false');
          el['play-label'].textContent = st.playing ? 'Pause' : (st.paused || st.currentNoteIdx > 0 ? 'Resume' : 'Play');
          el.stop.disabled = !st.hasNotes || (!st.playing && !st.paused && st.currentNoteIdx === 0);
          el.seek.disabled = !st.hasNotes;
          el.seek.max = st.hasNotes ? String(Math.max(0, st.totalNotes - 1)) : '0';
          el.seek.value = st.hasNotes ? String(st.currentNoteIdx) : '0';
          el.organ.value = st.organ;
          el['pitch-down'].disabled = !st.hasNotes || st.transpose <= st.minTranspose;
          el['pitch-up'].disabled = !st.hasNotes || st.transpose >= st.maxTranspose;
          el['pitch-reset'].disabled = !st.hasNotes;
          el['pitch-reset'].textContent = st.startNoteName;
          el['pitch-reset'].classList.toggle('transposed', st.transpose !== 0);
          el['pitch-reset'].title = st.hasNotes
            ? ('Starting pitch: ' + st.startNoteName + (st.transpose ? ' (' + (st.transpose > 0 ? '+' : '') + st.transpose + ' st, click to reset)' : ' (default)'))
            : 'Starting pitch';
          store('transpose', String(st.transpose));
          store('organ', st.organ);
          store('legato', st.legato ? '1' : '0');
          store('tempo', String(st.bpm));
          store('reverb', String(st.reverb));
        }
      });
      el.play.addEventListener('click', function () { ChantPlayer.toggle(); });
      el.stop.addEventListener('click', function () { ChantPlayer.stop(); });
      el.seek.addEventListener('input', function () {
        ChantPlayer.seekToNote(parseInt(el.seek.value, 10), false);
      });
      el.organ.addEventListener('change', function () {
        ChantPlayer.setOrgan(el.organ.value, true);
      });
      el['pitch-down'].addEventListener('click', function () { ChantPlayer.shiftPitch(-1); });
      el['pitch-up'].addEventListener('click', function () { ChantPlayer.shiftPitch(1); });
      el['pitch-reset'].addEventListener('click', function () { ChantPlayer.resetPitch(); });
      el.score.addEventListener('click', function (e) {
        var noteNode = e.target && e.target.closest && e.target.closest('[data-play-idx]');
        if (noteNode) {
          var idx = parseInt(noteNode.getAttribute('data-play-idx'), 10);
          if (!isNaN(idx)) ChantPlayer.seekToNote(idx, true);
        }
      });
      el.score.addEventListener('dblclick', function (e) {
        var noteNode = e.target && e.target.closest && e.target.closest('[data-play-idx]');
        if (noteNode) {
          var idx = parseInt(noteNode.getAttribute('data-play-idx'), 10);
          if (!isNaN(idx)) ChantPlayer.play(idx);
        }
      });
    }

    el.q.addEventListener('input', function () { state.q = el.q.value; refresh(); });
    el.hideEmpty.addEventListener('change', function () { state.hideEmpty = el.hideEmpty.checked; store('hideEmpty', state.hideEmpty ? '1' : '0'); refresh(); });
    el.expand.addEventListener('click', function () { Object.keys(nodes).forEach(function (id) { state.open[id] = true; }); state.open.unsorted = true; renderBrowser(); });
    el.collapse.addEventListener('click', function () { state.open = {}; renderBrowser(); });
    el.list.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href') === location.hash) route();            // same target: still leave the index on small screens
    });
    el.toindex.addEventListener('click', function () { el.layout.setAttribute('data-pane', 'browse'); window.scrollTo(0, 0); });
    el.prev.addEventListener('click', function () { step(-1); });
    el.next.addEventListener('click', function () { step(1); });
    el.smaller.addEventListener('click', function () { setScale(-1); });
    el.larger.addEventListener('click', function () { setScale(1); });
    byId('print').addEventListener('click', function () { window.print(); });
    byId('download').addEventListener('click', function () {
      if (shown) download(shown.entry.id.split('/').pop() + '.gabc', shown.text);
    });
    byId('copylink').addEventListener('click', function () {
      var btn = this, done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy link'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(done);
      else window.prompt('Link:', location.href);
    });
    byId('pdf').addEventListener('click', function (e) {
      e.preventDefault();
      if (shown) ChantPdf.show(this, getPdfOptions);
    });
    window.addEventListener('hashchange', route);
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '/' && !typing(e)) { e.preventDefault(); el.layout.setAttribute('data-pane', 'browse'); el.q.focus(); el.q.select(); }
      else if (e.key === 'Escape' && e.target === el.q) { el.q.value = ''; state.q = ''; refresh(); el.q.blur(); }
      else if (e.key === ' ' && state.view === 'chant' && shown && window.ChantPlayer &&
               !(e.target && /^(button|a|input|textarea|select)$/i.test(e.target.tagName))) {
        e.preventDefault();
        ChantPlayer.toggle();
      }
      else if (!typing(e) && e.key === 'ArrowLeft') step(-1);
      else if (!typing(e) && e.key === 'ArrowRight') step(1);
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (shown && String(scoreWidth()) !== el.score.getAttribute('data-width')) renderScore();
      }, 150);
    });

    fetch('data/index.json', { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (data) {
      tree = data.tree || [];
      (data.hours || []).forEach(function (h) { hourNames[h[0]] = h[1]; hourOrder.push(h[0]); });
      prepareTree(tree, 0);
      index.simplex = (data.simplex || []).map(function (e) { e.collection = 'simplex'; return e; });
      index.hymns = (data.hymns || []).map(function (e) { e.collection = 'hymns'; return e; });
      assignOrder();
      route();
    }).catch(function () {
      el.page.hidden = false;
      el.page.innerHTML = '<p class="empty-note">Could not load <code>data/index.json</code>. Serve this folder over HTTP ' +
        '(e.g. <code>npx http-server</code>) and run <code>node tools/build-index.js</code> first.</p>';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
