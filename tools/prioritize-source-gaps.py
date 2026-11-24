import json,csv,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
d=json.loads((root/'data/complete-reconciliation.json').read_text())
gaps=json.loads((root/'data/source-confirmed-gaps.json').read_text())
lookup={(x['category'],x['slot']):x for x in gaps}
rows=[]
for s in d['slots']:
 if s['status']=='populated': continue
 k=(s['category'],s['key']); g=lookup.get(k,{})
 a=s.get('sameHourCandidates') or []
 b=s.get('uncategorizedHourCandidates') or []
 # Printed-title gaps take priority over automated candidate similarity.
 priority='1 - printed source identified' if g.get('expected') else ('2 - candidate needs rubric verification' if a else ('3 - missing-hour candidate' if b else '4 - source not identified'))
 rows.append({'priority':priority,'category':s['category'],'section':s['path'],'slot':s['key'],'expected_title':g.get('expected',''),'printed_page':g.get('printedPage',''),'pdf_page':g.get('pdfPage',''),'same_hour_candidates':'; '.join(x.get('name','')+' ['+x.get('file','')+']' for x in a),'missing_hour_candidates':'; '.join(x.get('name','')+' ['+x.get('file','')+']' for x in b),'status':'MISSING GABC' if g.get('expected') else 'UNCHECKED - needs source comparison','note':g.get('note','')})
rows.sort(key=lambda x:(x['priority'],x['section'],x['slot']))
out=root/'data/missing-score-priority.csv'
with out.open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
(root/'data/missing-score-priority.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
from collections import Counter
c=Counter(x['priority'] for x in rows)
report='# Remaining liturgical slots — source-priority review\n\nThis is a diagnostic inventory, **not a claim of new GABC imports or verified placements**. Existing candidate names are suggestions only. Printed-source titles are taken from previously documented PDF comparisons; they still require a matching musical score.\n\n'
report+=f'**{len(rows)} unfilled slots** of {d["summary"]["definedSlots"]} defined; {d["summary"]["populated"]} populated.\n\n'
for k,v in sorted(c.items()):report+=f'- {k}: {v}\n'
report+='\n## Source-identified missing scores\n\n| Section | Slot | Expected score | Printed page |\n|---|---|---|---|\n'
for r in rows:
 if r['expected_title']:report+=f"| {r['section']} | {r['slot']} | {r['expected_title']} | {r['printed_page']} |\n"
report+='\nAll remaining slots and candidate filenames are in `data/missing-score-priority.csv`. Do not automatically substitute a same-hour chant unless the printed rubric authorizes it.\n'
(root/'MISSING_SCORE_PRIORITY.md').write_text(report)
print(len(rows),dict(c))
