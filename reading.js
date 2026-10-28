'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const NS = 'engl010-molcher-reading-v1:';
  let guide, skill, activity, state, mode = 'first', lastVisited = -1;
  let expanded = false, pending;
  const credit = 'Original guide: Chris Molcher (2026). Adapted for interactive practice.';

  function node(tag, text, cls) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  }
  function button(text, fn, cls) {
    const el = node('button', text, cls);
    el.type = 'button'; el.onclick = fn;
    return el;
  }
  function shuffle(n) {
    const a = Array.from({length:n}, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function newRound(ids, p) {
    return {ids, answers:{}, submitted:false, order:p.questions.map(q => shuffle(q.options.length))};
  }
  function load(p) {
    try {
      const saved = JSON.parse(localStorage.getItem(NS + p.id + (p.revision ? ':r' + p.revision : '')));
      if (saved?.version === 1 && saved.first?.order?.length === p.questions.length &&
          [saved.first, saved.retry].filter(Boolean).every(r => Array.isArray(r.ids) &&
            r.ids.every(i => p.questions[i]) && r.answers && r.order.every((a, i) =>
              a.length === p.questions[i].options.length && new Set(a).size === a.length &&
              a.every(v => Number.isInteger(v) && v >= 0 && v < a.length)))) return saved;
    } catch (_) { /* Start fresh if stored progress is unreadable. */ }
    return {version:1, flags:{}, mastered:{}, first:newRound(p.questions.map((_, i) => i), p)};
  }
  function save() {
    try { localStorage.setItem(NS + activity.id + (activity.revision ? ':r' + activity.revision : ''), JSON.stringify(state)); }
    catch (_) { $('readingSaveNote').textContent = 'This browser could not save progress. You can still complete this activity.'; }
  }
  const round = () => mode === 'retry' ? state.retry : state.first;
  function setView(id) {
    ['home','quiz','readingLesson','readingQuiz'].forEach(view => $(view).hidden = view !== id);
    if (id !== 'quiz') $('audio').pause();
    window.scrollTo(0, 0);
  }
  async function data() {
    if (!pending) pending = fetch('reading-guide.json').then(r => {
      if (!r.ok) throw Error('Guide unavailable');
      return r.json();
    }).then(d => { guide = d; return d; }).catch(e => { pending = null; throw e; });
    return pending;
  }
  function closeContents() {
    expanded = false;
    $('readingContents').hidden = true;
    $('readingGuideButton').setAttribute('aria-expanded','false');
  }
  function practiceStatus(p) {
    const s = load(p), r = s.first;
    if (r.submitted) return 'First attempt: ' + r.ids.filter(i => r.answers[i] === p.questions[i].key).length + '/' + r.ids.length;
    const n = Object.keys(r.answers).length;
    return n ? n + '/' + p.questions.length + ' answered' : p.questions.length + (p.questions.length === 1 ? ' question' : ' questions');
  }
  async function openContents(event) {
    event?.stopPropagation?.();
    setView('home'); collapseSection();
    expanded = true;
    $('readingGuideButton').setAttribute('aria-expanded','true');
    const box = $('readingContents'); box.hidden = false;
    box.replaceChildren(node('p','Loading reading skills...'));
    try {
      await data();
      if (!expanded) return;
      box.replaceChildren(node('h3','Reading Skills Guidebook'), node('p',credit,'reading-credit'));
      box.append(node('p','Choose a skill. Read the strategy and worked example, then practise with the passage beside the questions.'));
      const intro = node('details',undefined,'reading-howto');
      intro.append(node('summary','How to use this guide'));
      prose(intro,guide.introduction);
      box.append(intro);
      const contents = node('div',undefined,'grid reading-toc');
      guide.skills.forEach(s => {
        const completed = s.practices.filter(p => load(p).first.submitted).length;
        const b = button('',() => openLesson(s),'card');
        b.append(node('small','Skill ' + s.id),node('strong',s.title),
          node('small',completed + '/' + s.practices.length + ' activities submitted'));
        contents.append(b);
      });
      box.append(contents);
    } catch (_) {
      if (!expanded) return;
      box.replaceChildren(node('p','The reading guide could not be loaded. Please try again.'),button('Try again',openContents));
    }
  }
  function emphasize(el,text) {
    text.split(/(DOES NOT|NOT|EXCEPT|BEST TITLE|BEST HEADING|MAIN SUBJECT|BEST)/g).forEach(t => el.append(/^(DOES NOT|NOT|EXCEPT|BEST TITLE|BEST HEADING|MAIN SUBJECT|BEST)$/.test(t) ? node('strong',t) : document.createTextNode(t)));
    return el;
  }
  function prose(box, paragraphs) {
    let steps;
    paragraphs.forEach(text => {
      if (text.includes('•')) {
        const parts = text.split('•');
        if(parts[0].trim()) box.append(node('p',parts.shift().trim())); else parts.shift();
        const ul=node('ul',undefined,'reading-bullets');
        parts.forEach(t=>ul.append(node('li',t.trim())));box.append(ul);steps=null;return;
      }
      const step=text.match(/^Step (\d+)\s*[-–:]\s*(.*)/);
      if(step){if(!steps){steps=node('ol',undefined,'reading-steps');box.append(steps);}steps.append(node('li',step[2]));return;}
      if(steps && /^(Ask yourself:|This is usually|Contrast:|Support:|Example:|Cause and Effect:|Sequence:)/.test(text)){steps.lastChild.append(node('p',text));return;}
      steps=null;
      if(/^Reading Tip:/.test(text)){const tip=node('aside',undefined,'reading-tip');tip.append(node('strong','Reading tip'),node('p',text.replace(/^Reading Tip:\s*/,'')));box.append(tip);return;}
      if(/^Reading Strategy/.test(text)){box.append(node('h3','Reading strategy'));const rest=text.replace(/^Reading Strategy:?\s*/,'');if(rest)box.append(node('p',rest));return;}
      const intro=text.match(/^(What (?:is|are) [^?]+\?)\s*(.*)/);
      if(intro){box.append(node('h3',intro[1]));if(intro[2])box.append(node('p',intro[2]));return;}
      if(/^(Type [12]:|Common (Relationships|Word Parts|Context Clues)|Three Types of Structural Clues|[123]\. (Punctuation clues|Restatement clues|Example clues|Prefix:|Root:|Suffix:|Location clues|Sentence clues|Logic clues))/.test(text)){const split=text.match(/^([123]\. [^:]+:)\s*(.+)/);if(split)box.append(node('h4',split[1]),node('p',split[2]));else box.append(node('h4',text));return;}
      box.append(node('p',text));
    });
  }
  function workedExample(box,s) {
    let answering=false,choices;
    s.example.forEach((text,i)=>{
      if(s.exampleLines && i===1){lines(box,s.exampleLines);return;}
      const chunks=text.split(/\s+(?=(?:ANSWER|Answer)(?:\s*[-:]|\s+[A-D]\)|$))/);
      chunks.forEach(chunk=>{
        if(/^(?:ANSWER|Answer)\b/.test(chunk)){answering=true;choices=null;const rest=chunk.replace(/^(?:ANSWER|Answer)\s*[-:]?\s*/,'');box.append(node('h4','Answer'));if(rest)box.append(node('p',rest));return;}
        if(/^(?:Question|Q(?:\d+)?[.])/i.test(chunk)){answering=false;choices=null;}
        const parts=answering?[chunk]:chunk.split(/\s+(?=[A-D]\))/);
        parts.forEach(t=>{
          if(!answering && /^[A-D]\)/.test(t)){if(!choices){choices=node('ol',undefined,'reading-example-options');choices.type='A';box.append(choices);}choices.append(node('li',t.replace(/^[A-D]\)\s*/,'')));}
          else {choices=null;if(/^(Question|Q(?:\d+)?[.])/.test(t))box.append(emphasize(node('h4'),t.replace(/^Question\s*-?\s*/,'Question: ')));else if(/^(Why\?|Explanation)$/.test(t))box.append(node('h4',t));else box.append(node('p',t));}
        });
      });
    });
  }
  function lines(box, values) {
    const list = node('ol',undefined,'reading-lines');
    values.forEach(text => list.append(node('li',text)));
    box.append(list);
  }
  function openLesson(s) {
    skill = s; setView('readingLesson');
    const box = $('readingLessonBody'); box.replaceChildren();
    $('readingSkillTitle').textContent = 'Skill ' + s.id + ': ' + s.title;
    prose(box,s.lesson);
    const example = node('details',undefined,'reading-example');
    example.append(node('summary','Worked example'));
    workedExample(example,s);
    box.append(example,node('h3','Practise this skill'));
    const activities = node('div',undefined,'grid');
    s.practices.forEach(p => {
      const b = button('',() => start(s,p),'card');
      b.append(node('strong','Practice ' + p.number),node('small',practiceStatus(p)));
      activities.append(b);
    });
    box.append(activities,node('p',credit,'reading-credit'));
  }
  function start(s,p) {
    skill = s; activity = p; state = load(p);
    mode = state.retry && !state.retry.submitted ? 'retry' : 'first';
    lastVisited = -1; setView('readingQuiz');
    $('readingActivityTitle').textContent = 'Skill ' + s.id + ' · Practice ' + p.number;
    $('readingPassage').replaceChildren();
    if (p.lines) lines($('readingPassage'),p.lines);
    else p.paragraphs.forEach((text,i) => {
      const paragraph = node('p',undefined,'reading-paragraph');
      if (p.paragraphs.length > 1) paragraph.append(node('span',String(i+1),'paragraph-number'));
      paragraph.append(document.createTextNode(text));
      $('readingPassage').append(paragraph);
    });
    $('readingPassageCredit').textContent = 'Chris Molcher (2026) · Guidebook page ' + p.page;
    $('readingSaveNote').textContent = 'Answers and flags are saved on this device. Results are not sent to your teacher.';
    save(); render(); $('readingPassagePanel').scrollTop = 0;
  }
  function go(i) {
    lastVisited = i;
    const el = $('reading-item-' + i);
    el.scrollIntoView({behavior:'smooth',block:'start'});
    el.focus({preventScroll:true});
  }
  function navigation() {
    const nav = $('readingNavigation'); nav.replaceChildren();
    const r = round();
    r.ids.forEach(i => {
      const flagged = !!state.flags[i], answered = Object.hasOwn(r.answers,i);
      const b = button(String(i+1) + (flagged ? ' F' : ''),() => go(i),flagged ? 'flagged' : answered ? 'answered-nav' : '');
      b.setAttribute('aria-label','Question ' + (i+1) + (flagged ? ', flagged' : '') + (answered ? ', answered' : ', unanswered'));
      nav.append(b);
    });
    const flagged = r.ids.filter(i => state.flags[i]);
    $('readingNextFlag').disabled = !flagged.length;
    $('readingNextFlag').textContent = 'Next flagged question (' + flagged.length + ')';
    $('readingNextFlag').onclick = () => go(flagged.find(i => i > lastVisited) ?? flagged[0]);
  }
  function stats() {
    const r = round(), n = r.ids.filter(i => Object.hasOwn(r.answers,i)).length;
    $('readingProgress').max = r.ids.length; $('readingProgress').value = n;
    $('readingAnswered').textContent = n + ' of ' + r.ids.length + ' answered';
    $('readingSubmit').hidden = r.submitted;
    navigation();
  }
  function score(r) { return r.ids.filter(i => r.answers[i] === activity.questions[i].key).length; }
  function render() {
    const r = round(); stats();
    $('readingRoundLabel').textContent = mode === 'retry' ? 'Retry missed questions' : 'All questions';
    const result = $('readingResult'); result.replaceChildren();
    if (r.submitted) {
      result.append(node('h3',(mode === 'retry' ? 'Retry score: ' : 'Score: ') + score(r) + ' / ' + r.ids.length));
      if (mode === 'retry') result.append(node('p','First attempt: ' + score(state.first) + ' / ' + state.first.ids.length));
      result.append(node('p','Review the answer explanations below.'));
    }
    const notes = $('readingPlanning'); notes.replaceChildren();
    if (activity.planning) {
      const details = node('details'); details.append(node('summary','Think it through: topic, message, main idea'));
      activity.planning.forEach((prompt,i) => {
        const label = node('label',prompt), input = node('textarea'); input.rows = 2;
        input.value = state.notes?.[i] || '';
        input.oninput = () => { state.notes ??= {}; state.notes[i] = input.value; save(); };
        input.disabled = r.submitted; label.append(input); details.append(label);
        if (r.submitted) details.append(node('p','Model answer: ' + activity.models[i],'feedback'));
      });
      notes.append(details);
    }
    const box = $('readingQuestions'); box.replaceChildren();
    r.ids.forEach(i => {
      const q = activity.questions[i];
      const card = node('article',undefined,'question-card'); card.id = 'reading-item-' + i; card.tabIndex = -1;
      const toolbar = node('div',undefined,'toolbar');
      const flag = button(state.flags[i] ? 'Flagged · Remove flag' : 'Flag for later',() => {
        state.flags[i] = !state.flags[i]; save(); navigation();
        flag.textContent = state.flags[i] ? 'Flagged · Remove flag' : 'Flag for later';
        flag.className = state.flags[i] ? 'flagged' : '';
        flag.setAttribute('aria-pressed',String(!!state.flags[i]));
      },state.flags[i] ? 'flagged' : '');
      flag.setAttribute('aria-pressed',String(!!state.flags[i]));
      toolbar.append(node('strong','Question ' + (i+1)),flag);
      const h = emphasize(node('h3'),q.stem); h.id = 'reading-stem-' + i;
      const choices = node('div'); choices.setAttribute('role','group'); choices.setAttribute('aria-labelledby',h.id);
      r.order[i].forEach((oi,pos) => {
        const b = button('',() => {
          if (r.submitted) return;
          r.answers[i] = oi; save();
          [...choices.children].forEach((el,j) => {
            const selected = r.order[i][j] === oi;
            el.className = 'choice' + (selected ? ' selected' : '');
            el.setAttribute('aria-pressed',String(selected));
          }); stats();
        },'choice');
        b.setAttribute('aria-pressed',String(r.answers[i] === oi));
        b.append(node('span',String.fromCharCode(65+pos),'letter'),node('span',q.options[oi]));
        if (r.answers[i] === oi) b.classList.add('selected');
        if (r.submitted) {
          b.disabled = true;
          if (oi === q.key) { b.classList.add('correct'); b.lastChild.append(node('strong','Correct answer','choice-label')); }
          else if (r.answers[i] === oi) { b.classList.add('wrong'); b.lastChild.append(node('strong','Your answer','choice-label')); }
        }
        choices.append(b);
      });
      card.append(toolbar,h,choices);
      if (r.submitted) {
        const feedback = node('div',undefined,'feedback');
        feedback.append(node('strong',r.answers[i] === undefined ? 'Unanswered. ' : r.answers[i] === q.key ? 'Correct. ' : 'Incorrect. '),
          node('p','Correct answer: ' + String.fromCharCode(65+r.order[i].indexOf(q.key)) + '. ' + q.options[q.key]),node('p',q.explanation));
        card.append(feedback);
      }
      box.append(card);
    });
    const tools = $('readingReviewTools'); tools.replaceChildren();
    if (r.submitted) {
      const missed = state.first.ids.filter(i => state.first.answers[i] !== activity.questions[i].key && !state.mastered[i]);
      if (missed.length) tools.append(button('Retry missed questions (' + missed.length + ')',() => {
        state.retry = newRound(missed,activity); mode = 'retry'; save(); render(); $('readingQuestionPanel').scrollIntoView({block:'start'});
      },'primary'));
      if (mode === 'retry') tools.append(button('View first attempt',() => { mode = 'first'; render(); }));
      const next = skill.practices.find(p => p.number === activity.number+1);
      if (next) tools.append(button('Next practice',() => start(skill,next)));
      tools.append(button('Back to skill',() => openLesson(skill)));
    }
  }
  function submit() {
    const r = round(); if (r.submitted) return;
    const missing = r.ids.filter(i => !Object.hasOwn(r.answers,i)).length;
    if (missing && !confirm(missing + ' question(s) are unanswered. Submit anyway?')) return;
    r.submitted = true;
    if (mode === 'retry') r.ids.forEach(i => { if (r.answers[i] === activity.questions[i].key) state.mastered[i] = true; });
    save(); render(); $('readingResult').scrollIntoView({behavior:'smooth',block:'start'});
  }
  $('readingGuideButton').onclick = () => expanded ? closeContents() : openContents();
  $('readingLessonBack').onclick = openContents;
  $('readingQuizBack').onclick = () => openLesson(skill);
  $('readingQuizContents').onclick = openContents;
  $('readingSubmit').onclick = submit;
  $('readingRestart').onclick = () => {
    if (!confirm('Clear answers and flags for this practice and start again?')) return;
    try { localStorage.removeItem(NS + activity.id); } catch (_) {}
    state = {version:1,flags:{},mastered:{},first:newRound(activity.questions.map((_,i) => i),activity)};
    mode = 'first'; save(); render();
  };
  document.addEventListener('click',event => {
    if (!expanded || $('home').hidden || event.defaultPrevented) return;
    if (event.target.closest('#readingMenu, #readingContents')) return;
    if (!window.getSelection().isCollapsed) return;
    closeContents();
  });
})();
