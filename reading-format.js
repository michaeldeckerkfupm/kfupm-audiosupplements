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

// Highlight the words being asked about, without revealing their referents or definitions.
window.readingReferenceTarget = question => {
  if (question.target) return question.target;
  const text = question.stem || '';
  const quoted = text.match(/(?:word|words|phrase|pronoun)\s+["“]([^"”]+)["”]/i)
    || text.match(/\b(?:A|An)\s+["“]([^"”]+)["”]/)
    || text.match(/["“]([^"”]+)["”]\s+(?:refer|means|is closest|are closest)/i);
  if (quoted) return quoted[1];
  const match = text.match(/(?:what|who) does\s+(.+?)\s+(?:\(Line[^)]*\)\s*)?refer/i)
    || text.match(/\bIn Lines? [\d\s–-]+,?\s*(.+?)\s+(?:is CLOSEST|are CLOSEST|means|refers|is a|are people)/i)
    || text.match(/^(.+?)\s+(?:\(Line[^)]*\)\s*)?(?:means|refers)\b/i);
  return match && match[1].length < 70 ? match[1].replace(/^(?:the adjective|the word|the phrase|to)\s+/i,'').trim() : null;
};
window.readingPassageTargets = (box, questions) => {
  const nodes = [], walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  let node, text = '';
  while ((node = walker.nextNode())) {
    if (node.parentElement.closest('.paragraph-number,.source-line-number,strong,button')) continue;
    nodes.push({node, start:text.length, end:text.length + node.textContent.length});
    text += node.textContent + '\n';
  }
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = value => value.trim().split(/\s+/).map(escape).join('\\s+');
  const spans = [];
  questions.forEach(question => {
    const target = window.readingReferenceTarget(question);
    if (!target) return;
    let start = 0, end = text.length;
    const quote = question.quote || question.stem?.match(/in the sentence\s+["“]([^"”]+)["”]/i)?.[1];
    if (quote) {
      const context = quote.replace(/(?:\.{3}|…)\s*$/, '').trim();
      const found = new RegExp(pattern(context), 'i').exec(text);
      if (found) { start = found.index; end = start + found[0].length; }
    }
    const expression = new RegExp('(^|[^\\p{L}\\p{N}_])(' + pattern(target) + ')(?![\\p{L}\\p{N}_])', 'giu');
    const section = text.slice(start, end);
    let matches = [...section.matchAll(expression)];
    if (!matches.length && !/^(it|they|he|she|we|you|them|this|that|these|those|which|who|whose|its|their)$/i.test(target)) {
      const plural = new RegExp('(^|[^\\p{L}\\p{N}_])(' + pattern(target) + 's)(?![\\p{L}\\p{N}_])', 'giu');
      matches = [...section.matchAll(plural)];
    }
    for (const match of matches) {
      const from = start + match.index + match[1].length;
      spans.push([from, from + match[2].length]);
    }
  });
  nodes.forEach(({node,start,end}) => {
    const ranges = spans.filter(([a,b]) => a < end && b > start)
      .map(([a,b]) => [Math.max(0,a-start),Math.min(end-start,b-start)])
      .sort((a,b) => a[0]-b[0]);
    if (!ranges.length) return;
    const merged = [];
    ranges.forEach(range => { const last = merged.at(-1); if (last && range[0] <= last[1]) last[1] = Math.max(last[1],range[1]); else merged.push(range); });
    const fragment = document.createDocumentFragment(); let at = 0;
    merged.forEach(([a,b]) => {fragment.append(document.createTextNode(node.textContent.slice(at,a))); const strong = document.createElement('strong'); strong.textContent = node.textContent.slice(a,b); fragment.append(strong); at=b;});
    fragment.append(document.createTextNode(node.textContent.slice(at))); node.replaceWith(fragment);
  });
};
