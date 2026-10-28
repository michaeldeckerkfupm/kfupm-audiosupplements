from pathlib import Path
from docx import Document
import json,re,fitz
OUT=Path('reading-images');OUT.mkdir(exist_ok=True)
def norm(s):return re.sub(r'[^a-z0-9]','',s.lower())
def phrase(s,n=9,end=False):
 words=s.split();return ' '.join(words[-n:] if end else words[:n])
def findpage(doc,needle,after=0):
 n=norm(needle)
 for i in range(after,len(doc)):
  if n in norm(doc[i].get_text()):return i
 return None
def sourcebody(raw):
 parts=[x.strip() for x in re.split(r'\n\s*\n',raw) if x.strip()]
 # The first substantial paragraph is more robust than a title or placeholder.
 first=next(x for x in parts if len(x)>120)
 first=re.sub(r'^_+\s*\([^)]*\)\s*','',first)
 return first,parts[-1]
def render(doc,raw,name,questions):
 first,last=sourcebody(raw)
 start=findpage(doc,phrase(first,11))
 if start is None:start=findpage(doc,phrase(first,6))
 assert start is not None,(name,'start',first[:80])
 end=findpage(doc,phrase(last,11,True),start)
 if end is None:end=findpage(doc,phrase(last,6,True),start)
 assert end is not None and end-start<=2,(name,'end',last[-100:])
 paths=[];info=[]
 for pi in range(start,end+1):
  page=doc[pi];top=65 if pi==start else 35;bottom=page.rect.height-45
  if pi==end:
   boxes=page.search_for(phrase(last,6,True))
   if boxes:bottom=min(bottom,max(b.y1 for b in boxes)+12)
  # Never include questions or teacher answer markings in the passage image.
  for q in questions[:1]:
   boxes=page.search_for(phrase(q['stem'],7))
   boxes=[b for b in boxes if b.y0>top+30]
   if boxes:bottom=min(bottom,min(b.y0 for b in boxes)-10)
  assert bottom>top+10,(name,pi,bottom)
  rect=fitz.Rect(25,top,page.rect.width-25,bottom)
  img=page.get_pixmap(matrix=fitz.Matrix(1.8,1.8),clip=rect,alpha=False)
  output=OUT/(name+'-'+str(pi-start+1)+'.webp')
  from PIL import Image
  image=Image.frombytes('RGB',[img.width,img.height],img.samples);temporary=output.with_suffix('.tmp');image.save(temporary,'WEBP',quality=88);temporary.replace(output)
  paths.append(str(output));info.append({'sourcePage':pi+1,'crop':[rect.x0,rect.y0,rect.x1,rect.y1]})
 return paths,info
collections=json.loads(Path('other-reading-tests.json').read_text())
report=[]
for c in collections:
 doc=fitz.open('/tmp/reading-pdfs/'+c['filename'].replace('.docx','.pdf'))
 for t in c['tests']:
  paths,info=render(doc,t['sourceText'],c['id']+'-'+str(t['id']),t['questions'])
  t['sourceImages']=paths;t['sourceImageInfo']=info;report.append((c['id'],t['id'],paths,info))
Path('other-reading-tests.json').write_text(json.dumps(collections,ensure_ascii=False,separators=(',',':')))
D=Document('upload/ENGL010_Supplemental Reading Tests 5_Student.docx');doc=fitz.open('/tmp/reading-pdfs/ENGL010_Supplemental Reading Tests 5_Student.pdf');tests=json.loads(Path('reading-tests.json').read_text())
for i,t in enumerate(tests):
 raw=max((c.text for c in D.tables[i].rows[0].cells),key=len)
 paths,info=render(doc,raw,'b1-'+str(i+1),t['questions'])
 t['sourceImages']=paths;t['sourceImageInfo']=info;report.append(('b1',i+1,paths,info))
Path('reading-tests.json').write_text(json.dumps(tests,ensure_ascii=False,separators=(',',':')))
Path('reading-image-crops.json').write_text(json.dumps(report,indent=2))
print('Rendered',len(report),'readings into',len(list(OUT.glob('*.webp'))),'source images.')
