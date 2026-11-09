// Concept: Cream. Minimal, close to the Instagram: cream paper, burgundy ink, the logo up front.

import '../shared/base.css';
import './cream.css';
import { start } from '../shared/page.js';
import * as s from '../shared/sections.js';
import { img } from '../shared/images.js';

const { content, esc } = s;

// The hero gallery: the shopfront, the people and the rooms, with the best dishes in between.
const gallery = [
  'shopfrontDay', 'truffle', 'team', 'classicSmash', 'tiledRoom', 'mexican',
  'bar', 'cherryPie', 'chef', 'doughnuts', 'camembert',
];

// Dish photos for the menu, captioned with the names on the printed menu.
const dishPhotos = [
  { image: 'truffle', caption: 'Bone Marrow & Truffle' },
  { image: 'classicSmash', caption: 'Classic Smash' },
  { image: 'mexican', caption: 'Nacho Burger' },
  { image: 'camembert', caption: 'Fried Camembert' },
  { image: 'fries', caption: "Koffmann's Fries" },
  { image: 'burgerFries', caption: 'Burger & fries' },
  { image: 'cherryPie', caption: 'Fried Cherry Pie & Soft Serve' },
  { image: 'doughnuts', caption: 'Warm Doughnuts & Soft Serve' },
];

const html = `
${s.draftStrip('Concept: Cream')}
${s.siteMenu()}

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
    ${s.quickLinks('hero__links')}
    ${s.rail(
      gallery.map((key, i) => img(key, { className: 'tile', loading: i < 3 ? 'eager' : 'lazy' })).join(''),
      { label: 'Photos from Milk Burger', className: 'rail--gallery' },
    )}
    <p class="hero__intro">${esc(content.intro)}</p>
  </section>

  ${s.menu({ photos: dishPhotos })}
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
${s.newsletterPopup({ body: content.newsletter.popupBody })}
`;

start(document.getElementById('app'), html);
