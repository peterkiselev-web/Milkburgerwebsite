// Contact and newsletter forms, plus the newsletter slide-in.
//
// While the site is a draft (content.draft), forms validate and thank the visitor but send
// nothing: collecting real emails needs the restaurant's own mailing tool and privacy policy.
// To go live, replace send() with a call to that service (for example Mailchimp or Klaviyo
// for the newsletter, Formspree or similar for the contact form).

import { content } from './sections.js';

const STORAGE_KEY = 'mb-newsletter';

// eslint-disable-next-line no-unused-vars
async function send(kind, data) {
  return { ok: true, demo: true };
}

export function wireForms(root = document) {
  root.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('.form__status');
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      const result = await send(form.dataset.form, new FormData(form));
      button.disabled = false;
      if (!result.ok) {
        status.textContent = 'Something went wrong. Please try again, or DM us on Instagram.';
        return;
      }
      status.textContent = form.dataset.thanks + (result.demo ? ' (Draft site: nothing was actually sent.)' : '');
      form.classList.add('is-sent');
      form.reset();
      form.dispatchEvent(new CustomEvent('form-sent', { bubbles: true }));
    });
  });
}

// Slides in after a delay instead of blocking the page, so a visitor checking the hours on
// their phone is never stopped. In the draft it comes back on every visit (sessionStorage),
// so the owners always see it; once live it stays away for good after a close or sign-up.
export function mountNewsletterPopup() {
  const pop = document.querySelector('[data-newsletter-pop]');
  if (!pop) return;

  const store = () => (content.draft ? window.sessionStorage : window.localStorage);
  const seen = () => {
    try {
      return store().getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };
  const remember = (value) => {
    try {
      store().setItem(STORAGE_KEY, value);
    } catch {
      // Storage blocked: it simply shows again next time.
    }
  };

  let timer = 0;
  let lastFocus = null;

  const open = () => {
    clearTimeout(timer);
    if (!pop.hidden) return;
    lastFocus = document.activeElement;
    pop.hidden = false;
    void pop.offsetHeight; // let the browser lay it out before animating in
    pop.classList.add('is-open');
  };

  const close = (reason = 'dismissed') => {
    if (pop.hidden) return;
    remember(reason);
    pop.classList.remove('is-open');
    setTimeout(() => {
      pop.hidden = true;
    }, 350);
    if (pop.contains(document.activeElement) && lastFocus) lastFocus.focus();
  };

  pop.querySelector('[data-nl-close]').addEventListener('click', () => close());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  pop.addEventListener('form-sent', () => {
    remember('joined');
    setTimeout(() => close('joined'), 2500);
  });
  document.querySelectorAll('[data-nl-open]').forEach((button) =>
    button.addEventListener('click', () => {
      open();
      pop.querySelector('input[type="email"]').focus();
    }),
  );

  if (!seen()) timer = setTimeout(open, (Number(pop.dataset.delay) || 10) * 1000);
}
