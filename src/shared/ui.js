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

// Highlights the section you're reading in the header, and on phones keeps that chip in view.
export function wireNav(root = document) {
  const nav = root.querySelector('[data-site-nav]');
  if (!nav) return;
  const links = [...root.querySelectorAll('[data-nav]')];
  const byId = new Map(links.map((a) => [a.dataset.nav, a]));
  const sections = [...byId.keys()].map((id) => root.querySelector(`#${id}`)).filter(Boolean);

  let current = null;
  const setCurrent = (id) => {
    if (id === current) return;
    current = id;
    links.forEach((a) => a.toggleAttribute('aria-current', a.dataset.nav === id));
    const chip = byId.get(id);
    if (chip && nav.contains(chip) && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: chip.offsetLeft - (nav.clientWidth - chip.clientWidth) / 2, behavior: 'smooth' });
    }
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
