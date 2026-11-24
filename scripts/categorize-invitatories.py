import json,re,pathlib,collections,csv
root=pathlib.Path(__file__).resolve().parents[1]
h=json.loads((root/'data/index.json').read_text())['hymns']
rows=[]
for x in h:
 if x.get('hour')!='inv':continue
 m=str(x.get('mode','')).strip(); n=re.sub(r'\s+','',m).lower()
 family='IV' if n in ('4','4*') else n if n in ('1','2','3','5','6','7','8') else 'unclassified'
 rows.append({'name':x.get('name',''),'id':x.get('id',''),'file':x.get('file',''),'original_mode':m,'mode_family':family,'variant':'starred' if n=='4*' else 'unspecified','psalm94_pairing':'not independently verified','book':x.get('book','')})
with (root/'data/invitatory-mode-catalogue.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
(root/'data/invitatory-mode-catalogue.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False))
ps=[];other=[]
for p in (root/'gabc').rglob('*.gabc'):
 t=p.read_text(errors='replace');head=t.split('%%')[0].lower()
 if 'psalmus invitatorius' in head or 'psalmus 94' in head:ps.append(str(p.relative_to(root)))
 elif 'exsul' in t.lower() and 'ven' in t.lower():other.append(str(p.relative_to(root)))
(root/'data/psalm94-score-inventory.json').write_text(json.dumps({'explicit_psalm94_scores':ps,'other_files_containing_venite_and_exsul':other,'caution':'Other files may contain antiphon phrases, not complete psalm tones.'},indent=2))
c=collections.Counter(r['mode_family'] for r in rows)
lines=['# Invitatory classification audit','',f'Antiphon entries: {len(rows)}','', '## Antiphon mode families',*[f'- {k}: {v}' for k,v in sorted(c.items())],'',f'Explicit complete Psalm 94 GABC files: {len(ps)}',*[f'- {p}' for p in ps],f'Other GABC files containing Venite/exsul: {len(other)}',*[f'- {p}' for p in other],'','Antiphon mode is not sufficient to identify its prescribed Venite psalm tone. Unclassified e/d modes are preserved. No additional complete psalm score was certified by this metadata scan.','', 'See data/invitatory-mode-catalogue.csv and data/psalm94-score-inventory.json.']
(root/'INVITATORY_CATEGORIZATION_AUDIT.md').write_text('\n'.join(lines)+'\n')
print('\n'.join(lines[:20]))
