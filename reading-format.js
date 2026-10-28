'use strict';
window.readingQuestionText = (element, text, explicitTarget) => {
  const quoted = text.match(/(?:word|words|phrase|pronoun)\s+["“]([^"”]+)["”]/i) || text.match(/["“]([^"”]+)["”]\s+refer/i);
  const patterns=[/(?:what|who) does\s+(.+?)\s+(?:\(Line[^)]*\)\s*)?refer/i,/\b(?:In Lines? [\d\s–-]+,?\s*)(.+?)\s+(?:is CLOSEST|are CLOSEST|means|refers|is a|are people)/i,/^(.+?)\s+(?:\(Line[^)]*\)\s*)?(?:means|refers)\b/i];
  let target=explicitTarget||quoted?.[1];
  if(!target)for(const p of patterns){const m=text.match(p);if(m&&m[1].length<70){target=m[1].replace(/^(?:the adjective|the word|the phrase|to)\s+/i,'').trim();break;}}
  const at=target?text.toLowerCase().indexOf(target.toLowerCase()):-1;
  const append=(value,italic)=>value.split(/(DOES NOT|NOT|EXCEPT)/g).forEach(t=>{if(!t)return;const n=document.createElement(/^(DOES NOT|NOT|EXCEPT)$/.test(t)?'strong':italic?'em':'span');n.textContent=t;element.append(n);});
  if(at>=0){append(text.slice(0,at),false);append(text.slice(at,at+target.length),true);append(text.slice(at+target.length),false);}else append(text,false);
  return element;
};
