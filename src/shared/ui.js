// Small behaviours shared by every draft: swipeable rails and the section navigation.

// Rails scroll sideways by touch; the arrow buttons do the same for mouse users and
// disappear when everything already fits.
export function wireRails(root = document) {
  root.querySelectorAll('[data-rail]').forEach((rail) => {
    const track = rail.querySelector('.rail__track');
    const prev = rail.querySelector('[data-rail-prev]');
    const next = rail.querySelector('[data-rail-next]');
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      rail.classList.toggle('is-static', max <= 2);
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };
    const step = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: 'smooth' });
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    track.querySelectorAll('img').forEach((im) => im.addEventListener('load', update));
    update();
  });
}

// The floating menu button: opens the panel of sections, closes on a link, a tap outside
// or Escape, and marks the section you're reading.
export function wireMenu(root = document) {
  const button = root.querySelector('[data-menu-button]');
  const panel = root.querySelector('[data-menu]');
  const backdrop = root.querySelector('[data-menu-backdrop]');
  if (!button || !panel) return;
  const links = [...panel.querySelectorAll('[data-nav]')];
  const byId = new Map(links.map((a) => [a.dataset.nav, a]));
  const sections = [...byId.keys()].map((id) => root.querySelector(`#${id}`)).filter(Boolean);
  const isOpen = () => button.getAttribute('aria-expanded') === 'true';
  let hideTimer = 0;

  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    clearTimeout(hideTimer);
    if (open) {
      panel.hidden = false;
      backdrop.hidden = false;
      requestAnimationFrame(() => {
        panel.classList.add('is-open');
        backdrop.classList.add('is-open');
      });
      (panel.querySelector('[aria-current]') || links[0]).focus({ preventScroll: true });
    } else {
      panel.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      hideTimer = setTimeout(() => {
        panel.hidden = true;
        backdrop.hidden = true;
      }, 260);
    }
  };

  button.addEventListener('click', () => setOpen(!isOpen()));
  backdrop.addEventListener('click', () => setOpen(false));
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      setOpen(false);
      button.focus();
    } else if (e.key === 'Tab') {
      // Keep keyboard focus between the button and the panel while it's open.
      const items = [button, ...panel.querySelectorAll('a[href]')];
      const i = items.indexOf(document.activeElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[i === -1 ? 0 : next].focus();
    }
  });

  let current = null;
  const setCurrent = (id) => {
    if (id === current) return;
    current = id;
    links.forEach((a) => a.toggleAttribute('aria-current', a.dataset.nav === id));
  };

  // A section counts as current once it crosses the upper third of the screen.
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setCurrent(visible[0].target.id);
    },
    { rootMargin: '-30% 0px -60% 0px' },
  );
  sections.forEach((section) => observer.observe(section));

  // Above the first section, nothing is highlighted.
  window.addEventListener(
    'scroll',
    () => {
      if (sections[0] && sections[0].getBoundingClientRect().top > window.innerHeight * 0.3) setCurrent(null);
    },
    { passive: true },
  );
}
