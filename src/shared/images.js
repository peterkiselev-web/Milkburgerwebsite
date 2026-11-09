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

  // From the restaurant's press photo shoot, as published by Broadsheet (October 2026).
  // Ask the owners for the full-size originals.
  shopfrontDay: {
    src: `${base}images/press-shopfront.jpg`,
    alt: 'The Milk Burger shopfront at 50 Westbourne Grove: white frontage, black awning and the logo above the windows',
    width: 860,
    height: 600,
    position: '62% 50%',
    source: 'Press shoot via broadsheet.com/london/articles/milk-burger-notting-hill',
  },
  cherryPie: {
    src: `${base}images/press-cherry-pie.jpg`,
    alt: 'Fried cherry pie with vanilla soft serve in a steel coupe on printed Milk Burger paper',
    width: 860,
    height: 600,
    position: '50% 55%',
    source: 'Press shoot via broadsheet.com/london/articles/milk-burger-notting-hill',
  },

  // Customer photos from Google Maps reviews (November 2026). The photographers own these:
  // fine for a draft, but get permission or replace them before the site goes live.
  truffle: {
    src: `${base}images/review-truffle.jpg`,
    alt: 'The Bone Marrow & Truffle burger, its flag reading Truffle, with fries behind',
    width: 1080,
    height: 1440,
    position: '50% 62%',
    source: 'Google Maps review photo',
  },
  classicSmash: {
    src: `${base}images/review-classic-smash.jpg`,
    alt: 'A Classic Smash with orange melted cheese, its flag reading Classic, in front of a brown leather banquette',
    width: 1080,
    height: 1440,
    position: '50% 60%',
    source: 'Google Maps review photo',
  },
  tiledRoom: {
    src: `${base}images/review-tiled-room.jpg`,
    alt: 'The tiled room: terracotta tiles, a long timber counter and burgundy stools under a paper lantern',
    width: 1080,
    height: 1440,
    source: 'Google Maps review photo',
  },
  bar: {
    src: `${base}images/review-bar.jpg`,
    alt: 'A bartender straining a cocktail into a coupe at the steel bar',
    width: 1080,
    height: 1350,
    source: 'Google Maps review photo',
  },
  doughnuts: {
    src: `${base}images/review-doughnuts.jpg`,
    alt: 'Warm sugared doughnuts with chocolate soft serve in a steel coupe',
    width: 1080,
    height: 1440,
    position: '50% 60%',
    source: 'Google Maps review photo',
  },
  fries: {
    src: `${base}images/review-fries.jpg`,
    alt: "Koffmann's fries dusted with spice on printed Milk Burger paper",
    width: 1080,
    height: 1440,
    position: '50% 60%',
    source: 'Google Maps review photo',
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
    image.position && `style="object-position: ${image.position}"`,
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
