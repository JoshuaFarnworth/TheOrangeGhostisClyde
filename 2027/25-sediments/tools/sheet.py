# python3 tools/sheet.py <out.png> <cols> <title> <png...> : labelled sheet; each png has a sibling .json from tools/render.js
import sys, json, os, datetime, warnings; warnings.filterwarnings('ignore')
from PIL import Image, ImageDraw, ImageFont
out, cols, title, files = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4:]
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f1, f2, ft = ImageFont.truetype(FB, 17), ImageFont.truetype(F, 14), ImageFont.truetype(FB, 24)
hist = {}
def gap(run, N):
    if run not in hist: hist[run] = json.load(open(f'histories/{run}.json'))
    h = hist[run]
    if N < 2: return 'first mint, ' + datetime.datetime.utcfromtimestamp(h[0]['timestamp']).strftime('%d %b %Y %H:%M UTC')
    s = h[N-1]['timestamp'] - h[N-2]['timestamp']
    return 'gap since previous mint ' + (f'{s//60} min' if s < 3600 else f'{s/3600:.1f} h' if s < 86400 else f'{s/86400:.1f} days')
ims = [Image.open(f) for f in files]; w, h = ims[0].size; cap = 78; pad = 18
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w + (cols + 1) * pad, 60 + rows * (h + cap + pad) + pad), '#f2efe9'); D = ImageDraw.Draw(S)
D.text((pad, 18), title, font=ft if len(title) * 13 < S.size[0] else ImageFont.truetype(FB, 16), fill='#222')
for i, (f, im) in enumerate(zip(files, ims)):
    x = pad + (i % cols) * (w + pad); y = 60 + (i // cols) * (h + cap + pad)
    S.paste(im, (x, y)); j = json.load(open(f[:-4] + '.json')); ft_ = j['features']; run = os.path.basename(f).split('_')[0]
    lab = {'steady-hashes-bursty-timing': 'steady hashes, bursty timing', 'steady-hashes-dormant-timing': 'steady hashes, dormant timing'}.get(run, run)
    D.text((x, y + h + 6), f"#{j['N']}  {lab}  ·  {ft_['World Date']}", font=f1, fill='#222')
    D.text((x, y + h + 30), f"{ft_['Era']}  ·  {ft_['Surface']}  ({gap(run, j['N'])})"[:int(w/7.4)], font=f2, fill='#444')
    D.text((x, y + h + 50), f"In view: {ft_['Remains In View']}"[:int(w/7.6)], font=f2, fill='#444')
S.save(out); print(out, S.size)
