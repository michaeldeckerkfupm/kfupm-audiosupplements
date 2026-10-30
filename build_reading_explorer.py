"""Import the supplied Reading Explorer DOCX exercises without exposing teacher key pages."""
from pathlib import Path
from docx import Document
from docx.text.paragraph import Paragraph
from docx.table import Table
from lxml import etree
import json,re,base64,io
from PIL import Image
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
R='{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
A='{http://schemas.openxmlformats.org/drawingml/2006/main}'
OUT=Path('explorer-data');OUT.mkdir(exist_ok=True)
def norm(s):return re.sub(r'\s+',' ',s).strip()
def images(n,doc):
 out=[]
 for b in n.iter(A+'blip'):
  rel=b.get(R+'embed')
  if rel:
   part=doc.part.related_parts[rel]; im=Image.open(io.BytesIO(part.blob)).convert('RGB');im.thumbnail((1000,1400));stream=io.BytesIO();im.save(stream,'WEBP',quality=85);out.append('data:image/webp;base64,'+base64.b64encode(stream.getvalue()).decode())
 return out

def choices(table):
 cells=[];seen=set()
 for row in table.rows:
  for cell in row.cells:
   if cell._tc in seen:continue
   seen.add(cell._tc);s=norm(cell.text)
   if s:cells.append(s)
 pairs=[];i=0
 while i<len(cells):
  m=re.match(r'^([a-z])\.[ \t]*(.*)$',cells[i],re.I)
  if m:
   text=m[2]
   if not text and i+1<len(cells):i+=1;text=cells[i]
   pairs.append({'label':m[1].upper(),'text':text})
  else:pairs.append({'text':cells[i]})
  i+=1
 return pairs

def parse(path,book):
 doc=Document(path);sections=[];section=None;question=None;answer=False;keys={};alternatives={};last_key=None;allq=[]
 for n in doc.element.body:
  if n.tag==W+'sectPr':continue
  if n.tag==W+'p':
   p=Paragraph(n,doc);text=norm(p.text)
   if text=='Answer Section':answer=True;continue
   if answer:
    m=re.match(r'^(\d+)\.\s*ANS:\s*(.*?)(?:\s*PTS:.*)?$',text)
    if m:
     last_key=int(m[1]);keys[last_key]=m[2].strip();alternatives[last_key]=[keys[last_key]] if keys[last_key] else []
    elif last_key and text and not re.match(r'^(PTS:|REF:|OBJ:|TOP:)',text):
     alternatives[last_key].append(text)
     if not keys[last_key]:keys[last_key]=text
    elif text.startswith('PTS:'):last_key=None
    continue
   if text.startswith('DIRECTIONS:'):
    section={'id':len(sections),'instructions':text.replace('DIRECTIONS:','',1).strip(),'paragraphs':[],'images':[],'bank':[],'tables':[],'questions':[],'title':''};sections.append(section);question=None;continue
   if section is None:continue
   m=re.match(r'^(?:_{2,}\s*)?(\d+)\.\s*(.+)$',text)
   if m:
    question={'number':int(m[1]),'stem':m[2],'options':[],'section':section['id']};section['questions'].append(question);allq.append(question)
    targets=''.join(run.text for run in p.runs if run.italic or run.underline).strip()
    if targets and len(targets)<100 and targets in question['stem']:question['target']=targets
   elif question:
    if text and not re.fullmatch(r'_+',text):question['stem']+='\n'+text
    extra=images(n,doc)
    if extra:question.setdefault('images',[]).extend(extra)
   elif text:
    if not section['title'] and not text.startswith('[') and len(text)<100:section['title']=text
    else:section['paragraphs'].append(text)
   if question is None:section['images'].extend(images(n,doc))
  elif n.tag==W+'tbl':
   opts=choices(Table(n,doc))
   if section is None:continue
   rows=[[norm(c.text) for c in row.cells] for row in Table(n,doc).rows]
   if question and opts and any('label' in o for o in opts):question['options']=opts
   elif question:question.setdefault('tables',[]).append(rows)
   else:section['bank']=opts;section['tables'].append(rows)
 for section in sections:
  for q in section['questions']:
   key=keys.get(q['number']);assert key is not None,(path,q['number'],'missing key')
   if not q['options']:
    q['options']=[dict(o) for o in section['bank']]
    if not q['options'] and key in ['T','F'] and re.search(r'true|false',section['instructions'],re.I):q['options']=[{'label':'T','text':'True'},{'label':'F','text':'False'}]
    elif not q['options'] and key in ['F','S'] and re.search(r'fact|speculation',section['instructions'],re.I):q['options']=[{'label':'F','text':'Fact'},{'label':'S','text':'Speculation'}]
    elif not q['options'] and key in ['Y','N'] and re.search(r'yes|no',section['instructions'],re.I):q['options']=[{'label':'Y','text':'Yes'},{'label':'N','text':'No'}]
   labels=[v.strip() for v in key.split(',')] if re.fullmatch(r'[A-Z](?:,\s*[A-Z])+',key) else [key]
   indices=[]
   for label in labels:
    match=next((i for i,o in enumerate(q['options']) if o.get('label')==label),None)
    if match is None:match=next((i for i,o in enumerate(q['options']) if o['text'].casefold()==label.casefold()),None)
    if match is not None:indices.append(match)
   if len(indices)==len(labels) and len(q['options'])>=2:
    q['type']='multi' if len(indices)>1 else 'choice';q['key']=indices[0];
    if len(indices)>1:q['keys']=indices
   else:
    q['type']='text' if key else 'reflection';q['answer']=key;q['options']=[]
   q['acceptedAnswers']=alternatives.get(q['number'],[key]);q['sourceKey']=key;q['context']=section['instructions'];q['passage']=section['id']
   q['options']=[{'text':o['text']} for o in q['options']]
   q.pop('section',None)
  section['title']=section['title'] or ('Vocabulary' if 'word' in section['instructions'].lower() or 'vocabulary' in section['instructions'].lower() else 'Practice')
 unit=path.stem.replace('unit-','').upper()
 assert len(allq)==len(keys),(path,'key count mismatch',len(allq),len(keys))
 return {'id':unit,'label':'Unit '+unit,'title':'Reading Explorer '+str(book)+' · Unit '+unit,'questions':allq,'vocabulary':[],'paragraphs':[],'passages':[{k:v for k,v in s.items() if k!='questions'} for s in sections]}
if __name__=='__main__':
 errors=[]
 for book in [2,3]:
  data=[]
  paths=sorted(Path('upload/reading-explorer/book'+str(book)).glob('*.docx'),key=lambda p:(int(re.search(r'\d+',p.stem)[0]),p.stem[-1]))
  for path in paths:
   try:data.append(parse(path,book))
   except Exception as e:errors.append(str(e))
  (OUT/('book'+str(book)+'.json')).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
  print('Book',book,':',len(data),'units,',sum(len(t['questions']) for t in data),'questions')
 for e in errors:print('ERROR',e)
