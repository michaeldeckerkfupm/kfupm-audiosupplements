from pathlib import Path
import json,re,fitz
from PIL import Image,ImageDraw
OUT=Path('reading-images');OUT.mkdir(exist_ok=True)
C=json.loads(Path('other-reading-tests-full.json').read_text());B=json.loads(Path('reading-tests.json').read_text());used=set()
def build(name,sourceText=None):
 doc=fitz.open('/tmp/clean-passage-pdfs/'+name+'.pdf');images=[];records=[];prev=None
 for pi,page in enumerate(doc):
  if not re.search(r'[A-Za-z]{3}',page.get_text()):continue
  textlines=[]
  for block in page.get_text('dict')['blocks']:
   if block['type']!=0:continue
   for line in block['lines']:
    text=''.join(span['text'] for span in line['spans']).strip()
    if text:textlines.append((fitz.Rect(line['bbox']),text))
  if not textlines:continue
  bounds=fitz.Rect(textlines[0][0])
  for rect,text in textlines:bounds|=rect
  for block in page.get_text('dict')['blocks']:
   if block['type']==1:bounds|=fitz.Rect(block['bbox'])
  crop=fitz.Rect(25,max(20,bounds.y0-10),page.rect.width-25,min(page.rect.height-20,bounds.y1+12))
  pix=page.get_pixmap(matrix=fitz.Matrix(1.7,1.7),clip=crop,alpha=False)
  path=OUT/(name+'-'+str(len(images)+1)+'.webp');temporary=path.with_suffix('.tmp');Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(temporary,'WEBP',quality=85);temporary.replace(path);used.add(path.name);images.append(str(path))
  markers=[(r,s) for r,s in textlines if r.x0<90 and re.fullmatch(r'\d{1,2}',s)]
  margin=max((r.x1 for r,s in markers),default=60)+3
  body=sorted([(r,s) for r,s in textlines if r.x0>=margin],key=lambda item:(round(item[0].y0/2)*2,item[0].x0))
  combined=[{'y':r.y0,'text':text,'number':None} for r,text in body]
  for mr,ms in markers:
   hit=next((line for line in combined if abs(line['y']-mr.y0)<2),None)
   if hit:hit['number']=int(ms)
   else:combined.append({'y':mr.y0,'text':'','number':int(ms)})
  combined.sort(key=lambda line:line['y']);anchors=sorted((r.y0,int(text)) for r,text in markers)
  for line in combined:
   y=line['y']
   if re.fullmatch(r'_+\s*\(See (?:question 1\.|the appropriate question\.)\)',line['text'],re.I) and not records:continue
   if records and prev is not None and abs(y-prev)<2:records[-1]['text']+=' '+line['text']
   else:records.append({'number':line['number'],'text':line['text'],'gap':prev is not None and y-prev>20})
   prev=y
 anchors=[(i,line['number']) for i,line in enumerate(records) if line['number'] is not None]
 for i,line in enumerate(records):
  preceding=[anchor for anchor in anchors if anchor[0]<=i]
  anchor=preceding[-1] if preceding else (anchors[0] if anchors else (0,1))
  line['line']=max(1,anchor[1]+i-anchor[0])
 for line in records:line['text']=line['text'].replace('4 0C','4°C').replace('40C','4°C').replace('600 0C','600°C').replace('-247 0C','-247°C').replace('km2','km²')
 return images,records
lineChanges=[]
for c in C:
 for t in c['tests']:
  images,lines=build(c['id']+'-'+str(t['id']));t['sourceImages']=images;t['sourceLines']=lines;t.pop('sourceImageInfo',None)
  for qi,q in enumerate(t['questions']):
   target=q.get('target');reference=re.search(r'\bLine (\d+)\b',q['stem'],re.I)
   if not target or not reference:continue
   candidates=[line for line in lines if re.search(r'(?<!\w)'+re.escape(target)+r'(?!\w)',line['text'],re.I)]
   if not candidates:continue
   old=int(reference[1]);match=min(candidates,key=lambda line:abs(line['line']-old));new=match['line']
   if new!=old:
    q['stem']=q['stem'][:reference.start(1)]+str(new)+q['stem'][reference.end(1):];q['sourceStem']=q['stem'];lineChanges.append((c['id'],t['id'],qi+1,target,old,new))
  for q in t['questions']:
   # A question or its choices must never leak into the passage.
   assert q['stem'] not in t['sourceText'] or len(q['stem'])<20,(c['id'],t['id'],'question in passage')
for i,t in enumerate(B):t['sourceImages'],_=build('b1-'+str(i+1))
Path('other-reading-tests-full.json').write_text(json.dumps(C,ensure_ascii=False,separators=(',',':')));Path('reading-tests.json').write_text(json.dumps(B,ensure_ascii=False,separators=(',',':')))
Path('reading-line-reference-changes.json').write_text(json.dumps(lineChanges,ensure_ascii=False,indent=2))
for path in OUT.glob('*.webp'):
 if path.name not in used:path.unlink()
files=sorted(OUT.glob('*.webp'))
for batch in range((len(files)+11)//12):
 sheet=Image.new('RGB',(1200,1320),'#eaf2ee');draw=ImageDraw.Draw(sheet)
 for i,path in enumerate(files[batch*12:(batch+1)*12]):
  image=Image.open(path);image.load();image.thumbnail((380,300));x=(i%3)*400+10;y=(i//3)*330+24;sheet.paste(image,(x,y));draw.text((x,y-17),path.name,fill='black')
 sheet.save('source-contact-'+str(batch)+'.png')
print('Prepared',len(files),'clean passage images. Updated',len(lineChanges),'word references to match the printed positions.')
