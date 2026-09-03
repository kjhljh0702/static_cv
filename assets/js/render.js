/* ------------------------------------------------------------------
   render.js — data.json -> DOM, with KO/EN switching
   ------------------------------------------------------------------ */

export const UI = {
  en: {
    scroll:'Scroll', about:'About', exp:'Experience', expT1:'Where I have', expT2:'worked',
    edu:'Education', eduT1:'Trained in', eduT2:'systems',
    proj:'Selected work', projT1:'Six things I', projT2:'built',
    sk:'Toolkit', skT1:'What I', skT2:'work with',
    res:'Research & recognition', resT1:'Papers,', resT2:'posters, prizes',
    contact:'Get in touch', cta:'Send me an email',
    present:'Present', role:'Role', contactH:["Let's","build","something"],
    navHome:'Home', navAbout:'About', navExp:'Experience', navEdu:'Education',
    navProj:'Work', navSkills:'Skills', navRes:'Research', navContact:'Contact',
    stPapers:'Papers & posters', stProjects:'Shipped projects',
    stRoles:'Roles held', stGpa:'Major GPA',
    awTrack:'Track', awCert:'Certificate', awPaper:'Awarded paper',
    awBadge:'Award', drag:'Drag',
    aw:'Recognition', awT1:'Prizes and', awT2:'honours', world:'3D'
  },
  ko: {
    scroll:'스크롤', about:'소개', exp:'경력', expT1:'제가 일해온', expT2:'곳들',
    edu:'학력', eduT1:'시스템을', eduT2:'배우다',
    proj:'주요 프로젝트', projT1:'제가 만든', projT2:'여섯 가지',
    sk:'기술 스택', skT1:'제가 다루는', skT2:'도구들',
    res:'연구 · 수상', resT1:'논문,', resT2:'포스터, 수상',
    contact:'연락하기', cta:'이메일 보내기',
    present:'현재', role:'역할', contactH:['함께','만들어','봅시다'],
    navHome:'홈', navAbout:'소개', navExp:'경력', navEdu:'학력',
    navProj:'프로젝트', navSkills:'기술', navRes:'연구', navContact:'연락',
    stPapers:'논문 · 포스터', stProjects:'완성한 프로젝트',
    stRoles:'수행 역할', stGpa:'전공 학점',
    awTrack:'분야', awCert:'증서', awPaper:'수상 논문',
    awBadge:'수상', drag:'드래그',
    aw:'수상', awT1:'상과', awT2:'영예', world:'3D'
  }
};

export const NAV = [
  ['#top','navHome'],['#about','navAbout'],['#experience','navExp'],['#education','navEdu'],
  ['#projects','navProj'],['#skills','navSkills'],['#publications','navRes'],['#contact','navContact']
];

let LANG = 'en';
export const getLang = () => LANG;
export const setLang = (l) => { LANG = l; document.documentElement.setAttribute('data-lang', l); };

/** localise a {ko,en} value (or pass through a plain string) */
export const t = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[LANG] ?? v.en ?? '') : (v ?? '');
const ui = (k) => UI[LANG][k] ?? UI.en[k] ?? k;
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/** split a string into per-character spans (keeps spaces) */
export const chars = (str, cls = 'ch') =>
  [...str].map(c => c === ' ' ? '<span class="'+cls+'">&nbsp;</span>'
                              : '<span class="'+cls+'">'+esc(c)+'</span>').join('');

const period = (a, b) => `${a} — ${b === 'present' ? ui('present') : b}`;

/* ------------------------------------------------------------------ */

export function render(D) {
  const P = D.profile;
  const $ = (s) => document.querySelector(s);

  /* --- static UI strings --- */
  document.querySelectorAll('[data-t]').forEach(el => {
    const v = ui(el.dataset.t);
    el.textContent = v;
    el.dataset.txt = v;          // pristine label for the scramble effect
  });
  $('#yr').textContent = new Date().getFullYear();

  /* --- nav --- */
  $('#navLinks').innerHTML = '<i class="nav__pill" id="navPill"></i>' + NAV.map(([h,k]) =>
    `<a href="${h}" data-nav="${h}">${esc(ui(k))}</a>`).join('');
  $('#menuLinks').innerHTML = NAV.map(([h,k]) =>
    `<a href="${h}" data-nav="${h}">${esc(ui(k))}</a>`).join('');

  /* --- hero --- */
  const name = t(P.name);
  const parts = LANG === 'ko'
    ? (name.length > 2 ? [name.slice(0, 1), name.slice(1)] : [name])   // 이 / 정훈
    : name.split(' ');
  $('#heroName').innerHTML = parts.map((w,i) =>
    `<span class="hero__line">${chars(w)}</span>`).join('') ;
  // gradient-tint the last line
  const lines = $('#heroName').querySelectorAll('.hero__line');
  if (lines.length > 1) lines[lines.length-1].classList.add('g');

  $('#heroHead').textContent = t(P.introTitle);
  $('#heroRoles').innerHTML = P.roles.map((r,i) =>
    `<span class="chip${i===0?' hot':''}">${esc(t(r))}</span>`).join('');
  $('#heroPhoto').src = P.photo;

  const metaRows = [
    [ui('role') , t(P.affiliation.position)],
    ...P.details.map(d => [t(d.label), t(d.value)]),
    ...P.contacts.map(c => [t(c.label), c.value])
  ];
  $('#heroMeta').innerHTML = metaRows.map(([k,v]) =>
    `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');

  /* --- about (word-by-word scrub) --- */
  $('#aboutScrub').innerHTML = t(P.about).split(/\s+/)
    .map(w => `<span class="w">${esc(w)}</span>`).join(' ');
  $('#focusRow').innerHTML = P.focusAreas.map(f =>
    `<span class="chip" data-reveal="scale">${esc(t(f))}</span>`).join('');

  /* --- stat band (every figure is counted straight off the data) --- */
  const gpa = (D.education.find(e => e.grade) || {}).grade;
  const stats = [
    ['stPapers',   D.publications.length, 0],
    ['stProjects', D.projects.length,     0],
    ['stRoles',    D.experience.length,   0],
    ...(gpa ? [['stGpa', parseFloat(gpa), 2]] : [])
  ];
  $('#statRow').innerHTML = stats.map(([k, v, dp]) => `
    <div class="stat">
      <b class="stat__n" data-count="${v}" data-dp="${dp}">${(0).toFixed(dp)}</b>
      <span>${esc(ui(k))}</span>
    </div>`).join('');

  /* --- marquee (two rows, counter-running) --- */
  const words = [...P.focusAreas.map(t), ...D.skills[0].items.slice(0,4), 'Robotics', 'LLM'];
  const row = (list) => [...list, ...list, ...list].map(w => `<span>${esc(w)}</span>`).join('');
  $('#marq').innerHTML  = row(words);
  $('#marq2').innerHTML = row([...words].reverse());

  /* --- experience --- */
  $('#htrack').innerHTML = D.experience.map((e,i) => `
    <article class="xcard glass">
      <div class="xcard__num">0${i+1}</div>
      <div class="xcard__yr">${esc(period(e.start, e.end))}</div>
      <h3>${esc(t(e.title))}</h3>
      <div class="org">${esc(t(e.organization))}</div>
      <p>${esc(t(e.description))}</p>
      <div class="loc">${esc(t(e.location))}</div>
    </article>`).join('');

  /* --- education --- */
  $('#eduItems').innerHTML = D.education.map(e => `
    <article class="edu__item glass" data-reveal="slide-r">
      <i class="edu__node" aria-hidden="true"></i>
      <div class="yr">${esc(period(e.start, e.end))} · ${esc(t(e.degree))}</div>
      <h3>${esc(t(e.school))}</h3>
      <div class="dept">${esc(t(e.department))}</div>
      <p>${esc(t(e.description))}</p>
      ${e.grade ? `<div class="gpa"><b data-count="${parseFloat(e.grade)}" data-dp="2">0.00</b> / 4.5 GPA</div>` : ''}
    </article>`).join('');

  /* --- projects --- */
  const HUE = [268, 190, 330, 218, 158, 22];   // one accent per card
  $('#pcards').innerHTML = D.projects.map((p,i) => `
    <article class="pcard glass" data-cursor="View" style="--i:${i};--h:${HUE[i % HUE.length]}">
      <div class="pcard__idx" aria-hidden="true">${String(i+1).padStart(2,'0')}</div>
      <div class="pcard__in">
        <div class="pcard__txt">
          <div class="pcard__cat"><b>${esc(t(p.category))}</b><span>${esc(period(p.start,p.end))}</span></div>
          <h3>${esc(t(p.title))}</h3>
          <p>${esc(t(p.summary))}</p>
          <ul class="hl">${p.highlights.map(h=>`<li>${esc(t(h))}</li>`).join('')}</ul>
          <div class="tags">${p.skills.map(s=>`<span class="tag">${esc(s)}</span>`).join('')}</div>
        </div>
        <div class="pcard__img ${p.imageFit === 'contain' ? 'fit' : 'cover'}">
          <img src="${esc(p.image)}" alt="${esc(t(p.title))}" loading="lazy">
        </div>
      </div>
    </article>`).join('');

  /* --- skills --- */
  $('#skGrid').innerHTML = D.skills.map((g,i) => `
    <div class="sk glass" data-reveal="mask" style="--i:${i}">
      <h3>${esc(t(g.category))}</h3>
      <ul>${g.items.map(it=>`<li>${esc(t(it))}</li>`).join('')}</ul>
    </div>`).join('');

  /* --- publications + awards --- */
  $('#pubList').innerHTML = D.publications.map(p => `
    <div class="pub" data-reveal="slide-l">
      <div class="y">${esc(p.year)}</div>
      <div>
        <h4>${esc(t(p.title))}${p.award ? `<i class="pub__medal" title="${esc(t(p.award))}">★</i>` : ''}</h4>
        <div class="au">${esc(t(p.authors))}</div>
        <div class="vn">${esc(t(p.type))} · ${esc(t(p.venue))}</div>
        ${p.award ? `<div class="pub__aw">${esc(ui('awBadge'))} · ${esc(t(p.award))}</div>` : ''}
      </div>
    </div>`).join('');

  $('#awardList').innerHTML = D.awards.map(a => `
    <div class="award glass" data-reveal="flip">
      <div class="award__sheen"></div>
      <div class="award__top">
        <div>
          <div class="award__y">${esc(a.year)}${a.certNo ? ` · ${esc(t(a.certNo))}` : ''}</div>
          <h4>${esc(t(a.title))}</h4>
        </div>
        <div class="award__seal" aria-hidden="true"><span>賞</span></div>
      </div>
      ${a.venue ? `<div class="award__venue">${esc(t(a.venue))}</div>` : ''}
      ${a.paper ? `<div class="award__row"><span>${esc(ui('awPaper'))}</span><b>${esc(t(a.paper))}</b></div>` : ''}
      ${a.track ? `<div class="award__row"><span>${esc(ui('awTrack'))}</span><b>${esc(t(a.track))}</b></div>` : ''}
      <p>${esc(t(a.description))}</p>
      ${a.image ? `<figure class="award__cert" data-cursor="View">
        <img src="${esc(a.image)}" alt="${esc(t(a.title))}" loading="lazy">
      </figure>` : ''}
      <div class="award__org">${esc(t(a.organization))}${a.date ? ` · ${esc(t(a.date))}` : ''}</div>
    </div>`).join('');

  /* --- contact --- */
  document.querySelector('#contactH').innerHTML =
    ui('contactH').map(w => `<span class="cline">${chars(w)}</span>`).join('<br>');
  const mail = P.contacts.find(c => (c.href||'').startsWith('mailto:'));
  if (mail) document.querySelector('#mailBtn').href = mail.href;
  document.querySelector('#links').innerHTML = [
    ...P.contacts.map(c => `<a href="${esc(c.href)}">${esc(c.value)}</a>`),
    ...P.socials.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t(s.label))} ↗</a>`)
  ].join('');
}
