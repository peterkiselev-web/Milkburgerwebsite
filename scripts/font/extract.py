# Split the traced logo into per-letter fill masks.
import numpy as np, sys
from PIL import Image
from scipy import ndimage as ndi
W = sys.argv[1]
im = np.asarray(Image.open(f'{W}/logo2x.png').convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
fill = (r > b) & (r > 100) & (g < 180)
ink = (b > r) & (b > 100)
lab, n = ndi.label(fill)
objs = ndi.find_objects(lab)
order = sorted(range(n), key=lambda i: objs[i][1].start)
names = list('MILKBURGER')
letters = {}
for k, i in enumerate(order):
    m = lab == (i + 1)
    ys, xs = np.nonzero(m)
    letters[f'{names[k]}{k}'] = dict(mask=m[ys.min():ys.max()+1, xs.min():xs.max()+1], x0=xs.min(), y0=ys.min())
np.savez_compressed(f'{W}/logo_letters.npz', **{k: v['mask'] for k, v in letters.items()},
                    _pos=np.array([[v['x0'], v['y0']] for v in letters.values()]), _names=np.array(list(letters)))
for k, v in letters.items():
    print(k, v['mask'].shape, v['x0'], v['y0'])
