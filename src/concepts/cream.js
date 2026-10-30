// Concept: Cream. Minimal, close to the Instagram: cream paper, burgundy ink, the logo up front.

import '../shared/base.css';
import './cream.css';
import { start } from '../shared/page.js';
import * as s from '../shared/sections.js';
import { img } from '../shared/images.js';

const { content, esc } = s;

const html = `
${s.draftStrip('Concept: Cream')}
<header class="topbar">
  <a href="#top" class="topbar__logo" aria-label="Milk Burger, back to top">${s.logo()}</a>
  <nav class="topbar__nav" aria-label="Sections">
    <a href="#menu">Menu</a>
    <a href="#story">Story</a>
    <a href="#visit">Visit</a>
  </nav>
</header>

<main id="top">
  <section class="hero">
    <h1 class="visually-hidden">Milk Burger, burgers and Champagne in Notting Hill</h1>
    ${s.logo('hero__logo')}
    <p class="hero__tagline">${esc(content.tagline)}</p>
    <p class="hero__meta">${esc(content.positioning)} · ${esc(content.contact.street)}, ${esc(content.contact.area)}</p>
    <div class="hero__status">
      ${s.statusPill()}
      <span class="chip">Walk-ins only</span>
    </div>
    <div class="grid3">
      ${img('shopfront', { className: 'tile', loading: 'eager' })}
      ${img('burger', { className: 'tile', loading: 'eager' })}
      ${img('team', { className: 'tile', loading: 'eager' })}
    </div>
    <p class="hero__intro">${esc(content.intro)}</p>
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
  <div class="drips" aria-hidden="true"></div>
  ${s.visit()}
</main>
${s.footer()}
`;

start(document.getElementById('app'), html);
