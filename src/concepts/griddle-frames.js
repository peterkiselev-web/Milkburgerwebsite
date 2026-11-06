// Plays the real footage once it exists. scripts/extract-frames.sh turns the Higgsfield clips into
// numbered stills plus a manifest.json in public/griddle/frames/. If there's no manifest, this
// resolves to null and the page falls back to the stand-in animation.

export async function loadFramePlayer(canvas, dir, { onFrame } = {}) {
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
  const pad = (n) => String(n + 1).padStart(4, '0');

  let set = null;
  let frames = [];
  let generation = 0;
  let wanted = 0; // the frame the scroll position asks for
  let shown = -1; // the frame currently on the canvas
  let w = 0;
  let h = 0;

  // Load a sparse spread first so scrubbing works immediately, then fill the gaps.
  function load(folder) {
    const gen = ++generation;
    frames = new Array(manifest.count).fill(null);
    const seen = new Set();
    const order = [];
    for (const step of [32, 8, 2, 1]) {
      for (let i = 0; i < manifest.count; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    }
    let cursor = 0;
    const next = () => {
      if (gen !== generation || cursor >= order.length) return;
      const i = order[cursor++];
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        // A newer set (after a rotation) replaces this one; drop its late arrivals.
        if (gen !== generation) return;
        frames[i] = im;
        if (shown < 0 || Math.abs(i - wanted) < Math.abs(shown - wanted)) onFrame?.();
        next();
      };
      im.onerror = next;
      im.src = `${dir}${folder}frame-${pad(i)}.${manifest.ext || 'webp'}`;
    };
    for (let k = 0; k < 6; k++) next();
  }

  function nearest(i) {
    for (let d = 0; d < frames.length; d++) {
      if (frames[i - d]) return i - d;
      if (frames[i + d]) return i + d;
    }
    return -1;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const folder = portrait() ? 'portrait/' : 'landscape/';
    if (folder !== set) {
      set = folder;
      load(set);
    }
    shown = -1;
  }

  function draw(p) {
    wanted = Math.round(Math.min(1, Math.max(0, p)) * (manifest.count - 1));
    const i = nearest(wanted);
    if (i < 0 || i === shown) return;
    shown = i;
    const im = frames[i];
    const scale = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    const dw = im.naturalWidth * scale;
    const dh = im.naturalHeight * scale;
    ctx.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  return { resize, draw };
}
