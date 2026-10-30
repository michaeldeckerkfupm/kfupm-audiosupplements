'use strict';
(() => {
 const menus=[
  {trigger:'readingTestsButton',box:'readingTestsContents',group:'major-1',title:'Major 1'},
  {trigger:'otherReadingButton',box:'otherReadingContents',group:'major-2-final',title:'Major 2 and Final Exam'},
  {trigger:'readingExplorerButton',box:'readingExplorerContents',group:'reading-explorer',title:'Reading Explorer Supplemental Materials'}
 ];
 const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 let pending;
 const packets=new Map();
 function collections(){
  if(!pending)pending=fetch('reading-collections.json').then(r=>{if(!r.ok)throw Error();return r.json();}).catch(e=>{pending=null;throw e;});
  return pending;
 }
 function packetReadings(collection){
  if(!packets.has(collection.dataFile))packets.set(collection.dataFile,fetch(collection.dataFile).then(r=>{if(!r.ok)throw Error();return r.json();}).catch(e=>{packets.delete(collection.dataFile);throw e;}));
  return packets.get(collection.dataFile);
 }
 function selectPacket(m,collection,grid,details){
  const selected=m.packet===collection.id;
  m.packet=selected?null:collection.id;
  grid.querySelectorAll('.packet-choice').forEach(button=>{
   const active=button.id==='packet-'+m.packet;
   button.setAttribute('aria-expanded',String(active));
   button.classList.toggle('packet-choice-active',active);
   button.classList.toggle('packet-choice-dimmed',!!m.packet&&!active);
   button.querySelector('.packet-action').textContent=active?'Hide readings':'Show readings';
  });
  details.hidden=selected;
  if(selected){details.replaceChildren();return;}
  details.setAttribute('aria-labelledby','packet-heading-'+m.group);
  const heading=node('h4',collection.title);heading.id='packet-heading-'+m.group;
  details.replaceChildren(heading,node('p','Loading readings...', 'packet-status'));
  packetReadings(collection).then(readings=>{
   if(!m.expanded||m.packet!==collection.id||!details.isConnected)return;
   const list=node('div',undefined,'grid reading-toc');
   readings.forEach(reading=>{
    const card=node('div',undefined,'panel card');
    card.append(node('strong',reading.label||'Reading '+reading.id),node('small',reading.questions.length+' questions · 20 minutes'));
    const controls=node('div',undefined,'reading-controls');
    const test=node('a','Reading test');test.href='reading-practice.html?collection='+collection.id+'&reading='+reading.id;controls.append(test);
    if(reading.vocabulary?.length){const vocab=node('a','Vocabulary');vocab.href='reading-practice.html?collection='+collection.id+'&vocabulary='+reading.id;controls.append(vocab);}
    card.append(controls);list.append(card);
   });
   details.replaceChildren(heading,list);
   heading.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  }).catch(()=>{if(m.expanded&&m.packet===collection.id){const retry=node('button','Try again');retry.type='button';retry.onclick=event=>{event.stopPropagation();m.packet=null;selectPacket(m,collection,grid,details);};details.replaceChildren(heading,node('p','The readings could not be loaded.'),retry);}});
 }
 function close(m){m.expanded=false;document.getElementById(m.box).hidden=true;document.getElementById(m.trigger).setAttribute('aria-expanded','false');}
 async function open(m){
  if(m.expanded){close(m);return;}
  menus.filter(x=>x!==m).forEach(close);
  const guide=document.getElementById('readingGuideButton');
  if(guide.getAttribute('aria-expanded')==='true')guide.click();
  collapseSection();m.expanded=true;
  const trigger=document.getElementById(m.trigger),box=document.getElementById(m.box);
  trigger.setAttribute('aria-expanded','true');box.hidden=false;box.replaceChildren(node('p','Loading reading tests...'));
  try{
   const data=(await collections()).filter(c=>c.group===m.group);
   if(!m.expanded)return;
   box.replaceChildren(node('h3',m.title));
   m.packet=null;
   const grid=node('div',undefined,'grid reading-toc packet-choices');
   const details=node('section',undefined,'packet-contents');details.id='packet-contents-'+m.group;details.hidden=true;
   data.forEach(collection=>{
    const card=node('button',undefined,'panel card packet-choice');
    card.type='button';card.id='packet-'+collection.id;card.setAttribute('aria-expanded','false');card.setAttribute('aria-controls',details.id);
    card.onclick=()=>selectPacket(m,collection,grid,details);
    card.append(node('strong',collection.title),node('small',collection.count+' '+(collection.itemLabel||'readings')+' · 20 minutes each'));
    if(collection.vocabulary)card.append(node('small','Vocabulary practice included'));
    card.append(node('span','Show readings','packet-action'));grid.append(card);
   });
   box.append(grid,details);
  }catch(_){if(m.expanded)box.replaceChildren(node('p','The tests could not be loaded. Close this menu and try again.'));}
 }
 menus.forEach(m=>document.getElementById(m.trigger).onclick=()=>open(m));
 document.addEventListener('click',event=>{
  if(document.getElementById('home').hidden||event.defaultPrevented||!window.getSelection().isCollapsed)return;
  menus.forEach(m=>{if(m.expanded&&!event.target.closest('#'+m.trigger+',#'+m.box))close(m);});
 });
})();
