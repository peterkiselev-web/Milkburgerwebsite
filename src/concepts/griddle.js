// Concept: The Griddle. One burger's journey, scrubbed by scroll, from raw beef to the first bite.

import '../shared/base.css';
import './griddle.css';
import { start } from '../shared/page.js';
import * as s from '../shared/sections.js';
import { images } from '../shared/images.js';
import { createStandIn } from './griddle-standin.js';
import { loadFramePlayer } from './griddle-frames.js';

const { content, esc } = s;

const STAGES = [
  { title: 'Smash', line: 'Aged beef from Mr Txuleta, smashed onto hot stainless steel. “A burger doesn’t give you anywhere to hide.” Jorge Paredes' },
  { title: 'Melt', line: 'Cheese over the edges, straight onto the steel.' },
  { title: 'Pour', line: 'Champagne by the glass. The house pour is Billecart-Salmon.' },
  { title: 'Build', line: 'Sauces made from scratch. Thick-cut pickles. The glossy milk bun.' },
];

const captions = STAGES.map(
  (stage, i) => `
  <li class="caption">
    <span class="caption__n">${String(i + 1).padStart(2, '0')} / ${String(STAGES.length + 1).padStart(2, '0')}</span>
    <h2>${esc(stage.title)}</h2>
    <p>${esc(stage.line)}</p>
  </li>`,
).join('');

const html = `
${s.draftStrip('Concept: The Griddle')}
<header class="g-bar">
  <a href="#top" class="g-bar__logo" aria-label="Milk Burger, back to top">${s.logo()}</a>
  <nav class="g-bar__nav" aria-label="Sections">
    <a href="#menu">Menu</a>
    <a href="#story">Story</a>
    <a href="#visit">Visit</a>
  </nav>
</header>

<main id="top">
  <section class="film" aria-label="How a Milk Burger is made" style="--stages: ${STAGES.length + 1}">
    <div class="film__stage">
      <canvas class="film__canvas" aria-hidden="true"></canvas>
      <div class="film__intro">
        <h1 class="visually-hidden">Milk Burger, burgers and Champagne in Notting Hill</h1>
        ${s.logo('film__logo')}
        <p class="film__tagline">${esc(content.tagline)}</p>
        <p class="film__hint">Scroll to cook <span aria-hidden="true">↓</span></p>
      </div>
      <ol class="film__captions">
        ${captions}
        <li class="caption caption--final">
          <span class="caption__n">${String(STAGES.length + 1).padStart(2, '0')} / ${String(STAGES.length + 1).padStart(2, '0')}</span>
          <h2>${esc(content.tagline)}</h2>
          <p>${esc(content.contact.street)}. ${esc(content.hours.summary)}. Walk in.</p>
          <div class="caption__actions">
            <a class="button button--solid" href="#menu">See the menu</a>
            <a class="button" href="${esc(content.contact.mapsUrl)}" target="_blank" rel="noopener">Directions</a>
          </div>
        </li>
      </ol>
      <p class="film__badge">Stand-in animation. The Higgsfield film goes here.</p>
      <div class="film__progress" aria-hidden="true"><span></span></div>
    </div>
  </section>

  <section class="g-intro">
    <p>${esc(content.intro)}</p>
  </section>

  ${s.menu()}
  ${s.kitchen()}
  ${s.chef()}
  ${s.founders()}
  ${s.teams()}
  ${s.room()}
  ${s.history()}
  ${s.press()}
  ${s.faq()}
  ${s.visit()}
</main>
${s.footer()}

<a class="walk-in" href="#visit">
  ${s.statusPill('walk-in__status')}
  <span class="walk-in__where"><span class="walk-in__addr">50 Westbourne Grove · </span>Walk in</span>
</a>
`;

start(document.getElementById('app'), html);

const clamp = (v) => Math.min(1, Math.max(0, v));
const film = document.querySelector('.film');
const canvas = document.querySelector('.film__canvas');
const captionEls = [...document.querySelectorAll('.caption')];
const intro = document.querySelector('.film__intro');
const bar = document.querySelector('.film__progress span');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nothing is drawn until we know whether the real footage exists, so the
// stand-in never flashes up before the film.
let renderer = { resize() {}, draw() {} };

function progress() {
  const scrollable = film.offsetHeight - window.innerHeight;
  return scrollable > 0 ? clamp(-film.getBoundingClientRect().top / scrollable) : 1;
}

function paint(p) {
  renderer.draw(p);
  const beats = p * captionEls.length;
  captionEls.forEach((el, i) => {
    const local = beats - i;
    const last = i === captionEls.length - 1;
    // The first caption waits for the opening title to clear.
    const fadeIn = i === 0 ? clamp((local - 0.25) / 0.2) : clamp(local / 0.2);
    const fadeOut = last ? 1 : clamp((1 - local) / 0.2);
    const vis = fadeIn * fadeOut;
    el.style.opacity = vis;
    el.style.transform = `translateY(${(1 - vis) * 24}px)`;
    el.style.pointerEvents = vis > 0.5 ? 'auto' : 'none';
  });
  intro.style.opacity = clamp(1 - beats / 0.25);
  bar.style.transform = `scaleX(${p})`;
}

// Ease towards the scroll position so the film glides rather than jumps.
let current = 0;
let target = 0;
let raf = 0;
function tick() {
  current += (target - current) * (reduced ? 1 : 0.14);
  if (Math.abs(target - current) < 0.0004) current = target;
  paint(current);
  raf = current === target ? 0 : requestAnimationFrame(tick);
}
function requestPaint() {
  target = progress();
  if (!raf) raf = requestAnimationFrame(tick);
}

renderer.resize();
if (reduced) {
  document.documentElement.classList.add('film-static');
  paint(1);
} else {
  window.addEventListener('scroll', requestPaint, { passive: true });
  requestPaint();
}
window.addEventListener('resize', () => {
  renderer.resize();
  reduced ? paint(1) : requestPaint();
});

const repaint = () => (reduced ? paint(1) : requestPaint());

loadFramePlayer(canvas, `${import.meta.env.BASE_URL}griddle/frames/`, { onFrame: repaint }).then((player) => {
  if (player) {
    renderer = player;
    document.documentElement.classList.add('has-footage');
  } else {
    renderer = createStandIn(canvas, { photos: [images.spread.fallback, images.burger.src] });
  }
  renderer.resize();
  repaint();
});
