"""Render the complete boxed passage for RT 1-Student Reading 2 from its source PDF.

First render upload/ENGL010_Supplemental Reading Tests 5_Student.docx with
render_docx.py --emit_pdf, then pass the resulting PDF as the sole argument.
"""
from pathlib import Path
import json,sys
import fitz
from PIL import Image

document=fitz.open(sys.argv[1])
index=next(i for i,p in enumerate(document) if 'Thailand is a wonderful place' in p.get_text())
page=document[index]
question_top=min(r.y0 for r in page.search_for('What is the BEST TITLE'))
horizontal=[d['rect'] for d in page.get_drawings() if d['rect'].width>400 and 30<d['rect'].y0<question_top and d['rect'].height<1]
assert len(horizontal)==2, 'Expected top and bottom borders of the passage box'
rect=fitz.Rect(min(r.x0 for r in horizontal)-6,min(r.y0 for r in horizontal)-3,max(r.x1 for r in horizontal)+6,max(r.y1 for r in horizontal)+6)
assert rect.y1<question_top
# All source passage spans, including the title blank and printed line numbers, fit.
for block in page.get_text('dict')['blocks']:
 for line in block.get('lines',[]):
  for span in line['spans']:
   bounds=fitz.Rect(span['bbox'])
   if horizontal[0].y0-1<=bounds.y0 and bounds.y1<=max(r.y1 for r in horizontal)+1:
    assert rect.contains(bounds),span['text']
pixmap=page.get_pixmap(matrix=fitz.Matrix(2.5,2.5),clip=rect,alpha=False)
output=Path('reading-images/b1-2-1-complete.webp')
Image.frombytes('RGB',[pixmap.width,pixmap.height],pixmap.samples).save(output,'WEBP',quality=92)
Image.open(output).verify()
path=Path('reading-tests.json');tests=json.loads(path.read_text());reading=next(t for t in tests if t['id']==2)
reading['sourceImages']=[str(output)]
reading['sourceImageInfo']=[{'sourcePage':index+1,'crop':list(rect)}]
path.write_text(json.dumps(tests,ensure_ascii=False,separators=(',',':')))
print('Complete passage:',output,rect,pixmap.width,pixmap.height)
