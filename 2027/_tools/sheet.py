# sheet.py <dir> <out.png> [cols] [thumbW] [keys]  : contact sheet with trait captions
import sys,glob,json,os
from PIL import Image, ImageDraw
d=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 4; tw=int(sys.argv[4]) if len(sys.argv)>4 else 300
keys=sys.argv[5].split(',') if len(sys.argv)>5 else None
fs=sorted(glob.glob(d+'/*.png')); ims=[Image.open(f).convert('RGB') for f in fs]; th=int(tw*ims[0].height/ims[0].width)
rows=(len(ims)+cols-1)//cols; S=Image.new('RGB',(cols*(tw+8)+8,rows*(th+30)+8),(20,20,22)); dr=ImageDraw.Draw(S)
for k,(f,im) in enumerate(zip(fs,ims)):
    x=8+(k%cols)*(tw+8); y=8+(k//cols)*(th+30); S.paste(im.resize((tw,th),Image.LANCZOS),(x,y))
    j=f[:-4]+'.json'; t=os.path.basename(f)[:-4]
    if os.path.exists(j):
        F=json.load(open(j)).get('features') or {}
        ks=keys or list(F.keys())[:4]; t+=' '+' / '.join(str(F.get(q,'')) for q in ks)
    dr.text((x,y+th+4),t[:int(tw/6)],fill=(200,200,200))
S.save(out); print(out,S.size)
