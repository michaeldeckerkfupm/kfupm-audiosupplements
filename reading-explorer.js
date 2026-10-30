'use strict';
(() => {
 let active,section=0,token=0;
 const $=id=>document.getElementById(id),make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 function table(parent,rows){const wrap=make('div');wrap.className='table-scroll';const t=make('table');t.className='vocab-table';rows.forEach(row=>{const tr=make('tr');row.forEach(value=>tr.append(make('td',value)));t.append(tr);});wrap.append(t);parent.append(wrap);}
 window.explorerQuestionExtras=(parent,q)=>{(q.images||[]).forEach(src=>{const img=make('img');img.src=src;img.alt='Figure supplied with this question';img.className='explorer-figure';parent.append(img);});(q.tables||[]).forEach(rows=>table(parent,rows));};
 window.explorerClose=()=>{token++;active=null;document.getElementById('explorerSectionControls')?.remove();$('passageImageButton').textContent='Original page';$('passageImageButton').title='Original layout with printed line numbers. Scroll this panel to find the referenced line.';};
 window.explorerOpen=test=>{
  active=test;section=0;
  const control=make('div');control.id='explorerSectionControls';control.className='explorer-section-controls';
  const label=make('label','Exercise section '),select=make('select');select.id='explorerSectionSelect';select.setAttribute('aria-label','Exercise section');
  test.passages.forEach((p,i)=>{const option=make('option',(i+1)+'. '+p.title);option.value=i;select.append(option);});select.onchange=()=>window.explorerShowContext(Number(select.value));label.append(select);control.append(label);document.querySelector('.passage-header').after(control);
  $('passageImageButton').textContent='Page view';$('passageImageButton').title='Formatted page view of the supplied passage and figures. Text view adjusts to smaller screens.';
  window.explorerShowContext(0);
 };
 window.explorerShowContext=async index=>{
  if(!active)return;section=index;const test=active,current=++token,p=test.passages[index];if(!p)return;$('explorerSectionSelect').value=index;
  const text=$('examPassage');text.replaceChildren(make('h3',p.title));p.paragraphs.forEach(value=>text.append(make('p',value)));
  if(p.bank.length){const bank=make('p','Word bank: '+p.bank.map(o=>o.text).join(' · '));bank.className='explorer-word-bank';text.append(bank);}
  else p.tables.forEach(rows=>table(text,rows));
  p.images.forEach((src,i)=>{if(p.imageCaptions?.[i])text.append(make('h4',p.imageCaptions[i]));const img=make('img');img.src=src;img.alt='Figure supplied with this exercise';img.className='explorer-figure';text.append(img);});
  window.readingPassageTargets(text,test.questions.filter(q=>q.passage===index));
  const imageBox=$('examPassageImage');imageBox.replaceChildren();
  // SVG keeps the source's paragraph labels and figures crisp at any zoom level.
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),parts=[];let y=48;
  const targets=test.questions.filter(q=>q.passage===index&&q.target).map(q=>q.target);
  const escaped=targets.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const targetPattern=escaped.length?new RegExp('(?<![\\p{L}\\p{N}_])('+escaped.join('|')+')(?![\\p{L}\\p{N}_])','giu'):null;
  const markup=value=>targetPattern?value.split(targetPattern).map((part,i)=>i%2?'<tspan font-weight="bold">'+escape(part)+'</tspan>':escape(part)).join(''):escape(value);
  function lines(value,size,bold=false){ctx.font=(bold?'bold ':'')+size+'px Georgia';let line='';const rows=[];for(const word of String(value).split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width>820&&line){rows.push(line);line=word;}else line=next;}if(line)rows.push(line);rows.forEach(row=>{parts.push('<text x="40" y="'+y+'" font-family="Georgia,serif" font-size="'+size+'"'+(bold?' font-weight="bold"':'')+'>'+markup(row)+'</text>');y+=size*1.55;});y+=14;}
  lines(p.title,25,true);p.paragraphs.forEach(value=>lines(value,19));
  if(p.bank.length)lines('Word bank: '+p.bank.map(o=>o.text).join(' · '),19);else p.tables.forEach(rows=>rows.forEach(row=>lines(row.join(' | '),18)));
  for(let i=0;i<p.images.length;i++){const src=p.images[i];if(p.imageCaptions?.[i])lines(p.imageCaptions[i],20,true);const img=new Image();img.src=src;try{await img.decode();}catch(_){continue;}const width=Math.min(820,img.naturalWidth),height=width*img.naturalHeight/img.naturalWidth;parts.push('<image x="40" y="'+y+'" width="'+width+'" height="'+height+'" href="'+escape(src)+'"/>');y+=height+24;}
  if(current!==token||active!==test)return;
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="'+Math.ceil(y+25)+'" viewBox="0 0 900 '+Math.ceil(y+25)+'"><rect width="100%" height="100%" fill="white"/>'+parts.join('')+'</svg>';
  const image=make('img');image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);image.alt=p.title+' formatted passage and figures';imageBox.append(image);$('examPassagePanel').scrollTop=0;
 };
})();
