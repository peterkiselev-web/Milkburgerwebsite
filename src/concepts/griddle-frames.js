// Plays the real footage once it exists. scripts/extract-frames.sh turns the Higgsfield clips into
// numbered stills plus a manifest.json in public/griddle/frames/. If there's no manifest, this
// resolves to null and the page keeps the stand-in animation.

export async function loadFramePlayer(canvas, dir) {
  let manifest;
  try {
    const res = await fetch(`${dir}manifest.json`, { cache: 'no-cache' });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return null;
    manifest = await res.json();
  } catch {
    return null;
  }

  const ctx = canvas.getContext('2d');
  const portrait = () => manifest.portrait && window.innerHeight > window.innerWidth;
  let set = null;
  let frames = [];
  let w = 0;
  let h = 0;
  let last = -1;

  const pad = (n) => String(n + 1).padStart(4, '0');

  // Load a sparse spread first so scrubbing works immediately, then fill the gaps.
  function load(folder) {
    frames = new Array(manifest.count).fill(null);
    const order = [];
    for (const step of [32, 8, 2, 1]) {
      for (let i = 0; i < manifest.count; i += step) if (!order.includes(i)) order.push(i);
    }
    let cursor = 0;
    const next = () => {
      if (cursor >= order.length) return;
      const i = order[cursor++];
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        frames[i] = im;
        next();
      };
      im.onerror = next;
      im.src = `${dir}${folder}frame-${pad(i)}.${manifest.ext || 'webp'}`;
    };
    for (let k = 0; k < 6; k++) next();
  }

  function nearest(i) {
    for (let d = 0; d < frames.length; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const wanted = portrait() ? 'portrait/' : 'landscape/';
    if (wanted !== set) {
      set = wanted;
      load(set);
    }
    last = -1;
  }

  function draw(p) {
    const i = Math.round(Math.min(1, Math.max(0, p)) * (manifest.count - 1));
    const im = nearest(i);
    if (!im || (i === last && im.complete)) return;
    last = i;
    const scale = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    const dw = im.naturalWidth * scale;
    const dh = im.naturalHeight * scale;
    ctx.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  return { resize, draw };
}
