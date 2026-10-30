// A stand-in for the Higgsfield film, drawn in code. It follows the same eight beats
// as docs/higgsfield-shot-list.md so the scroll pacing can be judged before the footage exists.
// draw(p) renders the scene at scroll progress p, from 0 (raw beef) to 1 (finished burger).

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const mix = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function seeded(seed) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

const RAW = [150, 34, 42];
const SEARED = [112, 52, 30];
const CRUST = [66, 32, 15];
const CHEESE = [244, 162, 32];
const BUN = [205, 128, 46];
const BUN_LIGHT = [248, 202, 118];
const STAGES = 8;

export function createStandIn(canvas, { photos = [] } = {}) {
  const ctx = canvas.getContext('2d');
  const rand = seeded(11);
  const fat = Array.from({ length: 90 }, () => ({ a: rand() * Math.PI * 2, r: Math.sqrt(rand()), s: 0.5 + rand() * 1.3 }));
  const lace = Array.from({ length: 56 }, () => 0.86 + rand() * 0.24);
  const spatter = Array.from({ length: 46 }, () => ({ a: rand() * Math.PI * 2, v: 0.5 + rand() * 0.9, s: 0.6 + rand() * 1.6, d: rand() * 0.25 }));
  const smoke = Array.from({ length: 8 }, () => ({ x: (rand() - 0.5) * 1.2, o: rand(), w: 0.6 + rand() * 0.8 }));
  const bubbles = Array.from({ length: 30 }, () => ({ x: rand() - 0.5, o: rand(), s: 0.6 + rand() * 1.2 }));
  const crumbs = Array.from({ length: 80 }, () => ({ a: rand() * Math.PI * 2, r: Math.sqrt(rand()) * 0.9, s: 0.5 + rand(), light: rand() > 0.6 }));

  let w = 0;
  let h = 0;
  let dpr = 1;
  let unit = 0;
  let background = null;

  // Try each photo in turn for the final beat; keep the first that loads.
  let photo = null;
  const tryPhoto = (i) => {
    if (i >= photos.length) return;
    const im = new Image();
    im.onload = () => (photo = im);
    im.onerror = () => tryPhoto(i + 1);
    im.src = photos[i];
  };
  tryPhoto(0);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    unit = Math.min(w, h * 1.3);
    background = paintBackground();
  }

  // Out-of-focus burgundy tiles behind a brushed stainless steel griddle, warm light from above.
  function paintBackground() {
    const c = document.createElement('canvas');
    c.width = canvas.width;
    c.height = canvas.height;
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const horizon = h * 0.44;

    g.fillStyle = '#16050a';
    g.fillRect(0, 0, w, horizon);
    const tile = Math.max(46, unit * 0.09);
    g.save();
    g.filter = 'blur(7px)';
    for (let y = -tile; y < horizon; y += tile) {
      for (let x = -tile; x < w + tile; x += tile) {
        const glow = clamp(1 - Math.abs(x - w / 2) / (w * 0.7));
        g.fillStyle = `rgba(128, 34, 48, ${0.18 + 0.5 * glow})`;
        g.fillRect(x + 3, y + 3, tile - 6, tile - 6);
      }
    }
    g.restore();

    const steel = g.createLinearGradient(0, horizon, 0, h);
    steel.addColorStop(0, '#a3a8ae');
    steel.addColorStop(0.07, '#62676c');
    steel.addColorStop(1, '#222528');
    g.fillStyle = steel;
    g.fillRect(0, horizon, w, h - horizon);

    const grain = seeded(3);
    for (let i = 0; i < 1600; i++) {
      const y = horizon + grain() * (h - horizon);
      g.fillStyle = grain() > 0.5 ? `rgba(255,255,255,${grain() * 0.05})` : `rgba(0,0,0,${grain() * 0.08})`;
      g.fillRect(grain() * w - w * 0.2, y, w * (0.2 + grain() * 0.8), 1);
    }
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(0, horizon, w, 1.5);

    const light = g.createRadialGradient(w / 2, h * 0.66, 0, w / 2, h * 0.66, unit * 0.75);
    light.addColorStop(0, 'rgba(255,170,90,0.3)');
    light.addColorStop(1, 'rgba(255,170,90,0)');
    g.fillStyle = light;
    g.fillRect(0, 0, w, h);

    const vignette = g.createRadialGradient(w / 2, h / 2, unit * 0.3, w / 2, h / 2, Math.max(w, h) * 0.8);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
    g.fillStyle = vignette;
    g.fillRect(0, 0, w, h);
    return c;
  }

  const geometry = () => {
    const narrow = w < 640;
    return { cx: w / 2, cy: h * (narrow ? 0.6 : 0.66), k: 0.36, R: unit * 0.1, D: unit * (narrow ? 0.2 : 0.22), thick: unit * 0.022 };
  };

  function roundRect(x, y, rw, rh, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, rw, rh, r);
    else ctx.rect(x, y, rw, rh);
  }

  // A smooth closed outline; jag > 0 roughens the edge into a lacy smash-burger rim.
  function blob(x, y, rx, ry, jag) {
    const n = lace.length;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 1 + (lace[i] - 1) * jag;
      pts.push([x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]);
    }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    ctx.beginPath();
    ctx.moveTo(...mid(pts[n - 1], pts[0]));
    for (let i = 0; i < n; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], ...mid(pts[i], pts[(i + 1) % n]));
    ctx.closePath();
  }

  function cookColour(cook) {
    return cook < 0.5 ? mix(RAW, SEARED, cook * 2) : mix(SEARED, CRUST, (cook - 0.5) * 2);
  }

  function drawPatty(G, e, cook, lift = 0, flip = 1) {
    const { cx, cy, k, R, D, thick } = G;
    const rx = lerp(R, D, e);
    const ry = lerp(R, D * k, e) * Math.max(flip, 0.04);
    const top = lerp(cy - R * 0.85, cy - thick, e) - lift;
    const jag = clamp((e - 0.55) / 0.45);
    const col = cookColour(cook);

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, rx * 1.05, rx * k * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();

    if (e > 0.3) {
      ctx.fillStyle = rgb(mix(col, [20, 8, 4], 0.5));
      blob(cx, top + thick * e * flip, rx, ry, jag);
      ctx.fill();
    }

    const grad = ctx.createRadialGradient(cx - rx * 0.35, top - ry * 0.5, rx * 0.05, cx, top, rx * 1.1);
    grad.addColorStop(0, rgb(mix(col, [255, 214, 196], 0.3)));
    grad.addColorStop(0.55, rgb(col));
    grad.addColorStop(1, rgb(mix(col, [0, 0, 0], 0.4)));
    ctx.fillStyle = grad;
    blob(cx, top, rx, ry, jag);
    ctx.fill();

    const fatAlpha = 1 - cook * 1.7;
    if (fatAlpha > 0) {
      for (const f of fat) {
        ctx.fillStyle = `rgba(255,218,218,${0.38 * fatAlpha})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(f.a) * f.r * rx * 0.85, top + Math.sin(f.a) * f.r * ry * 0.85, f.s * unit * 0.0042, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (cook > 0.6) {
      const a = (cook - 0.6) / 0.4;
      for (const c of crumbs) {
        ctx.fillStyle = c.light ? `rgba(196,128,72,${0.55 * a})` : `rgba(28,12,5,${0.6 * a})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(c.a) * c.r * rx, top + Math.sin(c.a) * c.r * ry, c.s * unit * 0.004, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return { top, rx, ry };
  }

  function drawPress(G, y) {
    const { cx, D } = G;
    const pw = D * 2.3;
    const ph = unit * 0.035;
    const steel = ctx.createLinearGradient(cx - unit * 0.02, 0, cx + unit * 0.02, 0);
    steel.addColorStop(0, '#6d7277');
    steel.addColorStop(0.5, '#eef0f2');
    steel.addColorStop(1, '#7c8186');
    ctx.fillStyle = steel;
    ctx.fillRect(cx - unit * 0.018, y - ph - unit * 0.22, unit * 0.036, unit * 0.22);
    ctx.fillStyle = '#121212';
    roundRect(cx - unit * 0.06, y - ph - unit * 0.28, unit * 0.12, unit * 0.065, unit * 0.025);
    ctx.fill();
    const plate = ctx.createLinearGradient(0, y - ph, 0, y);
    plate.addColorStop(0, '#f3f4f6');
    plate.addColorStop(0.5, '#a9afb5');
    plate.addColorStop(1, '#565b61');
    ctx.fillStyle = plate;
    roundRect(cx - pw / 2, y - ph, pw, ph, ph * 0.3);
    ctx.fill();
  }

  function drawSpatula(x, y) {
    const bw = unit * 0.3;
    const bh = unit * 0.014;
    const blade = ctx.createLinearGradient(0, y - bh, 0, y);
    blade.addColorStop(0, '#f2f3f5');
    blade.addColorStop(1, '#80868c');
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + bw, y);
    ctx.lineTo(x + bw + unit * 0.02, y - bh);
    ctx.lineTo(x + unit * 0.02, y - bh);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#141414';
    roundRect(x + bw, y - bh - unit * 0.03, unit * 0.26, unit * 0.034, unit * 0.017);
    ctx.fill();
  }

  function drawSpatter(G, top, t, strength) {
    const { cx, k, D } = G;
    for (const s of spatter) {
      const life = clamp((t - s.d) / 0.6);
      if (life <= 0 || life >= 1) continue;
      const dist = D * 0.95 + life * unit * 0.22 * s.v;
      const x = cx + Math.cos(s.a) * dist;
      const y = top + Math.sin(s.a) * dist * k - Math.sin(life * Math.PI) * unit * 0.1 * s.v;
      ctx.fillStyle = `rgba(255,222,160,${0.9 * (1 - life) * strength})`;
      ctx.beginPath();
      ctx.arc(x, y, s.s * unit * 0.004 * (1.4 - life), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSmoke(G, top, p, strength) {
    const { cx, D } = G;
    for (const s of smoke) {
      const life = (s.o + p * 5) % 1;
      const r = unit * 0.07 * s.w * (0.6 + life);
      const x = cx + s.x * D + Math.sin(life * 6 + s.o * 9) * unit * 0.02;
      const y = top - life * unit * 0.55;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,240,225,${0.09 * (1 - life) * strength})`);
      g.addColorStop(1, 'rgba(255,240,225,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }

  function drawCheese(G, yTop, melt) {
    const { cx, k, D } = G;
    const half = D * 1.02;
    const droop = melt * unit * 0.045;
    const n = [cx, yTop - half * k * 0.95];
    const e = [cx + half * (1 - melt * 0.08), yTop + droop];
    const s = [cx, yTop + half * k * 0.95 + droop * 1.5];
    const wPt = [cx - half * (1 - melt * 0.08), yTop + droop];
    const centre = [cx, yTop];
    const bulge = 1 + melt * 0.14;
    const ctrl = (a, b) => [centre[0] + ((a[0] + b[0]) / 2 - centre[0]) * bulge, centre[1] + ((a[1] + b[1]) / 2 - centre[1]) * bulge];

    const g = ctx.createLinearGradient(cx - half, yTop - half * k, cx + half, yTop + half * k);
    g.addColorStop(0, '#ffcd62');
    g.addColorStop(0.5, rgb(CHEESE));
    g.addColorStop(1, '#d5800f');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(...n);
    ctx.quadraticCurveTo(...ctrl(n, e), ...e);
    ctx.quadraticCurveTo(...ctrl(e, s), ...s);
    ctx.quadraticCurveTo(...ctrl(s, wPt), ...wPt);
    ctx.quadraticCurveTo(...ctrl(wPt, n), ...n);
    ctx.fill();

    const drips = [
      [s[0], s[1], 1],
      [lerp(s[0], e[0], 0.45), lerp(s[1], e[1], 0.45), 0.6],
      [lerp(s[0], wPt[0], 0.6), lerp(s[1], wPt[1], 0.6), 0.75],
    ];
    for (const [x, y, len] of drips) {
      const l = melt * unit * 0.06 * len;
      const r = unit * 0.009;
      ctx.beginPath();
      ctx.moveTo(x - r, y - r);
      ctx.lineTo(x - r, y + l);
      ctx.arc(x, y + l, r, Math.PI, 0, true);
      ctx.lineTo(x + r, y - r);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(255,255,255,${0.18 + melt * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(cx - half * 0.3, yTop - half * k * 0.35, half * 0.28, half * k * 0.12, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBunHalf(x, y, r, toast) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 3, r * 1.05, r * 0.36 * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.55, r * 0.05, x, y - r * 0.2, r * 1.15);
    g.addColorStop(0, rgb(mix(BUN_LIGHT, [255, 240, 210], 0.3)));
    g.addColorStop(0.45, rgb(mix(BUN_LIGHT, BUN, 0.6 + toast * 0.2)));
    g.addColorStop(1, rgb(mix(BUN, [110, 56, 18], 0.5)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.62, 0, Math.PI, 0);
    ctx.ellipse(x, y, r, r * 0.36, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.32, y - r * 0.38, r * 0.22, r * 0.08, -0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Beats 1 to 5: top-down on the griddle.
  function drawGriddle(s) {
    const G = geometry();
    const t1 = clamp(s - 1);
    const t2 = clamp(s - 2);
    const t3 = clamp(s - 3);
    const t4 = clamp(s - 4);

    const smash = s < 1 ? 0 : ease(clamp((t1 - 0.35) / 0.25));
    const cook = s < 2.53 ? clamp((s - 1.4) / 1.13) * 0.55 : 1;

    let lift = 0;
    let flip = 1;
    if (s >= 2 && s < 3) {
      const f = clamp((t2 - 0.35) / 0.35);
      lift = Math.sin(f * Math.PI) * unit * 0.12;
      flip = Math.abs(Math.cos(f * Math.PI));
    }

    if (s >= 4) {
      const slide = ease(clamp(t4 / 0.35));
      const gap = Math.min(G.D * 2.05, w * 0.36);
      const r = G.D * (w < 640 ? 0.62 : 0.78);
      drawBunHalf(G.cx - gap - (1 - slide) * w * 0.45, G.cy + G.D * 0.1, r, t4);
      drawBunHalf(G.cx + gap + (1 - slide) * w * 0.45, G.cy + G.D * 0.1, r, t4);
    }

    // The beef fades in as the opening logo fades out, so the two never overlap.
    const reveal = ease(clamp((s - 0.15) / 0.3));
    ctx.save();
    ctx.globalAlpha *= reveal;
    const { top } = drawPatty(G, smash, cook, lift, flip);
    ctx.restore();

    if (s >= 3) {
      const drop = ease(clamp(t3 / 0.3));
      drawCheese(G, top - (1 - drop) * unit * 0.45, ease(clamp((t3 - 0.3) / 0.7)));
    }

    if (s >= 1 && s < 2) {
      // Press comes down to the top of the ball, flattens it, holds, then lifts away.
      const ballTop = G.cy - G.R * 1.85;
      const pattyTop = G.cy - G.thick;
      let y;
      if (t1 < 0.35) y = lerp(-unit * 0.05, ballTop, ease(t1 / 0.35));
      else if (t1 < 0.82) y = lerp(ballTop, pattyTop, smash);
      else y = lerp(pattyTop, -unit * 0.1, ease((t1 - 0.82) / 0.18));
      drawPress(G, y);
      drawSpatter(G, top, t1 - 0.45, 1);
    }
    if (s >= 2 && s < 3) {
      let x;
      if (t2 < 0.35) x = lerp(w + unit * 0.1, G.cx - G.D * 0.6, ease(t2 / 0.35));
      else if (t2 < 0.7) x = G.cx - G.D * 0.6;
      else x = lerp(G.cx - G.D * 0.6, w + unit * 0.1, ease((t2 - 0.7) / 0.3));
      drawSpatula(x, G.cy - G.thick - lift);
      drawSpatter(G, top, 0.3 + t2 * 0.5, 0.5);
    }
    drawSmoke(G, top, s / STAGES, clamp(s - 0.6) * (1 - clamp(s - 4.2)));
  }

  // Beats 6 and 7: a side-on build, then a glass of Champagne.
  function stackLayout() {
    const narrow = w < 640;
    const W = narrow ? Math.min(unit * 0.66, w * 0.62) : unit * 0.4;
    const bx = narrow ? w * 0.42 : w / 2 - unit * 0.05;
    return { bx, by: h * (narrow ? 0.72 : 0.78), W, narrow };
  }

  const layers = [
    { h: 0.13, draw: bottomBun },
    { h: 0.025, draw: sauce },
    { h: 0.085, draw: pattyLayer },
    { h: 0.022, draw: cheeseLayer },
    { h: 0.085, draw: pattyLayer },
    { h: 0.022, draw: cheeseLayer },
    { h: 0.03, draw: pickles },
    { h: 0.3, draw: topBun },
  ];

  function bottomBun(x, y, W, hh) {
    const g = ctx.createLinearGradient(0, y, 0, y + hh);
    g.addColorStop(0, '#edb874');
    g.addColorStop(0.25, '#d99144');
    g.addColorStop(1, '#a95f20');
    ctx.fillStyle = g;
    roundRect(x - W / 2, y, W, hh, [hh * 0.2, hh * 0.2, hh * 0.7, hh * 0.7]);
    ctx.fill();
  }

  function sauce(x, y, W, hh) {
    ctx.fillStyle = '#f2e3bf';
    ctx.beginPath();
    ctx.moveTo(x - W * 0.5, y + hh);
    for (let i = 0; i <= 12; i++) ctx.lineTo(x - W * 0.5 + (W * i) / 12, y + (i % 2 ? hh * 1.6 : 0));
    ctx.lineTo(x + W * 0.5, y + hh);
    ctx.closePath();
    ctx.fill();
  }

  function pattyLayer(x, y, W, hh) {
    const pw = W * 1.04;
    const g = ctx.createLinearGradient(0, y, 0, y + hh);
    g.addColorStop(0, '#6a3519');
    g.addColorStop(0.5, '#4a2210');
    g.addColorStop(1, '#2a1207');
    ctx.fillStyle = g;
    roundRect(x - pw / 2, y, pw, hh, hh * 0.45);
    ctx.fill();
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.arc(x + side * (pw / 2 - hh * 0.15), y + (hh * (i + 1)) / 15, hh * (0.12 + (i % 3) * 0.05), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(160,96,52,0.35)';
    for (let i = 0; i < 26; i++) ctx.fillRect(x - pw / 2 + ((i * 37) % 100) / 100 * pw, y + ((i * 53) % 100) / 100 * hh, 2, 2);
  }

  function cheeseLayer(x, y, W, hh, a) {
    const cw = W * 1.08;
    ctx.fillStyle = rgb(CHEESE);
    roundRect(x - cw / 2, y, cw, hh, hh * 0.4);
    ctx.fill();
    for (const [dx, len] of [[-0.44, 3.2], [-0.05, 2.2], [0.41, 2.8]]) {
      const r = hh * 0.6;
      const l = hh * len * a;
      const px = x + dx * cw;
      ctx.beginPath();
      ctx.moveTo(px - r, y);
      ctx.lineTo(px - r, y + l);
      ctx.arc(px, y + l, r, Math.PI, 0, true);
      ctx.lineTo(px + r, y);
      ctx.fill();
    }
  }

  function pickles(x, y, W, hh) {
    for (const dx of [-0.36, 0.02, 0.38]) {
      ctx.fillStyle = '#5f7a22';
      ctx.beginPath();
      ctx.ellipse(x + dx * W, y + hh / 2, W * 0.15, hh * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9db552';
      ctx.beginPath();
      ctx.ellipse(x + dx * W, y + hh / 2, W * 0.12, hh * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function topBun(x, y, W, hh) {
    const g = ctx.createRadialGradient(x - W * 0.2, y + hh * 0.2, W * 0.02, x, y + hh * 0.6, W * 0.7);
    g.addColorStop(0, rgb(mix(BUN_LIGHT, [255, 244, 220], 0.35)));
    g.addColorStop(0.4, rgb(mix(BUN_LIGHT, BUN, 0.55)));
    g.addColorStop(1, rgb(mix(BUN, [100, 50, 15], 0.45)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - W / 2, y + hh);
    ctx.bezierCurveTo(x - W / 2, y - hh * 0.15, x + W / 2, y - hh * 0.15, x + W / 2, y + hh);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(x - W * 0.17, y + hh * 0.32, W * 0.14, hh * 0.12, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStack(t5) {
    const { bx, by, W } = stackLayout();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 4, W * 0.6, W * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    let y = by;
    layers.forEach((layer, i) => {
      const hh = layer.h * W;
      const start = (i / layers.length) * 0.82;
      const a = ease(clamp((t5 - start) / 0.16));
      y -= hh;
      if (a > 0) {
        const drop = (1 - a) * unit * 0.35;
        layer.draw(bx, y - drop, W, hh, a);
      }
    });
  }

  function drawGlass(t6) {
    const { bx, by, W, narrow } = stackLayout();
    const gw = unit * (narrow ? 0.12 : 0.075);
    const gh = unit * (narrow ? 0.46 : 0.3);
    const gx = Math.min(bx + W * 0.95, w - gw * 0.9);
    const bowlTop = by - gh;
    const bowlBottom = by - gh * 0.38;
    const level = ease(clamp(t6 / 0.8));

    const bowl = () => {
      ctx.beginPath();
      ctx.moveTo(gx - gw / 2, bowlTop);
      ctx.lineTo(gx - gw * 0.42, bowlBottom - gw * 0.3);
      ctx.quadraticCurveTo(gx, bowlBottom + gw * 0.2, gx + gw * 0.42, bowlBottom - gw * 0.3);
      ctx.lineTo(gx + gw / 2, bowlTop);
    };

    const surface = bowlBottom - (bowlBottom - bowlTop) * 0.88 * level;
    ctx.save();
    bowl();
    ctx.closePath();
    ctx.clip();
    const liquid = ctx.createLinearGradient(0, surface, 0, bowlBottom);
    liquid.addColorStop(0, 'rgba(250,232,170,0.95)');
    liquid.addColorStop(1, 'rgba(214,170,70,0.95)');
    ctx.fillStyle = liquid;
    ctx.fillRect(gx - gw, surface, gw * 2, bowlBottom - surface + gw);
    for (const b of bubbles) {
      const y = bowlBottom - ((b.o + t6 * 2.5) % 1) * (bowlBottom - surface);
      ctx.fillStyle = 'rgba(255,255,240,0.8)';
      ctx.beginPath();
      ctx.arc(gx + b.x * gw * 0.6, y, b.s * unit * 0.0025, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = Math.max(1.5, unit * 0.0025);
    bowl();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gx, bowlBottom + gw * 0.05);
    ctx.lineTo(gx, by);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(gx, by, gw * 0.42, gw * 0.08, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (t6 > 0.02 && t6 < 0.85) {
      ctx.strokeStyle = 'rgba(244,214,140,0.9)';
      ctx.lineWidth = Math.max(2, unit * 0.004);
      ctx.beginPath();
      ctx.moveTo(gx + gw * 0.08, -10);
      ctx.lineTo(gx, surface);
      ctx.stroke();
    }
  }

  function drawPhoto(alpha, t) {
    if (!photo) return;
    const iw = photo.naturalWidth;
    const ih = photo.naturalHeight;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#0d0a0a';
    ctx.fillRect(0, 0, w, h);
    const sharpEnough = iw >= w * 0.75;
    if (sharpEnough) {
      const scale = Math.max(w / iw, h / ih) * (1 + 0.06 * t);
      ctx.drawImage(photo, (w - iw * scale) / 2, (h - ih * scale) / 2, iw * scale, ih * scale);
    } else {
      // A small photo is shown framed rather than stretched and blurry.
      // Wide screens: photo to the right of the caption. Narrow: photo above it.
      const wide = w >= 900;
      const scale = Math.min((h * (wide ? 0.66 : 0.42)) / ih, (w * (wide ? 0.4 : 0.8)) / iw) * (1 + 0.04 * t);
      const pw = iw * scale;
      const ph = ih * scale;
      const x = wide ? w * 0.68 - pw / 2 : (w - pw) / 2;
      const y = wide ? (h - ph) / 2 : h * 0.1;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 40;
      roundRect(x, y, pw, ph, 18);
      ctx.save();
      ctx.clip();
      ctx.drawImage(photo, x, y, pw, ph);
      ctx.restore();
    }
    const shade = ctx.createLinearGradient(0, h * 0.45, 0, h);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function draw(p) {
    const s = clamp(p) * STAGES * 0.9999;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(background, 0, 0, w, h);

    const griddleAlpha = 1 - ease(clamp((s - 4.85) / 0.3));
    if (griddleAlpha > 0) {
      ctx.globalAlpha = griddleAlpha;
      drawGriddle(s);
    }
    if (s > 4.85) {
      ctx.globalAlpha = 1 - griddleAlpha;
      drawStack(clamp(s - 5));
      if (s > 6) drawGlass(clamp(s - 6));
    }
    ctx.globalAlpha = 1;
    if (s > 7) drawPhoto(ease(clamp((s - 7) / 0.45)), clamp(s - 7));
  }

  return { resize, draw };
}
