"""Rebuild the passage PDF with its original text positions and unclipped diagrams.
Run after preparing and converting the clean b1-15 DOCX, before generating WebP.
"""
import fitz,os
p='/tmp/clean-passage-pdfs/b1-15.pdf';source=fitz.open('/tmp/reading-pdfs/ENGL010_Supplemental Reading Tests 5_Student.pdf');original=source[29];out=fitz.open();page=out.new_page(width=original.rect.width,height=original.rect.height);fonts={}
for name,suffix in [('LiberationSerif','Regular'),('LiberationSerif-Italic','Italic'),('LiberationSerif-Bold','Bold')]:
 font='/usr/share/fonts/opentype/urw-base35/NimbusRoman-'+suffix+'.otf';alias='font'+str(len(fonts));page.insert_font(fontname=alias,fontfile=font);fonts[name]=(alias,fitz.Font(fontfile=font))
for block in original.get_text('dict')['blocks']:
 if block['type']==1:
  rect=fitz.Rect(block['bbox'])
  if rect.y0>550:continue
  if rect.x0>400:rect=fitz.Rect(rect.x0,570,rect.x1,570+rect.height)
  image='diagram3.png' if rect.x0>400 else 'diagram1.jpg' if rect.height>80 else 'diagram2.png'
  page.insert_image(rect,filename=image);continue
 for line in block['lines']:
  text=''.join(s['text'] for s in line['spans'])
  if line['bbox'][1]>550:continue
  dy=-23 if 'diagram 2:' in text else 220 if 'diagram 3:' in text else 0
  for span in line['spans']:
   x,y=span['origin'];alias,font=fonts[span['font']];width=font.text_length(span['text'],fontsize=span['size']);scale=(span['bbox'][2]-span['bbox'][0])/width if width else 1;point=fitz.Point(x,y+dy);page.insert_text(point,span['text'],fontname=alias,fontsize=span['size'],color=(0,0,0),morph=(point,fitz.Matrix(scale,1)))
page.draw_rect(fitz.Rect(36,29,565,655),color=(0,0,0),width=.4)
out.save(p+'.fixed');source.close();out.close();os.replace(p+'.fixed',p)

from PIL import Image

with fitz.open(p) as doc:
 pix=doc[0].get_pixmap(matrix=fitz.Matrix(1.7,1.7),clip=fitz.Rect(25,20,570,660),alpha=False)
 im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples);im.save('reading-images/b1-15-1.webp','WEBP',quality=85);im.save('/tmp/driving-final-verified.png')
