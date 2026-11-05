/* Original scroll-build animation. No code from Swarm or swarm-cursors is bundled. */
export function initSwarm() {
  const shell = document.querySelector('#cv-shell');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const root = document.documentElement;
  const canvas = document.createElement('canvas');
  canvas.className = 'swarm-stage';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.body.append(canvas);

  const controls = document.createElement('details');
  controls.className = 'swarm-controls';
  const summary = document.createElement('summary');
  const panel = document.createElement('div');
  panel.className = 'swarm-controls-panel';
  const caption = document.createElement('p');
  const toggle = document.createElement('button');
  const replay = document.createElement('button');
  const credit = document.createElement('a');
  toggle.type = replay.type = 'button';
  credit.href = 'https://github.com/DhvanilPatel/swarm-cursors';
  credit.target = '_blank'; credit.rel = 'noopener noreferrer';
  panel.append(caption, toggle, replay, credit); controls.append(summary, panel); shell.append(controls);

  let enabled = localStorage.getItem('cv-swarm-enabled') !== 'false';
  let ready = false, frame = 0, previous = 0, activeUntil = 0, scanPending = true;
  let targets = [], complete = new WeakSet();
  const pointer = {x: innerWidth * .65, y: innerHeight * .5};
  const names = ['Layout', 'Type', 'Media', 'Details', 'Systems'];
  const colors = ['#8fc6ff', '#a8dfce', '#c6b4f3', '#e6c08c', '#a1bddb'];
  const agents = names.map((name, i) => ({name, color: colors[i], x: innerWidth - 120 - i * 24, y: 110 + i * 26, task: null, alpha: 0}));
  const visible = () => enabled && !reduced.matches && root.dataset.view !== 'metaverse' && !document.hidden && !document.querySelector('dialog[open]') && document.querySelector('#lightbox')?.hidden !== false;
  const local = (en, ko) => root.dataset.lang === 'ko' ? ko : en;
  function labels() {
    const state = enabled && !reduced.matches;
    summary.textContent = local(`Swarm · ${state ? 'On' : 'Off'}`, `커서 스웜 · ${state ? '켜짐' : '꺼짐'}`);
    caption.textContent = local('Local cursors sketch this CV as you scroll.', '스크롤에 맞춰 커서들이 CV를 그려냅니다.');
    toggle.textContent = local(state ? 'Turn off' : 'Turn on', state ? '끄기' : '켜기');
    toggle.setAttribute('aria-pressed', String(state));
    toggle.disabled = reduced.matches;
    replay.textContent = local('Replay this view ↻', '현재 화면 다시 그리기 ↻');
    replay.disabled = !state;
    credit.textContent = local('Inspired by swarm-cursors ↗', 'swarm-cursors에서 영감 ↗');
    root.dataset.swarm = state ? 'on' : 'off';
  }
  function finish(agent) {
    if (agent.task) {
      agent.task.element.removeAttribute('data-swarm-building');
      agent.task.element.style.removeProperty('--swarm-cut');
      agent.task = null;
    }
  }
  function clear() {
    cancelAnimationFrame(frame); frame = 0;
    agents.forEach(agent => { finish(agent); agent.alpha = 0; });
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    canvas.hidden = true;
  }
  function collect() {
    agents.forEach(finish);
    targets = [...document.querySelectorAll('#heroName, .hero__ph, #heroHead, .hero-actions, .research-map, #cv-shell .title, #cv-shell .xcard, #cv-shell .edu__item, #pcards .pcard, #skGrid .sk, #pubList .pub, #awardList .award, .credential-gallery .credential, #contactH, #mailBtn')];
    scanPending = true;
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    wake();
  }
  function assign(now) {
    if (!scanPending) return;
    scanPending = false;
    const candidates = targets.filter(element => {
      if (!element.isConnected || complete.has(element) || element.closest('[hidden]')) return false;
      const r = element.getBoundingClientRect();
      return r.width > 12 && r.height > 10 && r.top < innerHeight * .9 && r.bottom > 85 && r.left < innerWidth && r.right > 0;
    });
    for (const agent of agents.slice(0, coarse.matches ? 2 : 5)) {
      if (agent.task || !candidates.length) continue;
      const element = candidates.shift(); complete.add(element);
      element.dataset.swarmBuilding = 'true'; element.style.setProperty('--swarm-cut', '100%');
      agent.task = {element, started: now, duration: element.matches('.pcard,.hero__ph,.credential') ? 1000 : 760};
      activeUntil = Math.max(activeUntil, now + 2000);
    }
  }
  function pointerShape(agent) {
    ctx.save(); ctx.translate(agent.x, agent.y); ctx.globalAlpha = agent.alpha;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1, 19); ctx.lineTo(6, 14); ctx.lineTo(10, 22); ctx.lineTo(14, 20); ctx.lineTo(10, 12); ctx.lineTo(17, 11); ctx.closePath();
    ctx.fillStyle = agent.color; ctx.fill(); ctx.strokeStyle = '#061320'; ctx.lineWidth = 1.5; ctx.stroke();
    if (agent.task && innerWidth > 600) {
      ctx.font = '10px ui-monospace, monospace';
      const width = ctx.measureText(agent.name).width + 14;
      ctx.fillStyle = agent.color; ctx.fillRect(17, 20, width, 19);
      ctx.fillStyle = '#102238'; ctx.fillText(agent.name, 24, 33);
    }
    ctx.restore();
  }
  function tick(now) {
    frame = 0;
    if (!ready || !visible()) { clear(); return; }
    canvas.hidden = false;
    const delta = Math.min(50, now - previous || 16); previous = now;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    assign(now);
    let working = false;
    agents.forEach((agent, index) => {
      if (index >= (coarse.matches ? 2 : 5)) return;
      let tx, ty;
      if (agent.task) {
        working = true;
        const task = agent.task, r = task.element.getBoundingClientRect();
        if (!task.element.isConnected || r.bottom < 60 || r.top > innerHeight || task.element.closest('[hidden]')) { finish(agent); scanPending = true; return; }
        const progress = Math.max(0, Math.min(1, (now - task.started - 180) / task.duration));
        task.element.style.setProperty('--swarm-cut', `${(1 - progress) * 100}%`);
        const x = Math.max(8, r.left - 3), y = Math.max(76, r.top - 3);
        const width = Math.min(r.width + 6, innerWidth - x - 8), height = Math.min(r.height + 6, innerHeight - y - 20);
        const route = progress * 2 * (width + height);
        ctx.save(); ctx.strokeStyle = agent.color; ctx.globalAlpha = .7; ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]); ctx.strokeRect(x, y, width, height); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x, y);
        if (route < width) { tx = x + route; ty = y; }
        else if (route < width + height) { ctx.lineTo(x + width, y); tx = x + width; ty = y + route - width; }
        else if (route < width * 2 + height) { ctx.lineTo(x + width, y);ctx.lineTo(x + width, y + height);tx = x + width - (route - width - height);ty = y + height; }
        else {ctx.lineTo(x + width, y);ctx.lineTo(x + width, y + height);ctx.lineTo(x, y + height);tx=x;ty=y+height-(route-width*2-height);}
        ctx.lineTo(tx, ty); ctx.stroke();
        if (innerWidth > 600) {
          const text = `${Math.round(r.width)} × ${Math.round(r.height)}`;
          ctx.font = '9px ui-monospace, monospace';ctx.fillStyle = '#091b2e';ctx.fillRect(x + 8, y - 17, ctx.measureText(text).width + 12, 17);ctx.fillStyle = agent.color;ctx.fillText(text, x + 14, y - 5);
        }
        ctx.restore();
        if (progress >= 1) { finish(agent); scanPending = true; }
      } else {
        const angle = now * .0006 + index * Math.PI * 2 / agents.length;
        const radius = coarse.matches ? 28 : 55 + index * 8;
        tx = Math.max(12, Math.min(innerWidth - 30, pointer.x + Math.cos(angle) * radius + 35));
        ty = Math.max(82, Math.min(innerHeight - 90, pointer.y + Math.sin(angle) * radius + 45));
      }
      const damping = 1 - Math.exp(-delta * .014);
      agent.x += (tx - agent.x) * damping; agent.y += (ty - agent.y) * damping;
      agent.alpha += ((now < activeUntil || agent.task ? 1 : 0) - agent.alpha) * damping;
      pointerShape(agent);
    });
    if (working || scanPending || now < activeUntil + 600) frame = requestAnimationFrame(tick);
    else {ctx.clearRect(0, 0, innerWidth, innerHeight);canvas.hidden = true;}
  }
  function wake() {
    if (!ready || !visible()) return;
    activeUntil = performance.now() + 2400;
    if (!frame) frame = requestAnimationFrame(tick);
  }
  toggle.onclick = () => { enabled = !enabled; localStorage.setItem('cv-swarm-enabled', String(enabled)); labels(); clear(); if (enabled) { complete = new WeakSet(); collect(); wake(); } };
  replay.onclick = () => { clear(); complete = new WeakSet(); collect(); controls.open = false; wake(); };
  addEventListener('pointermove', event => { if (event.pointerType === 'touch') return; pointer.x = event.clientX; pointer.y = event.clientY; wake(); }, {passive: true});
  addEventListener('scroll', () => { scanPending = true; wake(); }, {passive: true});
  addEventListener('resize', resize, {passive: true});
  addEventListener('portfolio-ready', () => {ready = true; collect(); resize();});
  addEventListener('portfolio-rendered', () => {collect(); labels(); wake();});
  document.addEventListener('visibilitychange', () => {if (document.hidden) clear();else wake();});
  document.addEventListener('focusin', event => { const agent = agents.find(agent => agent.task?.element.contains(event.target));if(agent)finish(agent); });
  document.addEventListener('click', event => {if(event.target.closest('[data-dossier],[data-certificate],.pcard__img'))clear();});
  document.addEventListener('close', () => {scanPending = true;wake();}, true);
  reduced.addEventListener('change', () => {clear();labels();wake();});
  new MutationObserver(() => {labels();if(root.dataset.view === 'metaverse')clear();else wake();}).observe(root,{attributes:true,attributeFilter:['data-view','data-lang']});
  labels(); collect(); resize(); canvas.hidden = true;
}
