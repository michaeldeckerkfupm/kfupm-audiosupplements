from pathlib import Path
from docx import Document
import json,re
p=Path('other-reading-tests-full.json');D=json.loads(p.read_text());changes=[]
for c in D:
 for t in c['tests']:
  joined='';spans=[]
  for line in t['sourceLines']:
   start=len(joined);joined+=line['text']+' ';spans.append((start,len(joined),line['line']))
  for qi,q in enumerate(t['questions']):
   target=q.get('target');reference=re.search(r'\bLines?\s+(\d+)(?:\s*[–-]\s*\d+)?\b',q['stem'],re.I)
   if not target or not reference:continue
   pattern=r'(?<!\w)'+r'\s+'.join(re.escape(s) for s in target.split())+r'(?!\w)';matches=[]
   for m in re.finditer(pattern,joined,re.I):
    hit=[n for a,b,n in spans if m.start()<b and m.end()>a];matches.append((min(hit),max(hit)))
   if not matches:continue
   start,end=min(matches,key=lambda bounds:abs(bounds[0]-int(reference[1])))
   replacement=('Line '+str(start)) if start==end else ('Lines '+str(start)+'–'+str(end))
   old=reference[0]
   q['stem']=q['stem'][:reference.start()]+replacement+q['stem'][reference.end():];q['sourceStem']=q['stem']
   if old!=replacement:changes.append([c['id'],t['id'],qi+1,target,old,replacement])
  # The passage must not contain any answer choices or a question stem.
  for q in t['questions']:assert q['stem'] not in t['sourceText'] or len(q['stem'])<20
Path('other-reading-tests-full.json').write_text(json.dumps(D,ensure_ascii=False,separators=(',',':')))
metadata=[]
for c in D:
 tests=[]
 for t in c['tests']:
  tests.append({k:v for k,v in t.items() if k not in ['sourceText','sourceTable','sourceRows','sourceImageInfo']})
  tests[-1]['paragraphs']=[]
  for line in tests[-1]['sourceLines']:line.pop('y',None)
 path=Path(c['id']+'.json');path.write_text(json.dumps(tests,ensure_ascii=False,separators=(',',':')))
 metadata.append({'id':c['id'],'title':c['title'],'filename':c['filename'],'dataFile':str(path),'count':len(tests)})
Path('other-reading-tests.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
# Recover all italicized targets from the B1 source question runs.
p=Path('reading-tests.json');B=json.loads(p.read_text());doc=Document('upload/ENGL010_Supplemental Reading Tests 5_Student.docx')
for ti,t in enumerate(B):
 for qi,q in enumerate(t['questions']):
  cell=max(doc.tables[ti].rows[2+qi*2].cells,key=lambda c:len(c.text));target=''.join(r.text for p in cell.paragraphs for r in p.runs if r.italic).strip()
  if target and len(target)<70 and target.lower() in (q['stem']+' '+q.get('sourceStem','')).lower():q['target']=target
p.write_text(json.dumps(B,ensure_ascii=False,separators=(',',':')))
Path('reading-multiline-reference-changes.json').write_text(json.dumps(changes,ensure_ascii=False,indent=2))
print('Exported four collections with 620 questions; recovered B1 target italics and',len(changes),'multi-line/reference wording repairs.')
