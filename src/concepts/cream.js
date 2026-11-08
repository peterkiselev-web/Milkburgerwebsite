// Concept: Cream. Minimal, close to the Instagram: cream paper, burgundy ink, the logo up front.

import '../shared/base.css';
import './cream.css';
import { start } from '../shared/page.js';
import * as s from '../shared/sections.js';
import { img } from '../shared/images.js';

const { content, esc } = s;

const html = `
${s.draftStrip('Concept: Cream')}
${s.siteHeader()}

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
    ${s.rail(
      ['shopfront', 'burger', 'team', 'spread', 'mexican', 'chef', 'camembert']
        .map((key, i) => img(key, { className: 'tile', loading: i < 3 ? 'eager' : 'lazy' }))
        .join(''),
      { label: 'Photos from Milk Burger', className: 'rail--gallery' },
    )}
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
  ${s.instagram()}
  ${s.contact()}
  <div class="drips" aria-hidden="true"></div>
  ${s.visit()}
</main>
${s.footer()}
${s.newsletterPopup()}
`;

start(document.getElementById('app'), html);
