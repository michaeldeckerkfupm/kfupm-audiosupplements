"""Documented corrections applied after importing the supplied teaching resource."""
from pathlib import Path
import json,base64
from docx import Document
p=Path('reading-tests.json');tests=json.loads(p.read_text())
def q(r,n):return tests[r-1]['questions'][n-1]
q(5,4)['key']=2
q(5,4)['options'][0]['text']='belonged to an Algonquian-speaking tribe'
q(6,5)['key']=3
q(15,10)['key']=3
q(17,6)['stem']='Which picture shows a cannon?'
q(17,6)['sourceStem']='Which picture shows a cannon (Line 19)?'
q(17,6)['target']='cannon'
q(17,6)['options'][q(17,6)['key']]['image']='assets/cannon-single.webp'
q(4,2)['options'][2]['text']='used to be the world’s tallest structure'
q(7,6)['stem']='In the passage, Ralph Lauren is named as ______.'
q(7,6)['options'][3]['text']='a brand sold in Dubai Mall'
q(8,8)['options'][3]['text']='65% of people aged 18–24 are unemployed'
q(12,9)['stem']='Which year does the passage give for penicillin being in common use?'
q(4,10)['options'][3]['text']='you have to wait a long time to enter'
q(6,3)['options'][3]['text']='Why London has the biggest population in the United Kingdom.'
q(10,9)['stem']='A building’s foundations are ______.'
q(13,8)['stem']=q(13,8)['stem'].replace('the mammal','the mammoth')
q(13,10)['stem']=q(13,10)['stem'].replace('over, means','over means')
quotes={
(1,2):('many','Many find it difficult being so far from home'),
(1,6):('it','It might sound difficult now, but for most students it becomes normal after a few months.'),
(2,5):('which','the town, which is 105 kilometres from Bangkok'),
(3,2):('which','Mesopotamia, which lies in what is now modern-day Iraq'),
(4,6):('which','the French government was holding a competition, which was for the best design'),
(5,9):('which','Rolfe’s farm, which was where their son, Thomas Rolfe, was born'),
(6,5):('which','the population of Cardiff, which is 362,756'),
(7,2):('it','it is famous throughout the world as a city for tourists to visit'),
(8,2):('which','there’s a competition to decide which is best'),
(9,3):('which','Scotland, which is one of the countries in the UK'),
(9,10):('which','the Edinburgh Festival, which takes place for two weeks every June'),
(10,3):('which','an experiment, the purpose of which was to show'),
(10,6):('him','The study said that it was more likely to be him'),
(11,3):('It','It would all go back into space.'),
(12,6):('It','It could also be given to animals without negative effects.'),
(13,4):('it','it is located in northwestern Siberia'),
(14,5):('it','The Roman Empire, controlling most of Italy and Corsica, was smaller, but it was growing.'),
(15,7):('which','horse-drawn carts (see diagram 2) which had been loaded with quarried stone'),
(16,3):('It','It is common in the Indian Ocean'),
(17,9):('They','They cut Blackbeard’s head off'),
(18,4):('They','They told his mother there was something wrong with him.'),
(18,8):('It','It made him a lot of money.')}
for (r,n),(word,quote) in quotes.items():
 q(r,n)['stem']='What does “'+word+'” refer to in the quoted text?';q(r,n)['quote']=quote
replacements={5:[('widower- his','widower: his')],3:[('By the 11 century','By the 11th century')],4:[('on the 6 of May','on 6 May'),('By the 26 of May','By 26 May')],6:[('which is the best to live in.','which is the best to live in?'),('Scotland is the coldest and wettest city','Edinburgh is the coldest and wettest city')],7:[('more than 80 million visitors shopping','more than 80 million visitors shopped')],8:[('rain and freezing wind blows','rain and freezing wind blow')],11:[('The amounts of some greenhouse gases in the atmosphere is increasing','The amounts of some greenhouse gases in the atmosphere are increasing')],12:[('antibiotic), changed','antibiotic) changed'),('staphyloccus','Staphylococcus')],13:[('km2','km²')],17:[('pirates- lawyers','pirates: lawyers')],18:[('February 11 1847','February 11, 1847'),('October 18 1931','October 18, 1931')]}
for r,changes in replacements.items():
 for a,b in changes:tests[r-1]['paragraphs']=[v.replace(a,b) for v in tests[r-1]['paragraphs']]
# Restore the three diagrams explicitly referenced in Reading 15.
D=Document('upload/ENGL010_Supplemental Reading Tests 5_Student.docx');seen=set();diagrams=[]
for c in D.tables[14].rows[0].cells:
 if c._tc in seen:continue
 seen.add(c._tc)
 for b in c._tc.xpath('.//a:blip'):
  part=D.part.related_parts[b.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')]
  diagrams.append({'image':'data:'+part.content_type+';base64,'+base64.b64encode(part.blob).decode(),'caption':'Diagram '+str(len(diagrams)+1)})
assert len(diagrams)==3
tests[14]['diagrams']=diagrams
p.write_text(json.dumps(tests,ensure_ascii=False,separators=(',',':')))
# Guidebook vocabulary precision and coherent source links.
p=Path('reading-guide.json');G=json.loads(p.read_text())

if 'because they did not have paper' not in G['skills'][1]['practices'][1]['paragraphs'][0]:
 G['skills'][1]['practices'][1]['paragraphs'][0]+=' However, because they did not have paper, they wrote on stone.'
p1=G['skills'][7]['practices'][0];p1['questions'][0]['options'][0]='less heavy';p1['questions'][0]['explanation']='The passage explains that papyrus was easier to carry because it weighed less. “Lighter” means less heavy.'
p1=G['skills'][9]['practices'][0];p1['questions'][0]['options'][3]='let out';p1['questions'][0]['explanation']='The passage describes gases entering the atmosphere. Here, “released” means let out into the atmosphere; releasing a gas is not the same as producing it.'
p1['questions'][1]['options'][0]='regular ways in which weather behaves'
G['skills'][11]['example'][2]='Q. On which line do the words “Tigris and Euphrates” appear?'
G['skills'][11]['example'][-1]='Explanation: The words “Tigris and Euphrates” appear on numbered line 3. The sentence continues onto line 4.'
G['skills'][11]['practices'][0]['questions'][1]['options'][3]='Line 4'
p.write_text(json.dumps(G,ensure_ascii=False,indent=2)+'\n')
print('Applied documented source and conversion corrections.')
