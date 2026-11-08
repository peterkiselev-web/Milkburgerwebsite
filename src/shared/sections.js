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

export function rail(items, { label, className = '' } = {}) {
  return `
  <div class="rail ${className}" data-rail>
    <div class="rail__track" tabindex="0" role="region" aria-label="${esc(label)}">${items}</div>
    <div class="rail__nav">
      <button type="button" class="rail__btn" data-rail-prev aria-label="Scroll back">&larr;</button>
      <button type="button" class="rail__btn" data-rail-next aria-label="Scroll forward">&rarr;</button>
    </div>
  </div>`;
}

// One header for every draft: logo, the main sections, and a "Visit" button that always
// shows whether they're open. On phones the sections become a swipeable row of chips.
export const navLinks = [
  ['menu', 'Menu'],
  ['chef', 'Story'],
  ['room', 'Rooms'],
  ['press', 'Press'],
  ['contact', 'Contact'],
];

export function siteHeader() {
  return `
  <header class="site-header" data-site-header>
    <a href="#top" class="site-header__logo" aria-label="Milk Burger, back to top">${logo()}</a>
    <nav class="site-nav" aria-label="Sections" data-site-nav>
      ${navLinks.map(([id, text]) => `<a href="#${id}" data-nav="${id}">${esc(text)}</a>`).join('')}
    </nav>
    <a class="site-header__cta" href="#visit" data-nav="visit" data-open-status>
      <span class="status__dot" aria-hidden="true"></span>
      <span>Visit</span>
    </a>
  </header>`;
}

export function draftStrip(current) {
  return `
  <div class="draft-strip" role="note">
    <p><strong>Draft for review.</strong> Anything marked <span class="tbc">TBC</span> or <span class="needs-confirm">to confirm</span> is waiting on the restaurant.</p>
    <div class="draft-strip__actions">
      <button type="button" class="draft-strip__toggle" data-draft-toggle aria-pressed="false">Hide markers</button>
      <button type="button" class="draft-strip__toggle" data-nl-open>Preview pop-up</button>
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
  const names = section.items.map((i) => i.name);
  const peek = names.length > 3 ? `${names.slice(0, 3).join(', ')} and more` : names.join(', ');
  return `
  <details class="menu-section" id="menu-${section.id}">
    <summary class="menu-section__summary">
      <span class="menu-section__heading">
        <h3 class="menu-section__title">${esc(section.title)}</h3>
        <span class="menu-section__peek">${esc(peek)}</span>
      </span>
      <span class="menu-section__count">${names.length}</span>
      <span class="menu-section__chev" aria-hidden="true"></span>
    </summary>
    <ul class="menu-section__items">${section.items.map(menuItem).join('')}</ul>
  </details>`;
}

export function menu({ title = 'The menu' } = {}) {
  const { menu: m } = content;
  return `
  <section class="section section--menu" id="menu" aria-labelledby="menu-title">
    <header class="section__header">
      <h2 class="section__title" id="menu-title">${esc(title)}</h2>
      ${m.pricesConfirmed ? '' : `<p class="section__note">${esc(m.note)}</p>`}
    </header>
    ${
      m.photos
        ? rail(
            m.photos
              .map((p) => `<figure class="menu-photo">${img(p.image, { className: 'menu-photo__img' })}<figcaption>${esc(p.caption)}</figcaption></figure>`)
              .join(''),
            { label: 'Dishes from the menu', className: 'rail--photos' },
          )
        : ''
    }
    <p class="menu-hint">Tap a section to open it.</p>
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
    ${rail(k.points.map((p) => `<article class="kitchen__point"><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></article>`).join(''), {
      label: 'How the kitchen works',
      className: 'rail--kitchen',
    })}
  </section>`;
}

export function chef() {
  const c = content.chef;
  return `
  <section class="section section--chef" id="chef" aria-labelledby="chef-title">
    <div class="section__text">
      <p class="section__kicker">${esc(c.role)}</p>
      <h2 class="section__title" id="chef-title">${esc(c.name)}</h2>
      <div class="section__body">${paragraphs(c.bio)}</div>
      <blockquote class="quote quote--large"><p>${esc(c.quote)}</p><cite>${esc(c.name)}</cite></blockquote>
    </div>
    <figure class="section__figure">${img('chef', { className: 'photo' })}<figcaption>${esc(c.name)} in the Milk Burger kitchen</figcaption></figure>
  </section>`;
}

export function founders({ withPhoto = true } = {}) {
  const f = content.founders;
  return `
  <section class="section section--founders" id="story" aria-labelledby="founders-title">
    ${withPhoto ? `<figure class="section__figure">${img('founders', { className: 'photo' })}<figcaption>${esc(f.names)}</figcaption></figure>` : ''}
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
    ${rail(
      r.rooms
        .map(
          (rm, i) => `
        <article class="room room--${i === 0 ? 'tiled' : 'light'}">
          ${rm.photo ? `<figure class="room__photo">${img(rm.photo, { className: 'room__img' })}</figure>` : '<div class="room__swatch" aria-hidden="true"></div>'}
          <h3>${esc(rm.name)}${rm.photo ? '' : '<span class="needs-confirm">photo to come</span>'}</h3>
          <p>${esc(rm.body)}</p>
        </article>`,
        )
        .join(''),
      { label: 'The two rooms', className: 'rail--rooms' },
    )}
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
    ${rail(
      content.press
        .map(
          (p) => `
        <figure class="press__item">
          <blockquote><p>${esc(p.quote)}</p></blockquote>
          <figcaption><a class="press__outlet" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.outlet)}</a></figcaption>
        </figure>`,
        )
        .join(''),
      { label: 'Press quotes', className: 'rail--press' },
    )}
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
        <h3>Follow us</h3>
        <p><a href="${esc(c.instagram.url)}" target="_blank" rel="noopener">${esc(c.instagram.handle)}</a></p>
        <p class="muted">DM us on Instagram, or <a href="#contact">send us a message</a>.</p>
        <p><a href="tel:${esc(c.phone.value.replace(/\s/g, ''))}">${esc(c.phone.value)}</a>${toConfirm(c.phone.confirmed)}</p>
      </div>
    </div>
  </section>`;
}

export function instagram() {
  const { contact: c, instagram: ig } = content;
  return `
  <section class="section section--instagram" id="instagram" aria-labelledby="instagram-title">
    <h2 class="section__kicker" id="instagram-title">${esc(ig.headline)}</h2>
    <a class="ig-handle" href="${esc(c.instagram.url)}" target="_blank" rel="noopener">${esc(c.instagram.handle)}</a>
    <p class="section__lede">${esc(ig.body)}</p>
    <a class="button button--solid" href="${esc(c.instagram.url)}" target="_blank" rel="noopener">Follow on Instagram</a>
  </section>`;
}

// Every form on the site runs in demo mode while the site is a draft: it validates and
// thanks the visitor but sends nothing (see wireForms in forms.js).
const status = '<p class="form__status" role="status" aria-live="polite"></p>';

export function contact() {
  const k = content.contactForm;
  return `
  <section class="section section--contact" id="contact" aria-labelledby="contact-title">
    <h2 class="section__title" id="contact-title">${esc(k.headline)}</h2>
    <p class="section__lede">${esc(k.body)}</p>
    <form class="form" data-form="contact" data-thanks="${esc(k.thanks)}">
      <div class="form__row">
        <label class="field"><span>Name</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span>Email</span><input type="email" name="email" autocomplete="email" required></label>
      </div>
      <div class="form__row">
        <label class="field"><span>Phone <em>optional</em></span><input type="tel" name="phone" autocomplete="tel"></label>
        <label class="field"><span>What's it about?</span>
          <select name="topic" required>
            <option value="">Choose one</option>
            ${k.topics.map((t) => `<option>${esc(t)}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="form__row">
        <label class="field"><span>Date <em>optional</em></span><input type="date" name="date"></label>
        <label class="field"><span>Number of guests <em>optional</em></span><input type="number" name="guests" min="1" inputmode="numeric"></label>
      </div>
      <label class="field"><span>Message</span><textarea name="message" rows="5" required></textarea></label>
      <label class="check"><input type="checkbox" name="newsletter"><span>Also send me the Milk Burger newsletter</span></label>
      <div><button class="button button--solid" type="submit">Send message</button></div>
      ${status}
    </form>
  </section>`;
}

function newsletterForm(id, { inline = false } = {}) {
  const n = content.newsletter;
  return `
  <form class="nl-form${inline ? ' nl-form--inline' : ''}" data-form="newsletter" data-thanks="${esc(n.thanks)}">
    <label class="visually-hidden" for="${id}">Email address</label>
    <input id="${id}" type="email" name="email" placeholder="Your email" autocomplete="email" required>
    <button class="button button--solid" type="submit">${esc(n.button)}</button>
    <p class="nl-form__fine">${esc(n.consent)} <span class="needs-confirm">privacy policy to come</span></p>
    ${status}
  </form>`;
}

export function newsletterPopup() {
  const n = content.newsletter;
  return `
  <aside class="nl-pop" data-newsletter-pop role="dialog" aria-labelledby="nl-pop-title" data-delay="${n.delaySeconds}" hidden>
    <button class="nl-pop__close" type="button" data-nl-close aria-label="Close">&times;</button>
    ${logo('nl-pop__logo')}
    <h2 class="nl-pop__title" id="nl-pop-title">${esc(n.headline)}</h2>
    <p class="nl-pop__body">${esc(n.body)}</p>
    ${newsletterForm('nl-pop-email')}
  </aside>`;
}

export function footer() {
  const { contact: c, hours: h, newsletter: n } = content;
  return `
  <footer class="footer">
    <div class="footer__newsletter">
      <p class="footer__nl-title">${esc(n.headline)}</p>
      ${newsletterForm('nl-footer-email', { inline: true })}
    </div>
    ${logo('footer__logo')}
    <p>${esc(c.street)}, ${esc(c.city)} ${esc(c.postcode)}</p>
    <p>${esc(h.summary)}. Walk-ins only.</p>
    <p><a href="${esc(c.instagram.url)}" target="_blank" rel="noopener">Follow ${esc(c.instagram.handle)} on Instagram</a></p>
    <p class="footer__small">&copy; ${new Date().getFullYear()} Milk Burger</p>
  </footer>`;
}
