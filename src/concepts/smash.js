// Concept: Smash vs Juicy. The founders' running argument becomes the site:
// pick a side and the whole page re-themes around your team.

import '../shared/base.css';
import './smash.css';
import { start } from '../shared/page.js';
import * as s from '../shared/sections.js';

const { content, esc } = s;
const t = content.teams;
const STORAGE_KEY = 'mb-team';
const label = { smash: 'Team Smash', juicy: 'Team Juicy' };

const pressItems = content.press
  .map((p) => `<li class="marquee__item"><q>${esc(p.quote)}</q><span>${esc(p.outlet)}</span></li>`)
  .join('');

const html = `
${s.draftStrip('Concept: Smash vs Juicy')}
<header class="sj-bar">
  <a href="#top" class="sj-bar__logo" aria-label="Milk Burger, back to top">${s.logo()}</a>
  ${s.statusPill('sj-bar__status')}
  <div class="sj-bar__team" data-team-chip hidden>
    <span data-team-label></span>
    <button type="button" data-switch-team>Switch sides</button>
  </div>
  <nav class="sj-bar__nav" aria-label="Sections">
    <a href="#menu">Menu</a>
    <a href="#visit">Visit</a>
  </nav>
</header>

<main id="top">
  <section class="split" aria-labelledby="split-title">
    <h1 class="visually-hidden" id="split-title">Milk Burger: smash or juicy?</h1>
    <div class="split__side split__side--smash">
      <p class="split__kicker">${esc(t.smash.label)}</p>
      <p class="split__word" aria-hidden="true">Smash</p>
      <p class="split__line">${esc(t.smash.line)}</p>
      <button type="button" class="split__pick" data-pick="smash" aria-pressed="false">I'm team smash</button>
    </div>
    <div class="split__side split__side--juicy">
      <p class="split__kicker">${esc(t.juicy.label)}</p>
      <p class="split__word" aria-hidden="true">Juicy</p>
      <p class="split__line">${esc(t.juicy.line)}</p>
      <button type="button" class="split__pick" data-pick="juicy" aria-pressed="false">I'm team juicy</button>
    </div>
    <div class="split__center">
      ${s.logo('split__logo')}
      <p class="split__tagline">${esc(content.tagline)}</p>
      <p class="split__ask" data-ask aria-live="polite">Pick a side.</p>
    </div>
  </section>

  <section class="sj-intro">
    <p class="sj-intro__lede">${esc(t.body)}</p>
    <blockquote class="quote quote--large"><p>${esc(t.quote.text)}</p><cite>${esc(t.quote.by)}</cite></blockquote>
    <p class="sj-intro__small">${esc(content.intro)}</p>
  </section>

  ${s.menu({ title: 'Both teams. One menu.' })}
  ${s.kitchen()}

  <section class="section section--press" aria-labelledby="press-title">
    <h2 class="visually-hidden" id="press-title">What the press said</h2>
    <div class="marquee">
      <ul class="marquee__track">${pressItems}</ul>
      <ul class="marquee__track" aria-hidden="true">${pressItems}</ul>
    </div>
  </section>

  ${s.chef()}
  ${s.founders()}
  ${s.room()}
  ${s.history()}
  ${s.faq()}
  ${s.visit()}
</main>
${s.footer()}
`;

start(document.getElementById('app'), html);

const root = document.documentElement;
const burgers = document.querySelector('#menu-burgers .menu-section__items');
[...burgers.children].forEach((li, i) => (li.dataset.order = i));

function setTeam(team) {
  if (team) root.dataset.team = team;
  else delete root.dataset.team;
  try {
    if (team) localStorage.setItem(STORAGE_KEY, team);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode: the choice still applies for this visit.
  }

  const chip = document.querySelector('[data-team-chip]');
  chip.hidden = !team;
  chip.querySelector('[data-team-label]').textContent = team ? label[team] : '';
  document.querySelector('[data-ask]').textContent = team ? `${label[team]}. Good choice.` : 'Pick a side.';
  document.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pick === team)));

  // Your team's burgers go to the top of the menu.
  const rank = (li) => (team && li.dataset.team === team ? 0 : 1);
  [...burgers.children]
    .sort((a, b) => rank(a) - rank(b) || a.dataset.order - b.dataset.order)
    .forEach((li) => {
      li.classList.toggle('is-yours', Boolean(team) && li.dataset.team === team);
      burgers.append(li);
    });
}

document.querySelectorAll('[data-pick]').forEach((btn) =>
  btn.addEventListener('click', () => setTeam(root.dataset.team === btn.dataset.pick ? null : btn.dataset.pick)),
);
document.querySelector('[data-switch-team]').addEventListener('click', () =>
  setTeam(root.dataset.team === 'smash' ? 'juicy' : 'smash'),
);

setTeam(root.dataset.team || null);
