/* ------------------------------------------------------------------
   main.js — scroll-driven CV · anime.js v4
   ------------------------------------------------------------------ */
import {
  animate, createTimeline, stagger, utils, svg, spring, eases
} from '../../vendor/anime.esm.min.js';
import { render, setLang, getLang, UI, chars } from './render.js';

const q  = (s, r = document) => r.querySelector(s);
const qa = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

let DATA = null;
const ANI = [];   // animations
const an = (t, p) => { const a = animate(t, p); ANI.push(a); return a; };
const IOS = [];  // IntersectionObservers driving one-shot reveals
const teardown = () => {
  ANI.splice(0).forEach(a => { try { a.revert(); } catch (e) {} });
  IOS.splice(0).forEach(o => { try { o.disconnect(); } catch (e) {} });
  SCRUBS.splice(0);
  cancelAnimationFrame(scrubRAF);
};

/* One-shot reveals run off an IntersectionObserver rather than anime's
   ScrollObserver: in this build onScroll() silently ignores `enter`, so
   enter-triggered animations never fire. Scrubbed effects are driven by the
   scrub engine below for the same reason. onScroll() is not used at all. */
function inView(el, cb, margin = '0px 0px -10% 0px') {
  if (!el) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      cb();
    });
  }, { rootMargin: margin, threshold: 0.01 });
  io.observe(el);
  IOS.push(io);
}

/* ------------------------------------------------------------------
   Scrub engine.
   onScroll()'s `enter`/`leave` are ignored by this anime build, so a
   scrubbed animation gets whatever default range the observer picked —
   which is why sections used to "run out" before their animation
   finished. We map each one onto an explicit scroll range instead and
   drive it with seek(). range(vh) -> [startY, endY] in document coords.
   ------------------------------------------------------------------ */
const SCRUBS = [];
let scrubRAF = 0;

/* document-space top of an element (works for sticky/pinned ones too) */
function docTop(el) {
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  return y;
}

function scrub(target, params, range) {
  const a = an(target, { ...params, ease: 'linear', duration: 1000, autoplay: false });
  SCRUBS.push({ a, range });
  return a;
}

function startScrubs() {
  cancelAnimationFrame(scrubRAF);
  const tick = () => {
    const y = scrollY, vh = innerHeight;
    for (const s of SCRUBS) {
      const [from, to] = s.range(vh);
      const p = utils.clamp((y - from) / Math.max(1, to - from), 0, 1);
      s.a.seek(s.a.duration * p);
    }
    scrubRAF = requestAnimationFrame(tick);
  };
  tick();
}

/* animate `target`, held until `trigger` scrolls into view.
   choreograph() is rebuilt on load, resize and language switch, which
   re-applies every animation's start state. Anything already on screen (or
   scrolled past) must therefore catch up immediately, or the page would blank
   out everything above the viewport until you scrolled back to it. */
function whenSeen(trigger, target, params, margin) {
  const a = an(target, { ...params, autoplay: false });
  if (trigger && trigger.getBoundingClientRect().top < innerHeight) {
    a.play();
    return a;
  }
  inView(trigger, () => a.play(), margin);
  return a;
}

/* ==================================================================
   1. AMBIENT — aurora canvas
   ================================================================== */
function aurora() {
  const cv = q('#aurora');
  const ctx = cv.getContext('2d');
  const DPR = 0.28;                    // heavy downscale, then CSS-stretched
  const blobs = [
    { x:.22, y:.28, r:.42, c:'139,92,246', s:.00021, p:0 },
    { x:.78, y:.34, r:.36, c:'34,211,238', s:.00017, p:2.1 },
    { x:.50, y:.78, r:.44, c:'244,114,182', s:.00013, p:4.2 },
    { x:.10, y:.72, r:.30, c:'99,102,241', s:.00025, p:1.1 }
  ];
  let W, H;
  const size = () => {
    W = cv.width  = Math.max(2, Math.floor(innerWidth  * DPR));
    H = cv.height = Math.max(2, Math.floor(innerHeight * DPR));
  };
  size();
  addEventListener('resize', size, { passive:true });

  let sy = 0;
  const draw = (tm) => {
    sy = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      const t = tm * b.s + b.p;
      const cx = (b.x + Math.cos(t) * .13) * W;
      const cy = (b.y + Math.sin(t * 1.25) * .11 - sy * .28) * H;
      const rr = b.r * W * (0.86 + Math.sin(t * 1.7) * .14);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      g.addColorStop(0,   `rgba(${b.c},0.55)`);
      g.addColorStop(0.5, `rgba(${b.c},0.16)`);
      g.addColorStop(1,   `rgba(${b.c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  };
  if (!REDUCED) requestAnimationFrame(draw); else draw(0);
}

/* ==================================================================
   2. CURSOR — spring follower
   ================================================================== */
function cursor() {
  if (matchMedia('(pointer:coarse)').matches) return;
  const dot = q('#cur'), ring = q('#curRing');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, scale = 1, tScale = 1;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY;
    if (!document.body.classList.contains('has-cursor')) document.body.classList.add('has-cursor'); }, { passive:true });
  const label = q('#curLabel');
  const hoverSel = 'a,button,[data-magnet],.pcard,.xcard,.chip,.tag,[data-cursor]';
  addEventListener('pointerover', e => {
    const hit = e.target.closest(hoverSel);
    if (!hit) return;
    tScale = 2.15;
    const txt = hit.closest('[data-cursor]')?.dataset.cursor || '';
    label.textContent = txt;
    ring.classList.toggle('labelled', !!txt);
  }, true);
  addEventListener('pointerout', e => {
    if (!e.target.closest(hoverSel)) return;
    tScale = 1; label.textContent = ''; ring.classList.remove('labelled');
  }, true);
  const tick = () => {
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    scale += (tScale - scale) * .14;
    dot.style.transform  = `translate3d(${mx}px,${my}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${scale.toFixed(3)})`;
    requestAnimationFrame(tick);
  };
  tick();
}

/* ==================================================================
   3. CHROME — progress bar, sticky nav, active link
   ================================================================== */
function chrome() {
  const bar = q('#progressBar'), nav = q('#nav');
  const tick = () => {
    const max = document.body.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0).toFixed(3) + '%';
    nav.classList.toggle('stuck', scrollY > 40);
    requestAnimationFrame(tick);
  };
  tick();

  // re-queried on demand: render() replaces these nodes on every language switch
  const links = () => qa('#navLinks a');
  const pill  = () => q('#navPill');

  /* each section owns an accent; --a is a registered custom property so the
     whole palette eases between them instead of snapping */
  const ACCENT = {
    hero:'#a78bfa', about:'#a78bfa', experience:'#22d3ee', education:'#34d399',
    projects:'#f472b6', skills:'#60a5fa', publications:'#fbbf24',
    awards:'#fb923c', contact:'#a78bfa'
  };

  const movePill = (a) => {
    const p = pill();
    if (!p || !a) return;
    p.style.opacity = '1';
    animate(p, {
      x: a.offsetLeft, width: a.offsetWidth,
      duration: 620, ease: spring({ stiffness: 150, damping: 16 })
    });
  };

  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const id = '#' + e.target.id;
      if (ACCENT[e.target.id]) {
        document.documentElement.style.setProperty('--a', ACCENT[e.target.id]);
      }
      let active = null;
      qa('#navLinks a,#menuLinks a').forEach(a => {
        const on = a.dataset.nav === id || (id === '#hero' && a.dataset.nav === '#top');
        a.classList.toggle('on', on);
        if (on) active = a;
      });
      movePill(active);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['hero','about','experience','education','projects','skills','publications','awards','contact']
    .forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });

  // delegated, so re-rendered nav/menu links keep working after a language switch
  document.addEventListener('click', ev => {
    const a = ev.target.closest('a[href^="#"]');
    if (!a) return;
    const el = q(a.getAttribute('href'));
    if (!el) return;
    ev.preventDefault();
    closeMenu();
    scrollTo({ top: docTop(el), behavior: 'smooth' });
  });
}

/* ==================================================================
   4. LOADER
   ================================================================== */
function loader() {
  const wrap = q('#loader'), curtain = q('#curtain');
  q('#loaderName').innerHTML = chars('JEONGHUN LEE');
  document.body.classList.add('is-locked');

  const counter = { v: 0 };
  const tl = createTimeline({ defaults: { ease: 'out(3)' } })
    .add('#loaderName .ch', {
      y: ['110%', '0%'], opacity: [0, 1], duration: 900,
      delay: stagger(28), ease: 'out(4)'
    }, 0)
    .add('#loadBar', { width: ['0%', '100%'], duration: 1500, ease: 'inOut(2)' }, 200)
    .add(counter, {
      v: 100, duration: 1500, ease: 'inOut(2)', modifier: utils.round(0),
      onUpdate: () => { q('#loadNum').textContent = String(Math.round(counter.v)).padStart(3, '0'); }
    }, 200)
    .add('#loaderName .ch', { y: '-110%', opacity: 0, duration: 620, delay: stagger(14), ease: 'in(3)' }, 1850)
    .add(['#loadBar', '#loadNum'], { opacity: 0, duration: 400 }, 1850)
    .call(() => { curtain.hidden = false; }, 2150)
    .add('#curtain i', {
      scaleY: [1, 0], duration: 800, delay: stagger(70), ease: 'inOut(4)',
      onComplete: () => { curtain.hidden = true; }
    }, 2200)
    .call(() => {
      wrap.style.display = 'none';
      document.body.classList.remove('is-locked');
      heroIn();
      // build the scroll choreography only once the page is at full height again
      requestAnimationFrame(() => requestAnimationFrame(choreograph));
    }, 2260);

  if (REDUCED) {
    tl.pause(); wrap.style.display = 'none';
    document.body.classList.remove('is-locked');
    heroIn(); requestAnimationFrame(choreograph);
  }
}

/* hero entrance (runs once after the loader) */
function heroIn() {
  if (REDUCED) { qa('#heroName .ch,.hero__head,.hero__roles .chip,.hero__card,.scrollcue').forEach(e => e.style.opacity = 1); return; }
  createTimeline()
    .add('#heroName .ch', {
      y: ['118%', '0%'], rotateX: [-78, 0], opacity: [0, 1],
      duration: 1150, delay: stagger(22), ease: 'out(4)'
    }, 0)
    .add('.hero__head', { y: [26, 0], opacity: [0, 1], filter: ['blur(9px)', 'blur(0px)'], duration: 900, ease: 'out(3)' }, 420)
    .add('.hero__roles .chip', { y: [16, 0], opacity: [0, 1], scale: [.9, 1], duration: 700, delay: stagger(70), ease: spring({ stiffness: 130, damping: 13 }) }, 560)
    .add('.hero__card', { y: [44, 0], opacity: [0, 1], scale: [.96, 1], filter: ['blur(14px)', 'blur(0px)'], duration: 1200, ease: 'out(4)' }, 300)
    .add('.hero__ph img', { scale: [1.22, 1], duration: 1600, ease: 'out(4)' }, 300)
    .add('.meta div', { opacity: [0, 1], x: [-10, 0], duration: 520, delay: stagger(60) }, 800)
    .add('.scrollcue', { opacity: [0, 1], duration: 700 }, 1200);
}

/* ==================================================================
   5. SCROLL CHOREOGRAPHY  (rebuilt whenever the language changes)
   ================================================================== */

/* section headings -> per-word masked lines.
   Splits INSIDE each [data-t] span so render() can still swap the language;
   re-running is cheap because an already-split span is skipped. */
function splitTitles() {
  qa('.title [data-t]').forEach(sp => {
    if (sp.querySelector('.tline')) return;
    const em = sp.tagName === 'EM';
    sp.innerHTML = sp.textContent.trim().split(/\s+/).map(w =>
      `<span class="tline"><i class="tw${em ? ' em' : ''}">${w}</i></span>`).join(' ');
  });
}

/* character scramble that settles into the real label */
const GLYPH_EN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*/<>';
const GLYPH_KO = '가나다라마바사아자차카타파하겨묘뉴';
function scrambleOn(el) {
  const final = el.dataset.txt || el.textContent;
  const G = /[^\x00-\x7F]/.test(final) ? GLYPH_KO : GLYPH_EN;
  const n = final.length, o = { v: 0 };
  const a = an(o, {
    v: 1, duration: 760, ease: 'out(3)',
    onUpdate: () => {
      const k = Math.floor(o.v * n);
      let out = '';
      for (let i = 0; i < n; i++) {
        const c = final[i];
        out += (i < k || c === ' ') ? c : G[(Math.random() * G.length) | 0];
      }
      el.textContent = out;
    },
    onComplete: () => { el.textContent = final; },
    autoplay: false
  });
  inView(el, () => a.play());
}

/* the reveal vocabulary — one entry per data-reveal value */
const REVEALS = {
  ''         : { opacity:[0,1], y:[38,0], filter:['blur(12px)','blur(0px)'], duration:900, ease:'out(3)' },
  'slide-l'  : { opacity:[0,1], x:[-46,0], duration:820, ease:'out(4)' },
  'slide-r'  : { opacity:[0,1], x:[46,0],  duration:820, ease:'out(4)' },
  'scale'    : { opacity:[0,1], scale:[.82,1], duration:760, ease:spring({ stiffness:150, damping:13 }) },
  'flip'     : { opacity:[0,1], rotateX:[-46,0], y:[46,0], duration:1000, ease:'out(4)' }
};

/* prefers-reduced-motion: skip the choreography entirely and paint every
   section in its finished state, so nothing depends on an animation running */
function showStatic() {
  document.body.classList.add('no-motion');
  qa('[data-count]').forEach(el => {
    el.textContent = parseFloat(el.dataset.count).toFixed(parseInt(el.dataset.dp || '0', 10));
  });
  qa('.scrub .w').forEach(w => { w.style.color = 'rgba(243,243,248,1)'; });
  qa('.edu__node,.award__seal,.pub__medal,.stat__n,.marq,.pcard,.xcard,.cta,.links a,#contactH .ch,.tag,.sk li')
    .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'none'; });
  const rail = q('#hrailFill'); if (rail) rail.style.width = '100%';
}

function choreograph() {
  teardown();
  if (REDUCED) { showStatic(); return; }
  splitTitles();

  /* -- 5.0 typed reveals --------------------------------------- */
  qa('[data-reveal]').forEach(el => {
    const kind = el.dataset.reveal || '';

    if (kind === 'mask') {
      // clip-path can't be tweened directly -> drive it from a numeric proxy.
      // Trigger off the parent: a fully clipped element never registers as
      // intersecting, so watching `el` itself would deadlock the reveal.
      const trig = el.parentElement || el;
      const o = { v: 100 };
      el.style.clipPath = 'inset(0 0 100% 0)';
      whenSeen(trig, o, {
        v: 0, duration: 900, ease: 'out(4)',
        onUpdate: () => { el.style.clipPath = `inset(0 0 ${o.v.toFixed(2)}% 0)`; },
        onComplete: () => { el.style.clipPath = 'none'; }
      });
      whenSeen(trig, el, { opacity:[0,1], y:[26,0], duration:800, ease:'out(3)' });
      return;
    }
    if (kind === 'flip') el.style.perspective = '1000px';
    whenSeen(el, el, REVEALS[kind] || REVEALS['']);
  });

  /* -- 5.0b section headings rise word by word ------------------ */
  qa('.title').forEach(h => {
    const tw = qa('.tw', h);
    if (!tw.length) return;
    whenSeen(h, tw, {
      y: ['115%','0%'], rotateZ: [4, 0], opacity: [0, 1],
      duration: 1000, delay: stagger(70), ease: 'out(4)'
    });
  });

  /* -- 5.0c eyebrows scramble in --------------------------------- */
  qa('.eyebrow').forEach(el => scrambleOn(el));

  /* -- 5.1 hero scrolls away ------------------------------------ */
  const hero = q('.hero');
  const heroRange = (vh) => [0, Math.max(1, hero.offsetHeight * 0.9)];
  scrub('.hero__grid', {
    y: [0, -70], scale: [1, .93], opacity: [1, 0], filter: ['blur(0px)', 'blur(14px)']
  }, heroRange);
  /* the portrait drifts a touch slower than the copy -> depth */
  scrub('.hero__card', { y: [0, 46] }, heroRange);
  scrub('.scrollcue', { opacity: [1, 0] }, () => [0, hero.offsetHeight * 0.28]);

  /* -- 5.2 about: word-by-word illumination --------------------- */
  const words = qa('.scrub .w');
  if (words.length) {
    // finish the sentence a little before the stage ends, so the last word
    // is lit while the section is still on screen
    const stage = q('.about__stage');
    an(words, {
      color: ['rgba(243,243,248,.13)', 'rgba(243,243,248,1)'],
      duration: 120, delay: stagger(28), ease: 'linear', autoplay: false
    });
    const aw = ANI[ANI.length - 1];
    SCRUBS.push({ a: aw, range: (vh) => {
      const top = docTop(stage);
      return [top, top + Math.max(1, stage.offsetHeight - vh) * 0.82];
    }});
  }

  /* -- 5.2b stat band: counters + rule that draws itself --------- */
  qa('.stat').forEach((s, i) => {
    whenSeen(s, q('.stat__n', s), {
      opacity: [0, 1], y: [30, 0], duration: 760, delay: i * 90, ease: 'out(4)'
    });
    whenSeen(s, s, {
      '--w': ['0%', '100%'], duration: 900, delay: i * 90, ease: 'out(3)'
    });
  });

  /* -- 5.3 marquee: two rows drifting against each other -------- */
  const track = q('#marq'), track2 = q('#marq2');
  if (track && !REDUCED) {
    an(track,  { x: ['0%', '-33.3333%'], duration: 26000, ease: 'linear', loop: true });
    if (track2) an(track2, { x: ['-33.3333%', '0%'], duration: 34000, ease: 'linear', loop: true });
    whenSeen(q('.marq'), q('.marq'), { opacity: [0, 1], duration: 600 });
  }

  /* -- 5.4 experience: pinned horizontal scroll ------------------ */
  const htrack = q('#htrack');
  if (htrack) {
    const stageEl = q('.hstage');
    const pad = innerWidth < 760 ? 24 : 60;
    const dist = Math.max(0, htrack.scrollWidth - innerWidth + pad);
    // the track finishes travelling slightly before the pin releases
    const hRange = (vh) => {
      const top = docTop(stageEl);
      return [top, top + Math.max(1, stageEl.offsetHeight - vh) * 0.92];
    };
    scrub(htrack, { x: [0, -dist] }, hRange);
    scrub('#hrailFill', { width: ['0%', '100%'] }, hRange);

    qa('.xcard').forEach((c, i) => {
      c.style.perspective = '1200px';
      whenSeen(q('.hstage'), c, {
        opacity: [0, 1], y: [50, 0], scale: [.94, 1], rotateY: [-14, 0],
        duration: 900, delay: i * 90, ease: 'out(3)'
      });
    });
    whenSeen(q('.hstage'), '.hpin__head', {
      opacity: [0, 1], y: [30, 0], duration: 800, ease: 'out(3)'
    });
  }

  /* -- 5.5 education: line draws, nodes pop along it ------------- */
  const line = q('#eduLine');
  if (line) {
    const edu = q('#education');
    scrub(svg.createDrawable(line), { draw: ['0 0', '0 1'] }, (vh) => {
      const top = docTop(edu);
      return [top - vh * 0.75, top + edu.offsetHeight - vh * 0.55];
    });
  }
  qa('.edu__node').forEach(nd => {
    whenSeen(nd, nd, {
      opacity: [0, 1], scale: [0, 1], duration: 640,
      ease: spring({ stiffness: 180, damping: 12 })
    });
  });

  /* counters (stat band + GPA) — decimal places come from data-dp */
  qa('[data-count]').forEach(el => {
    const to = parseFloat(el.dataset.count);
    const dp = parseInt(el.dataset.dp || '0', 10);
    const o = { v: 0 };
    whenSeen(el, o, {
      v: to, duration: 1500, ease: 'out(4)',
      onUpdate: () => { el.textContent = o.v.toFixed(dp); }
    });
  });

  /* -- 5.6 projects: stacked cards, parallax, scrubbing numeral -- */
  const cards = qa('.pcard');
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (next) {
      // shrink while the NEXT card travels from the fold up to its sticky rest
      scrub(card, {
        scale: [1, .90], opacity: [1, .28], filter: ['blur(0px)', 'blur(7px)']
      }, (vh) => {
        const nt = docTop(next);
        return [nt - vh, nt - vh * 0.12 - i * 16];
      });
    }
    whenSeen(card, card, { y: [70, 0], opacity: [0, 1], duration: 900, ease: 'out(3)' });
    const cardRange = (vh) => {
      const ct = docTop(card);
      return [ct - vh, ct + card.offsetHeight];
    };
    const img = q('img', card);
    if (img) scrub(img, { scale: [1.18, 1.02], y: ['-5%', '5%'] }, cardRange);
    const idx = q('.pcard__idx', card);
    if (idx) scrub(idx, { y: [40, -40], opacity: [.25, 1] }, cardRange);
    whenSeen(card, qa('.tag', card), {
      opacity: [0, 1], y: [14, 0], scale: [.9, 1],
      duration: 560, delay: stagger(45), ease: spring({ stiffness: 160, damping: 14 })
    });
  });

  /* -- 5.7 skills: diagonal wave across the whole grid ----------- */
  const lis = qa('.sk li');
  if (lis.length) {
    const grid = q('#skGrid');
    const gb = grid.getBoundingClientRect();
    const delayOf = lis.map(li => {
      const b = li.getBoundingClientRect();
      return ((b.left - gb.left) / Math.max(1, gb.width) + (b.top - gb.top) / Math.max(1, gb.height)) * 520;
    });
    lis.forEach((li, i) => {
      whenSeen(grid, li, {
        opacity: [0, 1], y: [22, 0], scale: [.88, 1], duration: 640,
        delay: delayOf[i], ease: spring({ stiffness: 150, damping: 14 })
      });
    });
  }

  /* -- 5.8 contact: per-character rise ------------------------- */
  const cch = qa('#contactH .ch');
  if (cch.length) {
    const ct = q('#contact');
    whenSeen(ct, cch, {
      y: ['110%', '0%'], opacity: [0, 1], rotateZ: [6, 0],
      duration: 1000, delay: stagger(16), ease: 'out(4)'
    });
    whenSeen(ct, ['.cta', '.links a'], {
      opacity: [0, 1], y: [22, 0], duration: 700, delay: stagger(60), ease: 'out(3)'
    });
  }

  /* -- 5.9 award: seal stamps down, sheen sweeps across ---------- */
  const seal = q('.award__seal');
  if (seal) {
    const aw = q('.award');
    whenSeen(aw, seal, {
      scale: [2.4, 1], rotate: [-28, 0], opacity: [0, 1],
      duration: 900, ease: 'out(5)'
    });
    whenSeen(aw, '.award__sheen', {
      x: ['0%', '420%'], duration: 1500, delay: 500, ease: 'inOut(3)'
    });
  }
  qa('.pub__medal').forEach(m => {
    whenSeen(m, m, {
      scale: [0, 1], rotate: [-140, 0], duration: 800,
      ease: spring({ stiffness: 170, damping: 11 })
    });
  });

  startScrubs();
}

/* the marquee leans into whichever way you are scrolling */
function marqueeSkew() {
  const skewer = q('.marq__skew');
  if (!skewer || REDUCED) return;
  let last = scrollY, vel = 0;
  const tick = () => {
    const d = scrollY - last; last = scrollY;
    vel += (d - vel) * 0.12;
    const s = utils.clamp(vel * 0.18, -9, 9);
    skewer.style.transform = `skewX(${s.toFixed(2)}deg) scaleY(${(1 - Math.abs(s) * 0.006).toFixed(3)})`;
    requestAnimationFrame(tick);
  };
  tick();
}

/* ==================================================================
   5b. MENU · DRAG · LIGHTBOX  (the interactions the cursor advertises)
   ================================================================== */
function closeMenu() {
  const m = q('#menu'), b = q('#navBtn');
  if (!m || !m.classList.contains('on')) return;
  document.body.classList.remove('menu-open');
  m.classList.remove('on');
  m.setAttribute('aria-hidden', 'true');
  if (b) b.setAttribute('aria-expanded', 'false');
}

function menu() {
  const btn = q('#navBtn'), m = q('#menu');
  if (!btn || !m) return;
  btn.addEventListener('click', () => {
    if (m.classList.contains('on')) return closeMenu();
    document.body.classList.add('menu-open');
    m.classList.add('on');
    m.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    animate(qa('#menuLinks a'), {
      opacity: [0, 1], y: [30, 0], duration: 520,
      delay: stagger(60), ease: 'out(3)'
    });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* The experience track's horizontal position is derived from vertical scroll,
   so dragging it sideways simply scrolls the page — the "Drag" cursor now
   does what it says, on mouse and touch alike. */
function dragTrack() {
  const track = q('#htrack'), stage = q('.hstage');
  if (!track || !stage) return;
  let down = false, lastX = 0, moved = 0;

  const ratio = () => {
    const travel = Math.max(1, track.scrollWidth - innerWidth + 60);
    const scrollSpan = Math.max(1, stage.offsetHeight - innerHeight) * 0.92;
    return scrollSpan / travel;          // px of page scroll per px dragged
  };

  track.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    down = true; lastX = e.clientX; moved = 0;
    track.setPointerCapture?.(e.pointerId);
    track.style.cursor = 'grabbing';
  });
  track.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    moved += Math.abs(dx);
    if (e.pointerType !== 'touch') e.preventDefault();
    scrollBy(0, -dx * ratio());
  });
  const end = (e) => {
    if (!down) return;
    down = false;
    track.style.cursor = '';
    try { track.releasePointerCapture?.(e.pointerId); } catch (_) {}
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  track.style.touchAction = 'pan-y';     // let vertical touch scrolling through
  track.style.cursor = 'grab';
}

/* "View" on a project card opens its image full-size. */
function lightbox() {
  const box = q('#lightbox');
  if (!box) return;
  const img = q('img', box), cap = q('#lbCap');

  const close = () => {
    animate(box, { opacity: [1, 0], duration: 220, ease: 'out(3)',
      onComplete: () => { box.hidden = true; document.body.classList.remove('menu-open'); } });
  };

  document.addEventListener('click', ev => {
    const card = ev.target.closest('.pcard,.award__cert');
    if (card) {
      const src = q('img', card);
      if (!src) return;
      img.src = src.currentSrc || src.src;
      cap.textContent = (q('h3', card) || q('img', card) || {}).alt
        || (q('h3', card) || {}).textContent || '';
      box.hidden = false;
      document.body.classList.add('menu-open');
      animate(box, { opacity: [0, 1], duration: 260, ease: 'out(3)' });
      animate(q('.lb__in', box), {
        scale: [.92, 1], y: [24, 0], opacity: [0, 1],
        duration: 620, ease: spring({ stiffness: 140, damping: 15 })
      });
      return;
    }
    if (ev.target.closest('#lightbox')) close();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) close(); });
}

/* ==================================================================
   5c. 3D WORLD TOGGLE
   Only active where the metaverse markup exists (myhub_01_static).
   metaverse.js exposes window.MyHubMetaverse and reads <html> lang +
   data-theme, so this keeps those in sync.
   ================================================================== */
const worldOn = () => document.documentElement.dataset.view === 'metaverse';

function syncWorldLang(lang) {
  document.documentElement.lang = lang;
  try { window.MyHubMetaverse?.setLanguage(lang); } catch (e) {}
}

function setWorld(on) {
  const root = document.documentElement, shell = q('#cv-shell'), btn = q('#worldBtn');
  if (!shell) return;
  root.dataset.view = on ? 'metaverse' : 'classic';
  shell.hidden = on;
  shell.inert = on;
  document.body.classList.toggle('world-on', on);
  if (btn) btn.setAttribute('aria-pressed', String(on));
  const mv = window.MyHubMetaverse;
  if (!mv) return;
  try {
    mv.setTheme(root.dataset.theme || 'dark');
    mv.setLanguage(root.lang || getLang());
    mv.setEnabled(on);
  } catch (e) { console.error('[cv] world toggle failed', e); }
}

function worldToggle() {
  const btn = q('#worldBtn');
  if (!btn) return;
  btn.addEventListener('click', () => setWorld(!worldOn()));
  // the world dialog and pointer lock own Escape while it is open; only
  // fall back to leaving the world when nothing else is handling it
  addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !worldOn()) return;
    const dlg = q('#world-detail-dialog');
    if (dlg?.open || document.pointerLockElement) return;
    setWorld(false);
  });
}

/* ==================================================================
   6. POINTER FLOURISHES — tilt + magnetic
   ================================================================== */
function pointerFx() {
  qa('[data-tilt]').forEach(el => {
    const r = () => el.getBoundingClientRect();
    el.addEventListener('pointermove', e => {
      const b = r(), px = (e.clientX - b.left) / b.width - .5, py = (e.clientY - b.top) / b.height - .5;
      animate(el, { rotateY: px * 11, rotateX: -py * 11, duration: 500, ease: 'out(3)' });
    });
    el.addEventListener('pointerleave', () => animate(el, { rotateY: 0, rotateX: 0, duration: 800, ease: spring({ stiffness: 90, damping: 12 }) }));
    el.style.transformStyle = 'preserve-3d';
    el.style.perspective = '900px';
  });

  qa('[data-magnet]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const b = el.getBoundingClientRect();
      animate(el, { x: (e.clientX - (b.left + b.width / 2)) * .28, y: (e.clientY - (b.top + b.height / 2)) * .4, duration: 400, ease: 'out(3)' });
    });
    el.addEventListener('pointerleave', () => animate(el, { x: 0, y: 0, duration: 900, ease: spring({ stiffness: 120, damping: 11 }) }));
  });
}

/* ==================================================================
   7. BOOT
   ================================================================== */
async function boot() {
  const saved = localStorage.getItem('cv-lang');
  const lang0 = (saved === 'ko' || saved === 'en') ? saved : 'en';
  setLang(lang0);
  document.documentElement.lang = lang0;

  DATA = await (await fetch('data.json')).json();
  render(DATA);

  aurora(); cursor(); chrome(); pointerFx(); marqueeSkew();
  menu(); dragTrack(); lightbox(); worldToggle();
  requestAnimationFrame(loader);

  // images change the document height -> rebuild the observers once everything is in
  addEventListener('load', () => setTimeout(choreograph, 120));

  /* language toggle -> re-render + rebuild the choreography */
  q('#langBtn').addEventListener('click', () => {
    const next = getLang() === 'en' ? 'ko' : 'en';
    const y = scrollY;
    setLang(next); localStorage.setItem('cv-lang', next);
    syncWorldLang(next);
    q('#langOn').textContent = next.toUpperCase();
    q('#langOff').textContent = next === 'en' ? 'KO' : 'EN';
    render(DATA);
    pointerFx();
    requestAnimationFrame(() => {
      choreograph();
      qa('#heroName .ch,.hero__head,.hero__roles .chip,.meta div,.scrollcue').forEach(e => { e.style.opacity = 1; });
      scrollTo({ top: y });
      animate('main', { opacity: [.25, 1], duration: 600, ease: 'out(3)' });
    });
  });

  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(choreograph, 350); }, { passive: true });
}

boot().catch(err => {
  console.error('[cv] boot failed', err);
  document.body.classList.add('no-motion');
  const l = q('#loader'); if (l) l.style.display = 'none';
  document.body.classList.remove('is-locked');
});
