# Trace the raster glyphs and build the Milk Burger colour font (COLRv0/CPAL, CFF outlines).
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, potrace
from PIL import Image
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.colorLib.builder import buildCOLR, buildCPAL
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from common import HF, T

W, OUT = sys.argv[1], sys.argv[2]
U = 720 / (HF + 2 * T)          # font units per processing pixel
SB = round(-0.15 * T * U)       # default side bearing (letters just overlap at the outline)
DELTA = 0.4 * T * U             # kerning target: outlines overlap by this much, never reaching a fill
DOWN = 2                        # trace at half resolution

z = np.load(f'{W}/glyphs.npz')
def get(k):
    g = {}
    for f in ('fill', 'sil'):
        sh = z[f'{k}|{f}|shape']; g[f] = np.unpackbits(z[f'{k}|{f}'], axis=1)[:, :sh[1]].astype(bool)
    g['base'], g['ox'] = z[f'{k}|meta']; return g
keys = sorted({k.split('|')[0] for k in z.files})

def trace(mask):
    h, w = mask.shape
    small = np.asarray(Image.fromarray(mask.astype(np.uint8) * 255).resize((w // DOWN, h // DOWN), Image.BOX)) > 127
    small = np.pad(small, 2)
    curves = potrace.Bitmap(~small).trace(turdsize=6, alphamax=1.1, opticurve=True, opttolerance=0.4)
    out = []
    for c in curves:
        P = lambda q: ((q.x - 2) * DOWN, (q.y - 2) * DOWN)
        segs = []
        cur = P(c.start_point)
        start = cur
        for s in c.segments:
            if s.is_corner:
                segs.append(('L', P(s.c))); segs.append(('L', P(s.end_point)))
            else:
                segs.append(('C', P(s.c1), P(s.c2), P(s.end_point)))
        out.append((start, segs))
    return out

def to_font(contours, x_left, base):
    """Image px -> font units. x measured from the silhouette's left edge; y up from the baseline."""
    res = []
    for start, segs in contours:
        f = lambda p: ((p[0] - x_left) * U - SB * 0 , (base + T - p[1]) * U)
        pts = [f(start)]; ss = []
        for s in segs:
            ss.append((s[0],) + tuple(f(p) for p in s[1:]))
        res.append((pts[0], ss))
    return res

def area(start, segs):
    pts = [start] + [s[-1] for s in segs]
    return 0.5 * sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]))

def reverse(start, segs):
    pts = [start] + [s[-1] for s in segs]
    new = []
    for i in range(len(segs) - 1, -1, -1):
        s = segs[i]; prev = pts[i]
        if s[0] == 'L': new.append(('L', prev))
        else: new.append(('C', s[2], s[1], prev))
    return pts[-1], new

def inside(pt, start, segs):
    pts = [start] + [p for s in segs for p in s[1:]]
    x, y = pt; c = False
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        if (y0 > y) != (y1 > y) and x < (x1 - x0) * (y - y0) / (y1 - y0) + x0: c = not c
    return c

def orient(contours):
    # Outer contours counter-clockwise, holes clockwise (nonzero winding).
    out = []
    for i, (st, sg) in enumerate(contours):
        depth = sum(inside(st, *contours[j]) for j in range(len(contours)) if j != i)
        a = area(st, sg)
        want_ccw = depth % 2 == 0
        if (a > 0) != want_ccw: st, sg = reverse(st, sg)
        out.append((st, sg))
    return out

def charstring(contours, width, dx):
    pen = T2CharStringPen(width, None)
    R = lambda p: (round(p[0] + dx), round(p[1]))
    for st, sg in contours:
        pen.moveTo(R(st))
        for s in sg:
            if s[0] == 'L': pen.lineTo(R(s[1]))
            else: pen.curveTo(R(s[1]), R(s[2]), R(s[3]))
        pen.closePath()
    return pen.getCharString()

glyphs = {}; profiles = {}
for k in keys:
    g = get(k)
    xs = np.nonzero(g['sil'].any(0))[0]
    x_left, x_right = xs.min(), xs.max() + 1
    wid = (x_right - x_left) * U
    adv = round(wid + 2 * SB)
    sil = orient(to_font(trace(g['sil']), x_left, g['base']))
    fil = orient(to_font(trace(g['fill']), x_left, g['base']))
    glyphs[k] = dict(sil=sil, fill=fil, adv=adv)
    # Left/right profiles (in units) per 10-unit band, widened vertically by half an outline.
    m = g['sil']; h = m.shape[0]
    rows = {}
    for y in range(h):
        r = np.nonzero(m[y])[0]
        if len(r): rows[y] = (r.min(), r.max() + 1)
    prof = {}
    for y, (a, b) in rows.items():
        band = int((g['base'] + T - y) * U // 10)
        L = (a - x_left) * U + SB; R_ = adv - ((b - x_left) * U + SB)
        pl, pr = prof.get(band, (1e9, 1e9)); prof[band] = (min(pl, L), min(pr, R_))
    profiles[k] = prof
    print(k, adv, len(sil), len(fil), flush=True)

# Glyph order and cmap.
names_map = {}
for k in keys:
    if len(k) == 1 and (k.isalpha() or k.isdigit()): names_map[k] = ord(k)
from glyphs import PUNCT
for n, ch in PUNCT.items():
    if n in glyphs: names_map[n] = ord(ch)
def gname(k):
    if k == 'R.alt': return 'R.alt'
    if k == 'r.alt.sc': return 'r.alt.sc'
    if len(k) == 1 and k.isdigit(): return ['zero','one','two','three','four','five','six','seven','eight','nine'][int(k)]
    return k
order = ['.notdef', 'space'] + [gname(k) for k in keys]
order += [gname(k) + '.ink' for k in keys] + [gname(k) + '.fill' for k in keys]
cmap = {32: 'space', 0xA0: 'space'}
for k, cp in names_map.items(): cmap[cp] = gname(k)
cmap[0x2019] = 'quoteright'

cs = {}; metrics = {}
empty = T2CharStringPen(500, None).getCharString()
cs['.notdef'] = empty; metrics['.notdef'] = (500, 0)
SPACE = 230
cs['space'] = T2CharStringPen(SPACE, None).getCharString(); metrics['space'] = (SPACE, 0)
for k, g in glyphs.items():
    n = gname(k)
    for suffix, cont in (('', g['sil']), ('.ink', g['sil']), ('.fill', g['fill'])):
        cs[n + suffix] = charstring(cont, g['adv'], SB)
        metrics[n + suffix] = (g['adv'], SB)

fb = FontBuilder(1000, isTTF=False)
fb.setupGlyphOrder(order)
fb.setupCharacterMap(cmap)
fb.setupCFF('MilkBurger-Regular', {'FullName': 'Milk Burger Regular'}, cs, {})
# Real left side bearings from the charstrings.
from fontTools.pens.boundsPen import BoundsPen
fb.setupHorizontalMetrics({n: (metrics[n][0], 0) for n in order})
gs = fb.font.getGlyphSet()
hmtx = {}
ymin, ymax = 0, 0
for n in order:
    bp = BoundsPen(gs); gs[n].draw(bp)
    b = bp.bounds
    hmtx[n] = (int(metrics[n][0]), int(np.floor(b[0])) if b else 0)
    if b: ymin, ymax = min(ymin, b[1]), max(ymax, b[3])
fb.font['hmtx'].metrics = hmtx
ASC, DESC = 900, -240
fb.setupHorizontalHeader(ascent=ASC, descent=DESC, lineGap=0)
fb.setupNameTable({
    'copyright': 'Copyright 2020 The Darumadrop Project Authors (https://github.com/ManiackersDesign/darumadrop). Letters M, I, L, K, B, U, R, G and E traced from the Milk Burger logo.',
    'familyName': 'Milk Burger', 'styleName': 'Regular', 'uniqueFontIdentifier': 'MilkBurger-Regular-1.000',
    'fullName': 'Milk Burger Regular', 'psName': 'MilkBurger-Regular', 'version': 'Version 1.000',
    'licenseDescription': 'This Font Software is licensed under the SIL Open Font License, Version 1.1.',
    'licenseInfoURL': 'https://openfontlicense.org',
})
fb.setupOS2(sTypoAscender=ASC, sTypoDescender=DESC, sTypoLineGap=0, usWinAscent=max(ASC, int(ymax) + 10),
            usWinDescent=max(-DESC, int(-ymin) + 10), sCapHeight=720, sxHeight=round(720 * 0.78),
            fsSelection=0x40 | 0x80, achVendID='NONE', usWeightClass=800, version=4)
fb.setupPost()

# Colour: outline in the text colour, letter body from the palette (cream by default).
layers = {gname(k): [(gname(k) + '.ink', 0xFFFF), (gname(k) + '.fill', 0)] for k in glyphs}
fb.font['COLR'] = buildCOLR(layers, version=0)
fb.font['CPAL'] = buildCPAL([[(1.0, 253 / 255, 246 / 255, 1.0)], [(244 / 255, 239 / 255, 225 / 255, 1.0)]])

# Kerning: close every letter pair until the outlines overlap by DELTA.
kernable = [k for k in keys if len(k) == 1 and (k.isalpha() or k.isdigit())] + ['R.alt', 'r.alt.sc']
lines = []
for a in kernable:
    pa = profiles[a]
    for b in kernable:
        pb = profiles[b]
        gaps = []
        for band in set(pa) & set(pb):
            # Widen by neighbouring bands so near-diagonal contact counts.
            ra = min(pa.get(band + d, (1e9, 1e9))[1] for d in (-3, -2, -1, 0, 1, 2, 3))
            gaps.append(ra + pb[band][0])
        if not gaps: continue
        k = -DELTA - min(gaps)
        k = max(-120, min(80, k))
        if abs(k) >= 8: lines.append(f'  pos {gname(a)} {gname(b)} {round(k)};')
fea = 'languagesystem DFLT dflt;\nlanguagesystem latn dflt;\n'
fea += 'feature kern {\n' + '\n'.join(lines) + '\n} kern;\n'
fea += 'feature calt {\n  sub U R\' G by R.alt;\n  sub u r\' g by r.alt.sc;\n} calt;\n'
addOpenTypeFeaturesFromString(fb.font, fea)
print('kern pairs', len(lines))
fb.font.save(OUT + '.otf')
fb.font.flavor = 'woff2'; fb.font.save(OUT + '.woff2')
print('sizes', os.path.getsize(OUT + '.otf'), os.path.getsize(OUT + '.woff2'), 'ybounds', ymin, ymax)
