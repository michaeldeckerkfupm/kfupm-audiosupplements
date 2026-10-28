from pathlib import Path
import json,re
p=Path('other-reading-tests-full.json');D=json.loads(p.read_text())
def q(c,r,n):return D[c-1]['tests'][r-1]['questions'][n-1]
def option(c,r,n,i,text):q(c,r,n)['options'][i]={'text':text}
def stem(c,r,n,text):q(c,r,n)['stem']=text;q(c,r,n)['sourceStem']=text
# Teacher 1: supplied key errors and competing/unsupported choices.
q(1,4,3)['key']=0
q(1,13,1)['key']=3
q(1,14,8)['key']=0
q(1,20,1)['key']=1
q(1,21,1)['key']=2
q(1,22,1)['key']=0
q(1,23,5)['key']=2
option(1,23,5,3,'the ship was believed to be unsinkable')
option(1,1,10,1,'toys can only be used by children')
option(1,2,4,3,'chocolate and other sugary snacks')
stem(1,3,3,'In Line 9, the rim of a bottle is its ______.')
q(1,3,3)['target']='rim'
q(1,3,3)['options']=[{'text':s} for s in ['top edge around the opening','widest part of the body','base on which it stands','liquid inside']]
option(1,3,10,2,'hurt people');option(1,3,10,3,'stop people from feeling pain')
option(1,5,7,2,'works only when you are using the Internet')
option(1,8,10,0,'never need to be refuelled')
stem(1,9,6,'According to the passage, a seamount (Line 7) is ______.')
stem(1,11,4,'Which source does Paragraph One identify as the main present-day danger to clean air?')
option(1,11,4,0,'traffic emissions')
stem(1,11,10,'How does the passage describe the measurement of air quality?')
q(1,11,10)['options']=[{'text':s} for s in ['It is measured continuously.','It is measured only once a year.','It used to be measured but is not measured now.','It is measured only near roads.']]
stem(1,13,4,'Instead of having to walk to a pay phone... (Lines 19–20). They probably walked to a pay phone to ______.')
option(1,13,7,2,'fixed and definite')
stem(1,14,5,'Which picture shows the road vehicle used to transport food?')
option(1,14,6,0,'is grown elsewhere when it is not locally in season')
option(1,14,8,0,'causes fewer carbon emissions through food choices')
stem(1,15,7,'What does the passage say about Bob’s education?')
q(1,15,7)['options']=[{'text':s} for s in ['He learns every subject without help.','He is home-schooled for most subjects.','He attends a university full time.','He studies only computer classes at school.']]
option(1,17,9,1,'Identity theft rose by almost one-fifth last year.')
option(1,19,5,2,'planes create more CO₂ than other forms of public transport')
# Teacher 2: replace a circular answer that fails to name the requested ingredients.
option(2,8,2,2,'flour and water')
# Teacher 3: make the orbital hypothetical explicit and distinguish the film from the character.
stem(3,4,6,'If the ISS kept losing speed and its thrusters never restored its orbit, it would eventually ______.')
option(3,10,7,0,'the 2018 film Robin Hood')
# Student 3: incorrect key, a reversed causal definition, overlapping choices, and overstatements.
q(4,10,10)['key']=1
option(4,4,7,2,'food shortages would occur only rarely')
option(4,5,5,0,'results from water being heated by volcanic activity')
option(4,5,9,0,'people did not sufficiently understand the warning signs and risks')
option(4,8,10,0,'has made him wealthier than before');option(4,8,10,1,'is impossible for him to get used to')
option(4,12,4,2,'the launch pad')
option(4,13,10,3,'Most found little or no gold and took other jobs.')
option(4,3,9,3,'become lighter')
for c in D:
 for t in c['tests']:
  # Mechanical corrections without altering the reading construct.
  for question in t['questions']:
   for field in ['stem','sourceStem']:
    if field in question:
     question[field]=question[field].replace('4 0C','4°C').replace('40C','4°C').replace('600 0C','600°C').replace('that that','that').replace('a snow leopards chuffs','a snow leopard chuffs')
   for o in question['options']:
    if 'text' in o:o['text']=o['text'].replace('40C','4°C').replace('hunt at animal','hunt an animal')
  for field in ['paragraphs','sourceLines']:
   if field=='paragraphs':t[field]=[s.replace('4 0C','4°C').replace('40C','4°C').replace('-247 0C','-247°C').replace('600 0C','600°C').replace('km2','km²') for s in t.get(field,[])]
  # Headings and list items retain their source layout in the original-page view.
Path('other-reading-tests-full.json').write_text(json.dumps(D,ensure_ascii=False,separators=(',',':')))
print('Applied documented validity repairs to four collections.')
