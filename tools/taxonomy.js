// The category tree for the hymns, transcribed from the contents pages of liberhymnarius.org
// (Proprium de Tempore, Proprium de Sanctis, Communia Sanctorum, Tempus per Annum, Alia).
//
// Every node has an `id` (what you write in a .gabc header: `category: adventus-ante16;`), a `label`,
// and either child nodes, or "slots" (the places where a hymn is expected: one per hour), or both.
// A slot is written "hour" or "hour:variant", e.g. "v" or "ol:noctu". A slot in parentheses, "(vig)",
// is shown in parentheses, as on the Liber Hymnarius. Hymns need not fill every slot, and a hymn can
// sit in a node without a matching slot: the site simply lists it there.
//
//   node tools/list-categories.js      prints every id, so you can copy the one you need
//
// To add or rename a category, edit this file and run `node tools/build-index.js`.

const HOURS = [
  ['inv', 'Invitatorium'],
  ['vig', 'Vigiliae'],
  ['ol', 'Officium lectionis'],
  ['l', 'Laudes'],
  ['hm', 'Hora media'],
  ['t', 'Tertia'],
  ['s', 'Sexta'],
  ['n', 'Nona'],
  ['v1', 'I Vesperae'],
  ['v', 'Vesperae'],
  ['v2', 'II Vesperae'],
  ['c', 'Completorium'],
  // hymns that serve two hours at once
  ['lv', 'Laudes et Vesperae'],
  ['olv', 'Officium lectionis et Vesperae'],
  ['v12', 'I et II Vesperae'],
  ['vv', 'Vigiliae et Vesperae']
];

// words people (and liberhymnarius.org) use for each hour, folded: lowercase, no accents, no leading "ad"
const HOUR_ALIASES = {
  inv: ['invitatorium', 'invitatory'],
  vig: ['vigiliae', 'vigilias', 'vigils'],
  ol: ['officium lectionis', 'office of readings', 'readings', 'lectionis'],
  l: ['laudes', 'laudes matutinas', 'laudes matutinae', 'lauds', 'morning prayer'],
  hm: ['hora media', 'horam mediam', 'media', 'midday'],
  t: ['tertia', 'tertiam', 'terce', 'horam tertiam'],
  s: ['sexta', 'sextam', 'sext', 'horam sextam'],
  n: ['nona', 'nonam', 'none', 'horam nonam'],
  v1: ['i vesperae', 'i vesperas', 'first vespers', 'vesperae i'],
  v: ['vesperae', 'vesperas', 'vespers', 'evening prayer'],
  v2: ['ii vesperae', 'ii vesperas', 'second vespers', 'vesperae ii'],
  c: ['completorium', 'compline', 'night prayer'],
  lv: ['laudes et vesperae', 'laudes matutinas et vesperas', 'laudes et vesperas', 'laudes matutinas et ad vesperas'],
  olv: ['officium lectionis et vesperae', 'officium lectionis et vesperas', 'officium lectionis et ad vesperas'],
  v12: ['i et ii vesperae', 'i et ii vesperas'],
  vv: ['vigiliae et vesperae', 'vigilias et vesperas', 'vigilias et ad vesperas']
};

const fold = s => String(s || '').toLowerCase().replace(/[æǽ]/g, 'ae').replace(/œ/g, 'oe')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// "Ad Vesperas" / "vespers" / "v" → 'v'; unknown → ''
function hourKey(label) {
  const f = fold(label).replace(/^ad /, '').replace(/ et ad /g, ' et ');
  if (HOURS.some(h => h[0] === f)) return f;
  for (const key of Object.keys(HOUR_ALIASES)) {
    if (HOUR_ALIASES[key].some(a => fold(a).replace(/ et ad /g, ' et ') === f)) return key;
  }
  return '';
}

// ---- tiny builders ----
const kids = (id, label, children) => ({ id, label, kids: children });
const slots = (id, label, list, extra) => Object.assign({ id, label, slots: list }, extra || {});
const DAY8 = ['v', 'c', 'inv', 'ol', 'l', 't', 's', 'n'];   // Vesperae, Completorium, Invitatorium, OL, Laudes, Media, T, S, N

const tree = [
  // ───────────────────────────── PROPRIUM DE TEMPORE ─────────────────────────────
  kids('tempore', 'Proprium de Tempore', [
    kids('adventus', 'Tempus Adventus', [
      slots('adventus-ante16', 'Usque ad diem 16 Decembris', DAY8),
      slots('adventus-post16', 'Post diem 16 Decembris', DAY8)
    ]),
    kids('nativitatis', 'Tempus Nativitatis', [
      slots('nativitatis-ante-epiph', 'Usque ad Sollemnitatem Epiphaniae', DAY8),
      slots('sacra-familia', 'Sanctae Familiae Iesu, Mariae & Ioseph', ['v12', 'ol', 'l']),
      slots('dei-genetrix', 'Sollemnitas Sanctae Dei Genetricis Mariae', ['v12', 'inv', 'ol', 'l']),
      slots('nativitatis-post-epiph', 'A Sollemnitate Epiphaniae', DAY8),
      slots('baptisma-domini', 'In Baptismate Domini', ['v1', 'inv', 'olv', 'l'])
    ]),
    kids('quadragesimae', 'Tempus Quadragesimae', [
      slots('quadragesima-hebd1-5', 'Usque ad Sabbatum Hebdomadae Quintae', [
        'v:in officio dominicali', 'v:in officio feriali',
        'c:per hebdomadas I, III et V', 'c:per hebdomadas II et IV',
        'inv',
        'ol:in officio dominicali', 'ol:in officio feriali',
        'l:in officio dominicali', 'l:in officio feriali',
        't', 's', 'n']),
      slots('hebdomada-sancta', 'Hebdomada Sancta', ['v', 'ol', 'l', 'hm:Dominica in Palmis'])
    ]),
    kids('triduum', 'Sacrum Triduum Paschale', [
      slots('triduum-feria6', 'Feria sexta', ['inv', 't', 's', 'n']),
      slots('triduum-sabbatum', 'Sabbato Sancto', ['inv', 'ol', 'l', 'v'])
    ]),
    kids('paschale', 'Tempus Paschale', [
      slots('paschale-ante-asc', 'Usque ad Ascensionem Domini', [
        'v:ad libitum in feriis post octavam', 'c', 'inv',
        'ol:ad libitum in feriis post octavam', 'l:ad libitum in feriis post octavam', 't', 's', 'n']),
      slots('paschale-post-asc', 'Ab Ascensione Domini', [
        'v:in sollemnitate', 'v:in officio dominicali', 'v:in officio feriali', 'inv', 'ol', 'l']),
      slots('pentecostes', 'Dominica Pentecostes', ['c', 'inv', 'ol', 'l', 't', 's', 'n'])
    ]),
    kids('post-pentecosten', 'Post Pentecosten', [
      slots('trinitas', 'Sanctissimae Trinitatis', ['v', 'inv', 'ol', 'l']),
      slots('corpus-christi', 'Ss.mi Corporis & Sanguinis Christi', ['v', 'inv', 'ol', 'l']),
      slots('cor-iesu', 'Sacratissimi Cordis Iesu', ['v', 'inv', 'ol', 'l']),
      slots('christus-rex', 'Domini Nostri Iesu Christi Universorum Regis', ['v', 'inv', 'ol', 'l']),
      slots('hebdomada-34', 'Hebdomada XXXIV Per Annum', ['ol', 'l', 'v'])
    ])
  ]),

  // ───────────────────────────── PROPRIUM DE SANCTIS ─────────────────────────────
  kids('sanctis', 'Proprium de Sanctis', [
    kids('s-ian', 'Ianuarius', [
      slots('s-01-02', '2 · Ss. Basilii Magni & Gregorii Nazianzeni', ['(lv)']),
      slots('s-01-21', '21 · S. Agnetis, Virginis & Martyris', ['ol', 'lv']),
      slots('s-01-25', '25 · In Conversione S. Pauli', ['inv', 'ol', 'v'])
    ]),
    kids('s-feb', 'Februarius', [
      slots('s-02-02', '2 · In Praesentatione Domini', ['inv', 'ol', 'l', 'v']),
      slots('s-02-10', '10 · S. Scholasticae', ['(vig)', '(l)', '(v)']),
      slots('s-02-11', '11 · Beatae Mariae Virginis de Lourdes', ['(l)']),
      slots('s-02-22', '22 · Cathedrae S. Petri', ['l', 'v'])
    ]),
    kids('s-mar', 'Martius', [
      slots('s-03-19', '19 · S. Ioseph', ['v', 'inv', 'ol', 'l']),
      slots('s-03-25', '25 · In Annuntiatione Domini', ['v1', 'inv', 'ol', 'l'])
    ]),
    kids('s-apr', 'Aprilis', [
      slots('s-04-21', '21 · S. Anselmi', ['(vig)', '(v)']),
      slots('s-04-25', '25 · S. Marci', ['inv', 'ol', 'lv']),
      slots('s-04-29', '29 · S. Catharinae Senensis', ['ol', 'lv'])
    ]),
    kids('s-mai', 'Maius', [
      slots('s-05-01', '1 · S. Ioseph Opificis', ['inv', 'ol', 'l']),
      slots('s-05-03', '3 · Ss. Philippi et Iacobi', ['ol']),
      slots('s-05-14', '14 · S. Matthiae', ['ol']),
      slots('s-05-26', '26 · S. Gregorii VII', ['(lv)']),
      slots('s-05-27', '27 · S. Augustini Cantuariensis', ['(vv)']),
      slots('s-05-31', '31 · In Visitatione Beatae Mariae Virginis', ['inv', 'ol', 'l', 'v'])
    ]),
    kids('s-iun', 'Iunius', [
      slots('s-06-05', '5 · S. Bonifatii', ['(vig)', '(lv)']),
      slots('s-06-11', '11 · S. Barnabae', ['lv']),
      slots('s-06-24', '24 · In Nativitate S. Ioannis Baptistae', ['v', 'inv', 'ol', 'l']),
      slots('s-06-29', '29 · Ss. Petri & Pauli', ['v1', 'inv', 'ol', 'l', 'v2'])
    ]),
    kids('s-iul', 'Iulius', [
      slots('s-07-03', '3 · S. Thomae', ['l']),
      slots('s-07-05', '5 · S. Benedicti', ['(vig)', 'l', 'v']),
      slots('s-07-22', '22 · S. Mariae Magdalenae', ['l', 'v']),
      slots('s-07-25', '25 · S. Iacobi', ['l']),
      slots('s-07-26', '26 · Ss. Ioachim & Annae', ['(inv)', '(vig)', 'l', 'v']),
      slots('s-07-29', '29 · S. Marthae', ['l', 'v']),
      slots('s-07-31', '31 · S. Ignatii de Loyola', ['lv'])
    ]),
    kids('s-aug', 'Augustus', [
      slots('s-08-06', '6 · In Transfiguratione Domini', ['inv', 'ol', 'l', 'v']),
      slots('s-08-08', '8 · S. Dominici', ['lv']),
      slots('s-08-10', '10 · S. Laurentii', ['l', 'v']),
      slots('s-08-15', '15 · In Assumptione Beatae Mariae Virginis', ['v', 'inv', 'ol', 'l']),
      slots('s-08-20', '20 · S. Bernardi', ['lv']),
      slots('s-08-22', '22 · Beatae Mariae Virginis Reginae', ['inv', 'ol', 'l', 'v']),
      slots('s-08-24', '24 · S. Bartholomaei', ['l']),
      slots('s-08-25', '25 · S. Ludovici', ['(vv)', 'ol', 'l']),
      slots('s-08-28', '28 · S. Augustini', ['lv']),
      slots('s-08-29', '29 · In Passione S. Ioannis Baptistae', ['inv', 'olv', 'l'])
    ]),
    kids('s-sep', 'September', [
      slots('s-09-03', '3 · S. Gregorii Magni', ['(vig)', 'lv']),
      slots('s-09-08', '8 · In Nativitate Beatae Mariae Virginis', ['l', 'olv']),
      slots('s-09-13', '13 · S. Ioannis Chrysostomi', ['lv']),
      slots('s-09-14', '14 · In Exaltatione Sanctae Crucis', ['ol', 'l', 'v']),
      slots('s-09-15', '15 · Beatae Mariae Virginis Perdolentis', ['v', 'inv', 'ol', 'l']),
      slots('s-09-21', '21 · S. Matthaei', ['l']),
      slots('s-09-29', '29 · Ss. Michaelis, Gabrielis & Raphaelis', ['ol', 'l', 'v']),
      slots('s-09-30', '30 · S. Hieronymi', ['lv'])
    ]),
    kids('s-oct', 'October', [
      slots('s-10-02', '2 · Ss. Angelorum Custodum', ['ol', 'l', 'v']),
      slots('s-10-04', '4 · S. Francisci Assisiensis', ['lv']),
      slots('s-10-07', '7 · Beatae Mariae Virginis a Rosario', ['l']),
      slots('s-10-15', '15 · S. Teresiae de Avila', ['l', 'v']),
      slots('s-10-18', '18 · S. Lucae', ['inv', 'lv']),
      slots('s-10-28', '28 · Ss. Simonis & Iudae', ['l'])
    ]),
    kids('s-nov', 'November', [
      slots('s-11-01', '1 · Omnium Sanctorum', ['v', 'inv']),
      slots('s-11-11', '11 · S. Martini, Episcopi', ['inv', '(vig)', 'l', 'olv']),
      slots('s-11-18', '18 · In Dedicatione Basilicarum Ss. Petri & Pauli, Apostolorum', ['lv']),
      slots('s-11-21', '21 · In Praesentatione Beatae Mariae Virginis', ['ol', 'l']),
      slots('s-11-22', '22 · S. Caeciliae, Virginis & Martyris', ['(vig)', '(l)', '(v)']),
      slots('s-11-30', '30 · S. Andreae, Apostoli', ['l'])
    ]),
    kids('s-dec', 'December', [
      slots('s-12-07', '7 · S. Ambrosii', ['l']),
      slots('s-12-08', '8 · In Conceptione Immaculata', ['(l)']),
      slots('s-12-26', '26 · S. Stephani, Protomartyris', ['inv', 'ol', 'l']),
      slots('s-12-27', '27 · S. Ioannis', ['ol', 'l']),
      slots('s-12-28', '28 · Ss. Innocentium', ['inv', 'ol', 'l'])
    ])
  ]),

  // ───────────────────────────── COMMUNIA SANCTORUM ─────────────────────────────
  kids('communia', 'Communia Sanctorum', [
    slots('c-dedicatio', 'Commune Dedicationis Ecclesiae', [
      'v12', 'inv:Domum Dei', 'inv:Christum Dominum', 'inv:Christum Dominum, in tempore paschali', 'ol', 'l']),
    kids('c-bmv', 'Commune Beatae Mariae Virginis', [
      slots('c-bmv-commune', 'Commune', [
        'v1', 'inv:Christum, Mariae Filium', 'inv:Festivitatem Virginis', 'inv:Christum, Mariae Filium, in tempore paschali',
        'ol', 'l', 'v2', 'v:in sollemnitatibus', 'v:in festis', 'v:in memoriis']),
      slots('c-bmv-sabbato', 'Memoria Sanctae Mariae in Sabbato', ['ol', 'l'])
    ]),
    slots('c-apostoli', 'Commune Apostolorum', [
      'v1', 'inv:Regem Apostolorum A.III', 'inv:Regem Apostolorum A.IV', 'inv:Regem Apostolorum, in tempore paschali',
      'ol', 'l', 'v2:in tempore paschali', 'v2:in aliis temporibus']),
    kids('c-martyres', 'Commune Martyrum', [
      slots('c-martyres-plures', 'Pro pluribus martyribus', [
        'inv:in sollemnitatibus et festis', 'inv:in memoriis', 'inv:in tempore paschali', 'ol', 'l', 'v']),
      slots('c-martyr-unus', 'Pro uno martyre', [
        'ol', 'l', 'v', 'ol:pro martyre virgine', 'l:pro martyre virgine', 'v:pro martyre virgine'])
    ]),
    slots('c-pastores', 'Commune Pastorum', [
      'inv:Christum, pastorum', 'inv:Christum, pastorum, in tempore paschali',
      'ol:pro uno pastore', 'ol:pro pluribus pastoribus', 'l:pro uno pastore', 'l:pro pluribus pastoribus',
      'v:pro uno pastore', 'v:pro pluribus pastoribus']),
    slots('c-doctores', 'Commune Doctorum Ecclesiae', [
      'inv:Fontem sapientiae', 'inv:Fontem sapientiae, in tempore paschali', 'l', 'v']),
    slots('c-virgines', 'Commune Virginum', [
      'inv:in sollemnitatibus et festis', 'inv:in memoriis', 'inv:in tempore paschali',
      'ol:pro una virgine', 'ol:pro pluribus virginibus', 'l:pro una virgine', 'v']),
    slots('c-viri', 'Commune Sanctorum Virorum', [
      'inv:Mirabilem in sanctis', 'inv:Mirabilem in sanctis, in tempore paschali',
      'l:pro uno sancto', 'l:pro pluribus sanctis', 'v:pro uno sancto', 'v:pro pluribus sanctis']),
    slots('c-mulieres', 'Commune Sanctarum Mulierum', [
      'ol:pro una sancta muliere', 'ol:pro pluribus sanctis mulieribus',
      'l:pro una sancta muliere', 'l:pro pluribus sanctis mulieribus',
      'v:pro una sancta muliere', 'v:pro pluribus sanctis mulieribus']),
    slots('c-religiosi', 'Pro Religiosis', ['v1', 'inv', 'ol', 'l', 'v2']),
    slots('c-defuncti', 'Officium Defunctorum', [
      'inv:Regem cui', 'inv:Regem cui, in tempore paschali', 'ol', 'l', 'hm', 'v'])
  ]),

  // ───────────────────────────── TEMPUS PER ANNUM ─────────────────────────────
  kids('per-annum', 'Tempus per Annum', [
    slots('pa-compl', 'Ad Completorium', ['c:Te lucis', 'c:Christe qui splendor']),
    slots('pa-inv', 'Ad Invitatorium', ['inv:Hebdomadae I et III', 'inv:Hebdomadae II et IV']),
    kids('pa-13', 'Hebdomadae I et III', weekDays('pa-13')),
    kids('pa-24', 'Hebdomadae II et IV', weekDays('pa-24'))
  ]),

  // ───────────────────────────── ALIA ─────────────────────────────
  kids('alia', 'Alia', [
    slots('te-deum', 'Hymnus Te Deum', [])
  ])
];

function weekDays(prefix) {
  const ferias = ['Secunda', 'Tertia', 'Quarta', 'Quinta', 'Sexta'];      // feria 2 … 6
  const out = [slots(prefix + '-dom', 'Dominica', ['inv', 'v1', 'ol:noctu', 'ol:diurno', 'l', 'hm', 't', 's', 'n', 'v2'])];
  ferias.forEach((f, i) => out.push(slots(prefix + '-f' + (i + 2), 'Feria ' + f,
    ['ol:noctu', 'ol:diurno', 'l', 't', 's', 'n', 'v'])));
  out.push(slots(prefix + '-sab', 'Sabbato', ['ol:noctu', 'ol:diurno', 'l']));
  return out;
}

// ---- normalise: slots become objects, every node knows its parent path ----
const hourLabel = Object.fromEntries(HOURS);
const slotKey = (hour, variant) => hour + (variant ? '|' + fold(variant) : '');

function prepare(nodes, parent, bag) {
  return nodes.map(n => {
    const node = { id: n.id, label: n.label, parent: parent ? parent.id : '' };
    if (bag[n.id]) throw new Error('duplicate category id: ' + n.id);
    bag[n.id] = node;
    if (n.slots) {
      node.slots = n.slots.map(raw => {
        const paren = /^\(.*\)$/.test(raw);
        const [hour, ...rest] = raw.replace(/^\(|\)$/g, '').split(':');
        const variant = rest.join(':');
        if (!hourLabel[hour]) throw new Error('unknown hour "' + hour + '" in ' + n.id);
        return { key: slotKey(hour, variant), hour, variant, paren, label: hourLabel[hour] };
      });
    }
    if (n.kids) node.kids = prepare(n.kids, node, bag);
    return node;
  });
}

const byId = {};
const prepared = prepare(tree, null, byId);

module.exports = { tree: prepared, byId, HOURS, hourKey, slotKey, fold };
