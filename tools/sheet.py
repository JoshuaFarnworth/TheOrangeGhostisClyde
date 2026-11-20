# python3 sheet.py <slug> [samples_dir]
import sys, os, json, glob
from PIL import Image, ImageDraw, ImageFont
slug = sys.argv[1]; d = f'/workspace/clyde/series/{slug}'
sd = sys.argv[2] if len(sys.argv) > 2 else os.path.join(d, 'samples')
files = sorted(glob.glob(os.path.join(sd, '[0-9][0-9].png')))
meta = json.load(open(os.path.join(sd, 'samples.json')))
cols = 6; tw = 300
ims = [Image.open(f).convert('RGB') for f in files]
th = int(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
lab = 34
sheet = Image.new('RGB', (cols * (tw + 10) + 10, rows * (th + lab + 10) + 50), (24, 24, 24))
dr = ImageDraw.Draw(sheet)
try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 10); fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except: f = fb = ImageFont.load_default()
dr.text((10, 14), f'{slug}: {len(ims)} outputs (Clyde)', fill=(230, 230, 230), font=fb)
for k, im in enumerate(ims):
    x = 10 + (k % cols) * (tw + 10); y = 50 + (k // cols) * (th + lab + 10)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
    ft = meta[k].get('features') or {}
    txt = ' · '.join(str(v) for v in ft.values())
    dr.text((x, y + th + 3), f'#{k:02d} ' + txt[:58], fill=(200, 200, 200), font=f)
    dr.text((x, y + th + 16), txt[58:118], fill=(200, 200, 200), font=f)
out = os.path.join(d, 'contact-sheet.png'); sheet.save(out); print(out, sheet.size)
