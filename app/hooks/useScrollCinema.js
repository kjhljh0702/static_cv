import { useLayoutEffect, useRef } from 'react';
import { createTimeline, animate } from 'animejs';

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const progress = (y, start, length) => clamp((y - start) / Math.max(1, length));

/** Native scrolling is never intercepted. All timeline work is batched into one RAF. */
export function useScrollCinema({ running, lang, filter }) {
  const readingPosition = useRef(null);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const restorePosition = () => {
      const saved = readingPosition.current;
      readingPosition.current = null;
      if (!saved) return;
      const element = document.getElementById(saved.id);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const header = document.querySelector('.site-header').offsetHeight;
      window.scrollTo({ top: Math.max(0, scrollY + rect.top + rect.height * saved.fraction - header), behavior: 'instant' });
    };
    const capturePosition = () => {
      const header = document.querySelector('.site-header').offsetHeight;
      for (const section of document.querySelectorAll('main > section[id]')) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= header + 1 && rect.bottom > header) {
          readingPosition.current = { id: section.id, fraction: clamp((header - rect.top) / rect.height) };
          break;
        }
      }
    };
    if (!running) { root.dataset.cinema = 'off'; restorePosition(); return capturePosition; }
    root.dataset.cinema = 'on';
    let frame = 0, stopped = false, lastStory = -1, bounds = {}, keyboard = false;
    const hero = document.querySelector('.hero-sequence');
    const heroSticky = document.querySelector('.hero-sticky');
    const story = document.querySelector('.scroll-story');
    const storySticky = document.querySelector('.story-sticky');
    const portrait = document.querySelector('.portrait-image img');
    const about = document.querySelector('#about');
    const journey = document.querySelector('#journey');
    const contact = document.querySelector('#contact');
    const strip = document.querySelector('.kinetic-track');
    const cards = [...document.querySelectorAll('.project-card')];
    const anchors = [...document.querySelectorAll('.project-anchor')];
    const desktop = matchMedia('(min-width: 1000px) and (min-height: 720px)');
    const timelines = [];
    const heroTimeline = createTimeline({ autoplay: false, defaults: { ease: 'linear' } })
      .add('.hero-copy h1', { translateY: [0, -90], opacity: [1, .08], duration: 1000 }, 0)
      .add('.hero-copy h1 .hero-line:nth-child(1)', { translateX: [0, -90], duration: 1000 }, 0)
      .add('.hero-copy h1 .hero-line:nth-child(2)', { translateX: [0, 55], duration: 1000 }, 0)
      .add('.hero-copy h1 .hero-line:nth-child(3)', { translateX: [0, -35], duration: 1000 }, 0)
      .add('.hero-intro, .hero-copy > .button', { translateY: [0, -35], opacity: [1, 0], duration: 450 }, 100)
      .add('.hero-scene-wrap', { translateX: ['0%', '-34%'], scale: [1, 1.22], duration: 1000 }, 0)
      .add('.hero-epilogue', { translateY: [45, 0], opacity: [0, 1], duration: 400 }, 580);
    timelines.push(heroTimeline);
    const storyTimeline = createTimeline({ autoplay: false, defaults: { ease: 'linear' } });
    for (let i = 0; i < 3; i++) {
      storyTimeline.add(`.story-beat-${i}`, {
        opacity: i === 0 ? [1, 1] : [0, 1],
        translateY: i === 0 ? [0, 0] : [70, 0],
        scale: i === 0 ? [1, 1] : [.94, 1],
        duration: 350,
      }, Math.max(0, i * 1000 - 180));
      if (i < 2) storyTimeline.add(`.story-beat-${i}`, { opacity: [1, 0], translateY: [0, -90], scale: [1, 1.06], duration: 320 }, i * 1000 + 650);
    }
    storyTimeline
      .add('.story-orbit', { rotate: [-35, 120], scale: [.75, 1.14], duration: 2850 }, 0)
      .add('.story-progress', { scaleX: [0, 1], duration: 2850 }, 0);
    timelines.push(storyTimeline);
    const contactAnimation = animate('.contact h2', { translateY: [65, 0], opacity: [.12, 1], duration: 1000, ease: 'linear', autoplay: false });
    timelines.push(contactAnimation);

    const box = el => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, height: r.height }; };
    const measure = () => {
      if (stopped) return;
      const header = document.querySelector('.site-header').offsetHeight;
      bounds = {
        height: innerHeight, width: innerWidth, header,
        hero: box(hero), heroHeight: heroSticky.offsetHeight,
        story: box(story), storyHeight: storySticky.offsetHeight,
        about: box(about), journey: box(journey), contact: box(contact),
        strip: box(strip.parentElement), cards: anchors.map((anchor, i) => box(desktop.matches ? anchor : cards[i])),
        fullHeight: document.documentElement.scrollHeight - innerHeight,
      };
      draw();
    };
    const draw = () => {
      frame = 0;
      if (stopped || !bounds.hero || document.hidden) return;
      const y = scrollY, vh = bounds.height;
      root.style.setProperty('--page-progress', progress(y, 0, bounds.fullHeight));
      if (desktop.matches) {
        const hp = progress(y, bounds.hero.top - bounds.header, bounds.hero.height - bounds.heroHeight);
        heroTimeline.seek(hp * heroTimeline.duration);
        hero.style.setProperty('--hero-progress', hp);
      } else heroTimeline.seek(0);
      const sp = progress(y, bounds.story.top - bounds.header, bounds.story.height - bounds.storyHeight);
      storyTimeline.seek(sp * storyTimeline.duration);
      const step = Math.min(2, Math.floor(sp * 2.85));
      if (step !== lastStory) {
        story.querySelectorAll('.story-dots span').forEach((el, i) => el.dataset.active = i === step ? 'true' : 'false');
        story.querySelector('.story-counter').textContent = `0${step + 1} / 03`;
        lastStory = step;
      }
      const ap = progress(y, bounds.about.top - vh, bounds.about.height + vh);
      portrait.style.transform = `translateY(${28 - ap * 56}px) scale(1.1)`;
      strip.style.transform = `translateX(${-progress(y, bounds.strip.top - vh, vh + bounds.strip.height) * Math.min(bounds.width * .3, 420)}px)`;
      cards.forEach((card, i) => {
        const next = bounds.cards[i + 1];
        const exit = desktop.matches && next ? progress(y, next.top - bounds.header - vh * .55, vh * .55) : 0;
        card.style.setProperty('--stack-scale', 1 - exit * .055);
        card.style.setProperty('--stack-lift', `${-exit * 14}px`);
        card.style.setProperty('--stack-shade', exit * .12);
        const entry = progress(y, bounds.cards[i].top - vh, vh * .82);
        card.style.setProperty('--image-reveal', `${(1 - entry) * 15}%`);
        card.style.setProperty('--image-scale', 1.08 - entry * .08);
      });
      journey.style.setProperty('--journey-progress', progress(y, bounds.journey.top - vh * .45, bounds.journey.height * .8));
      contactAnimation.seek(progress(y, bounds.contact.top - vh * .7, vh * .55) * 1000);
    };
    const schedule = () => { if (!frame && !stopped) frame = requestAnimationFrame(draw); };
    const focus = event => {
      if (!keyboard || !desktop.matches) return;
      const index = cards.findIndex(card => card.contains(event.target));
      if (index < 0 || !bounds.cards[index]) return;
      const top = bounds.cards[index].top - bounds.header - 24;
      if (scrollY > top + 70 || scrollY < top - innerHeight * .65) window.scrollTo({ top, behavior: 'instant' });
    };
    const onKey = event => { if (event.key === 'Tab') keyboard = true; };
    const onPointer = () => { keyboard = false; };
    const resized = () => { measure(); };
    const resizeObserver = new ResizeObserver(resized);
    [about, journey, contact, document.querySelector('.projects-grid')].forEach(el => resizeObserver.observe(el));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resized, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer, { passive: true });
    document.addEventListener('focusin', focus);
    document.fonts?.ready.then(() => { if (!stopped) measure(); });
    restorePosition();
    measure();
    return () => {
      capturePosition();
      stopped = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resized);
      document.removeEventListener('visibilitychange', schedule);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('focusin', focus);
      timelines.forEach(timeline => timeline.revert());
      portrait.style.removeProperty('transform');
      strip.style.removeProperty('transform');
      root.dataset.cinema = 'off';
      root.style.removeProperty('--page-progress');
      cards.forEach(card => ['--stack-scale', '--stack-lift', '--stack-shade', '--image-reveal', '--image-scale'].forEach(property => card.style.removeProperty(property)));
    };
  }, [running, lang, filter]);
}
