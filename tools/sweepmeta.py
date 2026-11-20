# sweepmeta.py <slug> <rendered_dir> <out_png> <out_json> : grid + stats, each output tagged with its exact seed and source version
import json,glob,hashlib,sys,os,numpy as np
from PIL import Image, ImageDraw, ImageFilter
from collections import Counter
slug,d,opng,ojson=sys.argv[1:5]
src=f'/workspace/clyde/series/{slug}/src/art.js'; sh='/workspace/clyde/series/_shared/clyde.js'
ver={'art.js_sha256_12':hashlib.sha256(open(src,'rb').read()).hexdigest()[:12],'clyde.js_sha256_12':hashlib.sha256(open(sh,'rb').read()).hexdigest()[:12]}
items=[]
for j in sorted(glob.glob(d+'/*.json'),key=lambda p:int(os.path.basename(p)[:-5])):
    i=int(os.path.basename(j)[:-5]); r=json.load(open(j)); im=Image.open(j[:-5]+'.png').convert('L'); a=np.asarray(im,float); e=np.asarray(im.filter(ImageFilter.FIND_EDGES),float)
    items.append({'i':i,'hash':'0x'+hashlib.sha256(f'clyde-{slug}-{i}'.encode()).hexdigest(),'f':r['features'],'ms':r['ms'],'mean':round(a.mean(),1),'sd':round(a.std(),1),'edge':round(e.mean(),2)})
counts={k:Counter(x['f'][k] for x in items) for k in items[0]['f']}
tw,th,cols=128,160,20; rows=(len(items)+cols-1)//cols
G=Image.new('RGB',(cols*tw,rows*(th+12)),(20,20,22)); dr=ImageDraw.Draw(G)
for k,x in enumerate(items):
    im=Image.open(f"{d}/{x['i']:02d}.png").convert('RGB').resize((tw,th)); c,r=k%cols,k//cols; G.paste(im,(c*tw,r*(th+12))); dr.text((c*tw+2,r*(th+12)+th),f"{x['i']} {x['f']['Place'][4:12]}",fill=(200,200,200))
G.save(opng)
json.dump({'version':ver,'seedRule':f"hash = 0x + sha256('clyde-{slug}-' + i); standalone ?hash=<hash>&res=<res>",'counts':counts,'items':items},open(ojson,'w'),indent=1)
print(ver, len(items)); print({k:dict(v) for k,v in counts.items() if k in ('Place','Made Thing','Fence','Animals')})
w=sorted(items,key=lambda x:x['edge'])[:10]; print('weakest by edge energy', [(x['i'],x['f']['Place'],x['edge']) for x in w])
print('ms avg',round(sum(x['ms'] for x in items)/len(items)),'max',max(x['ms'] for x in items))
