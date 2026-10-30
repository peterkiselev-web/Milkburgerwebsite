// Shared start-up for every concept page.

import { content } from './sections.js';
import { mountStatus } from './hours.js';
import { wireImageFallbacks } from './images.js';

const STORAGE_KEY = 'mb-hide-draft';

function wireDraftToggle() {
  const root = document.documentElement;
  const read = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  };
  const apply = (hidden) => {
    root.classList.toggle('hide-draft', hidden);
    document.querySelectorAll('[data-draft-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(hidden));
      btn.textContent = hidden ? 'Show markers' : 'Hide markers';
    });
  };
  apply(read());
  document.querySelectorAll('[data-draft-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const hidden = !root.classList.contains('hide-draft');
      try {
        localStorage.setItem(STORAGE_KEY, hidden ? '1' : '0');
      } catch {
        // Private mode: the toggle still works for this visit.
      }
      apply(hidden);
    }),
  );
}

export function start(mount, html) {
  mount.innerHTML = html;
  wireImageFallbacks(mount);
  wireDraftToggle();
  mountStatus(content.hours);
}
