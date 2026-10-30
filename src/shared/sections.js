// HTML for every content section, built from restaurant.json.
// Each concept arranges and styles these differently; the words and facts stay identical.

import content from '../content/restaurant.json';
import logoSvg from '../brand/logo-placeholder.svg?raw';
import { img } from './images.js';

export { content };

export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const tbc = () => '<span class="tbc" title="To be confirmed with the restaurant">TBC</span>';

export const toConfirm = (confirmed) =>
  confirmed === false ? '<span class="needs-confirm" title="Needs confirming with the owners">to confirm</span>' : '';

const price = (value) => (value == null ? tbc() : `£${esc(value)}`);

const paragraphs = (list) => list.map((p) => `<p>${esc(p)}</p>`).join('');

const teamName = { smash: 'Team Smash', juicy: 'Team Juicy' };

export const logo = (className = '') => `<span class="logo ${className}">${logoSvg}</span>`;

export function draftStrip(current) {
  return `
  <div class="draft-strip" role="note">
    <p><strong>Draft for review.</strong> Anything marked <span class="tbc">TBC</span> or <span class="needs-confirm">to confirm</span> is waiting on the restaurant.</p>
    <div class="draft-strip__actions">
      <button type="button" class="draft-strip__toggle" data-draft-toggle aria-pressed="false">Hide markers</button>
      <a href="../" class="draft-strip__link">All concepts</a>
      <span class="draft-strip__current">${esc(current)}</span>
    </div>
  </div>`;
}

export function statusPill(className = '') {
  return `
  <p class="status ${className}" data-open-status>
    <span class="status__dot" aria-hidden="true"></span>
    <span data-open-label>${esc(content.hours.summary)}</span>
  </p>`;
}

export function menuItem(item) {
  const team = item.team ? ` data-team="${item.team}"` : '';
  return `
  <li class="menu-item${item.signature ? ' is-signature' : ''}"${team}>
    <div class="menu-item__head">
      <h4 class="menu-item__name">${esc(item.name)}${toConfirm(item.nameConfirmed)}</h4>
      <span class="menu-item__leader" aria-hidden="true"></span>
      <span class="menu-item__price">${price(item.price)}</span>
    </div>
    ${item.description ? `<p class="menu-item__desc">${esc(item.description)}</p>` : ''}
    ${item.team ? `<span class="menu-item__team">${teamName[item.team]}</span>` : ''}
  </li>`;
}

export function menuSection(section) {
  return `
  <div class="menu-section" id="menu-${section.id}">
    <h3 class="menu-section__title">${esc(section.title)}</h3>
    <ul class="menu-section__items">${section.items.map(menuItem).join('')}</ul>
  </div>`;
}

export function menu({ title = 'The menu' } = {}) {
  const { menu: m } = content;
  return `
  <section class="section section--menu" id="menu" aria-labelledby="menu-title">
    <header class="section__header">
      <h2 class="section__title" id="menu-title">${esc(title)}</h2>
      ${m.pricesConfirmed ? '' : `<p class="section__note">${esc(m.note)}</p>`}
    </header>
    <div class="menu-grid">${m.sections.map(menuSection).join('')}</div>
  </section>`;
}

export function teams() {
  const t = content.teams;
  return `
  <section class="section section--teams" id="teams" aria-labelledby="teams-title">
    <h2 class="section__title" id="teams-title">${esc(t.headline)}</h2>
    <p class="section__lede">${esc(t.body)}</p>
    <div class="teams">
      <div class="teams__side teams__side--smash"><h3>${esc(t.smash.label)}</h3><p>${esc(t.smash.line)}</p></div>
      <div class="teams__side teams__side--juicy"><h3>${esc(t.juicy.label)}</h3><p>${esc(t.juicy.line)}</p></div>
    </div>
    <blockquote class="quote"><p>${esc(t.quote.text)}</p><cite>${esc(t.quote.by)}</cite></blockquote>
  </section>`;
}

export function kitchen() {
  const k = content.kitchen;
  return `
  <section class="section section--kitchen" id="kitchen" aria-labelledby="kitchen-title">
    <h2 class="section__title" id="kitchen-title">${esc(k.headline)}</h2>
    <ul class="kitchen">
      ${k.points.map((p) => `<li class="kitchen__point"><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`).join('')}
    </ul>
  </section>`;
}

export function chef() {
  const c = content.chef;
  return `
  <section class="section section--chef" id="chef" aria-labelledby="chef-title">
    <p class="section__kicker">${esc(c.role)}</p>
    <h2 class="section__title" id="chef-title">${esc(c.name)}</h2>
    <div class="section__body">${paragraphs(c.bio)}</div>
    <blockquote class="quote quote--large"><p>${esc(c.quote)}</p><cite>${esc(c.name)}</cite></blockquote>
  </section>`;
}

export function founders({ withPhoto = true } = {}) {
  const f = content.founders;
  return `
  <section class="section section--founders" id="story" aria-labelledby="founders-title">
    ${withPhoto ? `<figure class="section__figure">${img('team', { className: 'photo' })}<figcaption>Jorge Paredes, Alina Kosichkina and Dima Zakhodiakin</figcaption></figure>` : ''}
    <div class="section__text">
      <p class="section__kicker">${esc(f.names)}</p>
      <h2 class="section__title" id="founders-title">${esc(f.headline)}</h2>
      <div class="section__body">${paragraphs(f.bio)}</div>
      <blockquote class="quote"><p>${esc(f.quote.text)}</p><cite>${esc(f.quote.by)}</cite></blockquote>
    </div>
  </section>`;
}

export function room() {
  const r = content.room;
  return `
  <section class="section section--room" id="room" aria-labelledby="room-title">
    <h2 class="section__title" id="room-title">${esc(r.headline)}</h2>
    <p class="section__lede">${esc(r.designer)}</p>
    <div class="rooms">
      ${r.rooms
        .map(
          (rm, i) => `
        <article class="room room--${i === 0 ? 'tiled' : 'light'}">
          <div class="room__swatch" aria-hidden="true"></div>
          <h3>${esc(rm.name)}</h3>
          <p>${esc(rm.body)}</p>
        </article>`,
        )
        .join('')}
    </div>
    <p class="section__note">${esc(r.details)}</p>
  </section>`;
}

export function history({ withPhoto = true } = {}) {
  const h = content.history;
  return `
  <section class="section section--history" id="history" aria-labelledby="history-title">
    ${withPhoto ? `<figure class="section__figure">${img('shopfront', { className: 'photo' })}</figure>` : ''}
    <div class="section__text">
      <h2 class="section__title" id="history-title">${esc(h.headline)}</h2>
      <p class="section__lede">${esc(h.body)}</p>
      <blockquote class="quote"><p>${esc(h.quote.text)}</p><cite>${esc(h.quote.by)}</cite></blockquote>
    </div>
  </section>`;
}

export function press({ title = 'What they said' } = {}) {
  return `
  <section class="section section--press" id="press" aria-labelledby="press-title">
    <h2 class="section__title" id="press-title">${esc(title)}</h2>
    <ul class="press">
      ${content.press
        .map(
          (p) => `
        <li class="press__item">
          <blockquote><p>${esc(p.quote)}</p></blockquote>
          <a class="press__outlet" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.outlet)}</a>
        </li>`,
        )
        .join('')}
    </ul>
  </section>`;
}

export function faq() {
  return `
  <section class="section section--faq" id="faq" aria-labelledby="faq-title">
    <h2 class="section__title" id="faq-title">Good to know</h2>
    <div class="faq">
      ${content.faq
        .map(
          (f) => `
        <details class="faq__item">
          <summary><span>${esc(f.q)}${toConfirm(f.confirmed)}</span></summary>
          <p>${esc(f.a)}</p>
        </details>`,
        )
        .join('')}
    </div>
  </section>`;
}

export function visit() {
  const { contact: c, hours: h, walkIn: w, transport } = content;
  return `
  <section class="section section--visit" id="visit" aria-labelledby="visit-title">
    <h2 class="section__title" id="visit-title">Come in</h2>
    ${statusPill('status--large')}
    <div class="visit">
      <div class="visit__block">
        <h3>Find us</h3>
        <address>${esc(c.street)}<br>${esc(c.area)}, ${esc(c.city)}<br>${esc(c.postcode)}</address>
        <a class="button" href="${esc(c.mapsUrl)}" target="_blank" rel="noopener">Open in Maps</a>
      </div>
      <div class="visit__block">
        <h3>Hours</h3>
        <p>${esc(h.summary)}</p>
        <p class="muted">${esc(h.detail)}</p>
      </div>
      <div class="visit__block">
        <h3>${esc(w.headline)}</h3>
        <p>${esc(w.body)}</p>
      </div>
      <div class="visit__block">
        <h3>Getting here</h3>
        <ul class="transport">
          ${transport.map((t) => `<li><strong>${esc(t.line)}</strong> ${esc(t.detail)}</li>`).join('')}
        </ul>
      </div>
      <div class="visit__block">
        <h3>Say hello</h3>
        <p><a href="${esc(c.instagram.url)}" target="_blank" rel="noopener">${esc(c.instagram.handle)}</a></p>
        <p><a href="tel:${esc(c.phone.value.replace(/\s/g, ''))}">${esc(c.phone.value)}</a>${toConfirm(c.phone.confirmed)}</p>
      </div>
    </div>
  </section>`;
}

export function footer() {
  const { contact: c, hours: h } = content;
  return `
  <footer class="footer">
    ${logo('footer__logo')}
    <p>${esc(c.street)}, ${esc(c.city)} ${esc(c.postcode)}</p>
    <p>${esc(h.summary)}. Walk-ins only.</p>
    <p><a href="${esc(c.instagram.url)}" target="_blank" rel="noopener">${esc(c.instagram.handle)}</a></p>
    <p class="footer__small">&copy; ${new Date().getFullYear()} Milk Burger</p>
  </footer>`;
}
