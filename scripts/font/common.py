# Shared raster helpers for the Milk Burger display font build.
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

HF = 470      # fill cap height in processing pixels (matches the logo)
T = 58        # outline thickness in processing pixels (matches the logo)
PAD = 220     # canvas margin around each glyph

def crop(m):
    ys, xs = np.nonzero(m)
    return m[ys.min():ys.max()+1, xs.min():xs.max()+1], xs.min(), ys.min()

def dilate(m, r):
    if r == 0: return m.copy()
    if r > 0: return ndi.distance_transform_edt(~m) <= r
    return ndi.distance_transform_edt(m) > -r

def smooth(m, s):
    return ndi.gaussian_filter(m.astype(np.float32), s) > 0.5

def render_base(font_path, ch, hc, sx=1.0, blur=6):
    """Glyph mask on a canvas whose baseline is at row `base`. Returns (mask, base, x_origin, advance_px)."""
    size = hc / 0.59
    f = ImageFont.truetype(font_path, int(round(size)))
    w = int(size * 2.2) + 2 * PAD
    h = int(size * 1.9) + 2 * PAD
    base = PAD + int(size * 1.15)
    img = Image.new('L', (w, h), 0)
    ImageDraw.Draw(img).text((PAD, base), ch, fill=255, font=f, anchor='ls')
    a = np.asarray(img).astype(np.float32) / 255
    a = ndi.gaussian_filter(a, blur) > 0.5
    adv = f.getlength(ch)
    if sx != 1.0:
        nw = int(round(w * sx))
        a = np.asarray(Image.fromarray(a.astype(np.uint8) * 255).resize((nw, h), Image.LANCZOS)) > 127
        a = np.pad(a, ((0, 0), (0, max(0, w + int(PAD) - nw))))
        adv *= sx
    return a, base, PAD * sx, adv
