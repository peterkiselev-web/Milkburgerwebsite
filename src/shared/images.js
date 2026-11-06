// Every photo on the site lives here. Each one tries its local file first,
// then a fallback (the restaurant's own press images, hosted by the press),
// then a styled placeholder, so a missing file never shows a broken image.

const base = import.meta.env.BASE_URL;

export const images = {
  burger: {
    src: `${base}images/ig-burger.jpg`,
    alt: 'A Milk Burger cheeseburger with melted cheese and pickles in a glossy bun',
    width: 437,
    height: 488,
  },
  spread: {
    src: `${base}images/burgers-champagne.jpg`,
    fallback: 'https://assets.thelondoneconomic.com/uploads/2026/10/Milk-Burger-4625-scaled.jpg',
    alt: 'Two burgers, fries and two glasses at a timber table in front of tan leather banquettes',
    width: 1600,
    height: 1200,
  },
  founders: {
    src: `${base}images/founders.jpg`,
    alt: 'Alina Kosichkina and Dima Zakhodiakin at a table by a leather banquette',
    width: 960,
    height: 1280,
  },
  chef: {
    src: `${base}images/chef.jpg`,
    alt: 'Jorge Paredes at work in the Milk Burger kitchen',
    width: 944,
    height: 1280,
  },
  mexican: {
    src: `${base}images/dish-mexican.jpg`,
    alt: 'The Mexican-style burger cut in half, wrapped in a fried tortilla, on printed Milk Burger paper',
    width: 1200,
    height: 900,
  },
  camembert: {
    src: `${base}images/dish-camembert.jpg`,
    alt: 'Fried camembert with a dipping sauce on printed Milk Burger paper',
    width: 1200,
    height: 900,
  },
  burgerFries: {
    src: `${base}images/dish-burger-fries.jpg`,
    alt: 'A burger with fries in a steel cup on a timber table',
    width: 1200,
    height: 900,
  },
  shopfront: {
    src: `${base}images/ig-shopfront.jpg`,
    alt: 'The Milk Burger shopfront on Westbourne Grove, its window dressed with pumpkins and dried branches',
    width: 352,
    height: 584,
  },
  team: {
    src: `${base}images/ig-team.jpg`,
    alt: 'Jorge Paredes, Alina Kosichkina and Dima Zakhodiakin on a rust leather banquette',
    width: 439,
    height: 584,
  },
};

export function img(key, { className = '', loading = 'lazy', sizes } = {}) {
  const image = images[key];
  const attrs = [
    `src="${image.src}"`,
    `alt="${image.alt}"`,
    `width="${image.width}"`,
    `height="${image.height}"`,
    `loading="${loading}"`,
    'decoding="async"',
    className && `class="${className}"`,
    sizes && `sizes="${sizes}"`,
    image.fallback && `data-fallback="${image.fallback}"`,
  ].filter(Boolean);
  return `<img ${attrs.join(' ')}>`;
}

function handleError(el) {
  const next = el.dataset.fallback;
  if (next) {
    delete el.dataset.fallback;
    el.src = next;
    return;
  }
  const placeholder = document.createElement('div');
  placeholder.className = `${el.className} img-missing`.trim();
  placeholder.setAttribute('role', 'img');
  placeholder.setAttribute('aria-label', el.alt);
  placeholder.style.aspectRatio = `${el.getAttribute('width')} / ${el.getAttribute('height')}`;
  placeholder.innerHTML = '<span>Photo to come</span>';
  el.replaceWith(placeholder);
}

export function wireImageFallbacks(root = document) {
  root.querySelectorAll('img').forEach((el) => {
    el.addEventListener('error', () => handleError(el));
    if (el.complete && el.naturalWidth === 0 && el.getAttribute('src')) handleError(el);
  });
}
