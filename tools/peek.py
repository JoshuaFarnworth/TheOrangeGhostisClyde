import sys
from PIL import Image
slug=sys.argv[1]; idx=[int(x) for x in sys.argv[2].split(',')]; sub=sys.argv[3] if len(sys.argv)>3 else 'samples'
ims=[Image.open(f'/workspace/clyde/series/{slug}/{sub}/{i:02d}.png').convert('RGB') for i in idx]
w=400; h=int(w*ims[0].height/ims[0].width); cols=min(3,len(ims)); rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(cols*w,rows*h))
for k,im in enumerate(ims): s.paste(im.resize((w,h)),((k%cols)*w,(k//cols)*h))
import time; fn=f'/tmp/peek_{slug}_{int(time.time())}.png'; s.save(fn); print(fn)
