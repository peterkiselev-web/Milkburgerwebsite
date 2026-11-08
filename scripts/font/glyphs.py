# Raster glyphs in the Milk Burger logo style.
# Each glyph: fill (the cream letter body), sil (fill + outline, counters filled), base (baseline row), ox (origin column).
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, zlib
from PIL import Image
from scipy import ndimage as ndi
from common import *

W = sys.argv[1] if len(sys.argv) > 1 else '.'
FP = f'{W}/dl/ttf/darumadrop-one.ttf'
R_DIL = 10
SC = 0.78          # small-cap scale

def rng_for(key):
    return np.random.default_rng(zlib.crc32(key.encode()))

def noise(shape, sigma, rng):
    n = ndi.gaussian_filter(rng.standard_normal(shape).astype(np.float32), sigma)
    return n / (n.std() + 1e-9)

def sdf(m):
    return ndi.distance_transform_edt(m) - ndi.distance_transform_edt(~m)

def clean(m, min_island=400, min_hole=250):
    lab, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= min_island])
    holes = ndi.binary_fill_holes(m) & ~m
    lab, n = ndi.label(holes)
    if n:
        sizes = ndi.sum(holes, lab, range(1, n + 1))
        small = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s < min_hole])
        m = m | small
    return m

def wobble(m, rng, amp_warp=10, amp_lump=15, amp_fine=0):
    h, w = m.shape
    dy = noise(m.shape, 70, rng) * amp_warp
    dx = noise(m.shape, 70, rng) * amp_warp
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    s = sdf(m).astype(np.float32)
    s = ndi.map_coordinates(s, [yy + dy, xx + dx], order=1, mode='nearest')
    s = s + noise(m.shape, 40, rng) * amp_lump + noise(m.shape, 18, rng) * amp_fine
    return clean(smooth(s > 0, 5))

def add_drips(m, base, rng, p=0.3, scale=1.0):
    """Hang milk drips off the lowest stroke ends."""
    h, w = m.shape
    cols = np.where(m.any(0))[0]
    bottom = np.full(w, -1)
    for x in cols:
        bottom[x] = np.nonzero(m[:, x])[0].max()
    out = m.copy()
    ys, xs = np.mgrid[0:h, 0:w]
    xs_sorted = sorted(cols, key=lambda x: -bottom[x])
    used = []
    for x in xs_sorted:
        yb = bottom[x]
        if yb < base - 60 * scale: break
        if any(abs(x - u) < 110 * scale for u in used): continue
        # Only at a local lowest point with stroke above it.
        win = bottom[max(0, x - 25):x + 26]
        if yb < win.max(): continue
        used.append(x)
        if rng.random() > p: continue
        L = rng.uniform(15, 65) * scale
        rad = rng.uniform(24, 34) * scale
        x0 = x + rng.uniform(-10, 10) * scale
        neck = (np.abs(xs - x0) <= rad * 0.92) & (ys >= yb - 40 * scale) & (ys <= yb + L)
        bulb = (xs - x0) ** 2 + (ys - (yb + L)) ** 2 <= (rad * 1.05) ** 2
        out |= neck | bulb
    return clean(smooth(out, 7))

def outline(fill, rng):
    sil = dilate(fill, T)
    s = sdf(sil).astype(np.float32) + noise(fill.shape, 40, rng) * 4
    sil = smooth(s > 0, 6) | dilate(fill, T - 10)
    return ndi.binary_fill_holes(sil)

def pad_to(m, base, ox, padding=PAD):
    return np.pad(m, padding), base + padding, ox + padding

def from_logo(key, letters, pos_map, logo_base):
    m = letters[key]
    x0, y0 = pos_map[key]
    m, base, ox = pad_to(m, logo_base - y0, 0)
    return m, base, ox

def generated(ch, key=None):
    key = key or ch
    rng = rng_for('mb-' + key)
    m, base, ox, adv = render_base(FP, ch, HF - 2 * R_DIL)
    if not m.any():
        return None
    # Work on a tight canvas: everything below is per-pixel and the render canvas is mostly empty.
    ys, xs = np.nonzero(m)
    y0, x0 = max(0, ys.min() - 170), max(0, xs.min() - 170)
    m = m[y0:ys.max() + 170, x0:xs.max() + 170]; base -= y0; ox -= x0
    m = dilate(np.pad(m, 40), R_DIL); base += 40; ox += 40
    # Hand-drawn bounce: a slight tilt and shift per letter.
    ang = rng.uniform(-3.0, 3.0)
    m = ndi.rotate(m.astype(np.float32), ang, reshape=False, order=1) > 0.5
    shift = int(rng.uniform(-12, 12))
    m = np.roll(m, shift, axis=0)
    m = wobble(m, rng)
    m = add_drips(m, base, rng)
    return m, base, ox

def small_cap(m, base, ox):
    h, w = m.shape
    img = Image.fromarray(m.astype(np.uint8) * 255)
    nh, nw = int(round(h * SC)), int(round(w * SC))
    s = np.asarray(img.resize((nw, nh), Image.LANCZOS)) > 127
    nb = base * SC
    s = dilate(np.pad(s, 30), 5)
    return s, nb + 30, ox * SC + 30

def finish(fill, base, ox, key):
    rng = rng_for('ol-' + key)
    fill = np.pad(fill, 80); base += 80; ox += 80
    sil = outline(fill, rng)
    # Trim to the silhouette with a margin.
    ys, xs = np.nonzero(sil)
    y0, y1, x0, x1 = ys.min() - 4, ys.max() + 5, xs.min() - 4, xs.max() + 5
    return dict(fill=fill[y0:y1, x0:x1], sil=sil[y0:y1, x0:x1], base=base - y0, ox=ox - x0)

LOGO_KEYS = {'M': 'M0', 'I': 'I1', 'L': 'L2', 'K': 'K3', 'B': 'B4', 'U': 'U5', 'G': 'G7', 'E': 'E8', 'R': 'R9', 'R.alt': 'R6'}
LOGO_BASE = 657 + 4  # median fill bottom of the logo letters, in the 2x render

CAPS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
DIGITS = '0123456789'
PUNCT = {'period': '.', 'comma': ',', 'colon': ':', 'semicolon': ';', 'exclam': '!', 'question': '?',
         'quotesingle': "'", 'quotedbl': '"', 'quoteleft': '‘', 'quoteright': '’',
         'quotedblleft': '“', 'quotedblright': '”', 'hyphen': '-', 'endash': '–',
         'ampersand': '&', 'parenleft': '(', 'parenright': ')', 'slash': '/', 'at': '@', 'numbersign': '#',
         'sterling': '£', 'dollar': '$', 'euro': '€', 'percent': '%', 'plus': '+', 'asterisk': '*',
         'periodcentered': '·', 'bullet': '•', 'multiply': '×', 'equal': '=', 'underscore': '_',
         'bracketleft': '[', 'bracketright': ']', 'emdash': '—', 'ellipsis': '…'}

def build_all():
    d = np.load(f'{W}/logo_letters.npz')
    names = list(d['_names']); pos = {n: tuple(p) for n, p in zip(names, d['_pos'])}
    letters = {n: d[n] for n in names}
    out = {}
    caps_fill = {}
    for ch in CAPS:
        if ch in LOGO_KEYS:
            caps_fill[ch] = from_logo(LOGO_KEYS[ch], letters, pos, LOGO_BASE)
        else:
            caps_fill[ch] = generated(ch)
    caps_fill['R.alt'] = from_logo('R6', letters, pos, LOGO_BASE)
    for name, (m, base, ox) in caps_fill.items():
        out[name] = finish(m, base, ox, name)
        lc = name.lower() if len(name) == 1 else 'r.alt.sc'
        out[lc] = finish(*small_cap(m, base, ox), lc)
        print(name, end=' ', flush=True)
    for ch in DIGITS:
        out[ch] = finish(*generated(ch, 'digit' + ch), ch); print(ch, end=' ', flush=True)
    for name, ch in PUNCT.items():
        g = generated(ch, name)
        if g is None: print('MISSING', name); continue
        out[name] = finish(*g, name); print(name, end=' ', flush=True)
    return out

if __name__ == '__main__':
    out = build_all()
    flat = {}
    for k, v in out.items():
        for f in ('fill', 'sil'):
            flat[f'{k}|{f}'] = np.packbits(v[f], axis=1)
            flat[f'{k}|{f}|shape'] = np.array(v[f].shape)
        flat[f'{k}|meta'] = np.array([v['base'], v['ox']], dtype=np.float64)
    np.savez_compressed(f'{W}/glyphs.npz', **flat)
    print('\nsaved', len(out))
