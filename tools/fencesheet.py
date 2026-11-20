import json,sys
from PIL import Image,ImageDraw
d=sys.argv[1]; out=sys.argv[2]; M=json.load(open(d+'/meta.json'))
rows=[]
for m in M:
    s=Image.open(f"{d}/{m['nm']}_side.pgm").convert('RGB'); t=Image.open(f"{d}/{m['nm']}_top.ppm"); h=Image.open(f"{d}/{m['nm']}_shd.pgm").convert('RGB')
    k=0.5; s=s.resize((int(s.width*k),int(s.height*k))); t=t.resize((int(t.width*k),int(t.height*k))); h=h.resize((int(h.width*k),int(h.height*k)))
    rows.append((m['desc'],s,t,h))
W=max(r[1].width for r in rows)*3+60; Hh=sum(max(r[1].height,r[3].height)+40 for r in rows)+40
S=Image.new('RGB',(W,Hh),(250,250,248)); dr=ImageDraw.Draw(S); y=30; cw=max(r[1].width for r in rows)
dr.text((10,8),'Before the Shovels, round 13: fence types from the engine\'s FENCE block. Left: side elevation (true scale, 1 px = 1.25 cm). Middle: plan from above (snow on flat tops). Right: ground shadow, sun 22 deg up, 40 deg off the fence normal (thickness of block/shadowbox respected).',fill=(0,0,0))
for desc,s,t,h in rows:
    dr.text((10,y),desc,fill=(0,0,0)); S.paste(s,(10,y+14)); S.paste(t,(20+cw,y+14)); S.paste(h,(30+2*cw,y+14)); y+=max(s.height,h.height)+40
S.save(out); print(out,S.size)
