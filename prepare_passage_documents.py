from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from copy import deepcopy
from lxml import etree
import json,re
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
OUT=Path('/tmp/clean-passage-docx');OUT.mkdir(exist_ok=True)
C=json.loads(Path('other-reading-tests-full.json').read_text())
references={('other-1-teacher',3):(3,2),('other-1-teacher',14):(8,7),('other-2-teacher',1):(4,3),('other-2-teacher',2):(4,3),('other-3-teacher',5):(8,6),('other-3-student',9):(7,8)}
def document(source,tableindex,rows,name,fix=None):
 with ZipFile(source) as z:
  root=etree.fromstring(z.read('word/document.xml'));body=root.find(W+'body');tables=body.findall(W+'tbl');table=deepcopy(tables[tableindex])
  for r in table.findall(W+'tr')[rows:]:table.remove(r)
  if fix:
   a,b=fix
   for p in table.iter(W+'p'):
    nodes=list(p.iter(W+'t'));text=''.join(n.text or '' for n in nodes)
    m=re.search(r'See question ('+str(a)+r')\.',text,re.I)
    if not m:continue
    start,end=m.span(1);offset=0
    for n in nodes:
     t=n.text or '';left=max(0,start-offset);right=min(len(t),end-offset)
     if left<right:n.text=t[:left]+(str(b) if offset<=start<offset+len(t) else '')+t[right:]
     offset+=len(t)
  sect=deepcopy(body.find(W+'sectPr'))
  for child in list(sect):
   if child.tag in [W+'headerReference',W+'footerReference',W+'type',W+'pgNumType']:sect.remove(child)
  for child in list(body):body.remove(child)
  body.append(table);body.append(etree.Element(W+'p'));body.append(sect)
  output=OUT/(name+'.docx')
  with ZipFile(output,'w',ZIP_DEFLATED) as out:
   for member in z.infolist():out.writestr(member,etree.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True) if member.filename=='word/document.xml' else z.read(member.filename))
for c in C:
 for t in c['tests']:document(Path('upload')/c['filename'],t['sourceTable'],t['sourceRows'],c['id']+'-'+str(t['id']),references.get((c['id'],t['id'])))
for i in range(18):document(Path('upload/ENGL010_Supplemental Reading Tests 5_Student.docx'),i,1,'b1-'+str(i+1))
print('Prepared 80 clean passage documents.')
