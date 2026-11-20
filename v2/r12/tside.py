# tside.py <dumpdir> <out.png> -- debug sheet: engine trees in side elevation (true 3D skeleton), plan view, and their sun shadow
import json,glob,math,sys,os
from PIL import Image,ImageDraw
d=sys.argv[1]; out=sys.argv[2]
order=['maple','oak','elm','birch','spruce','young']; got={k:[] for k in order}
for f in sorted(glob.glob(d+'/*.json'),key=lambda p:int(os.path.basename(p)[:-5])):
    for t in json.load(open(f)):
        if len(got[t['sp']])<4: t['src']=os.path.basename(f)[:-5]; got[t['sp']].append(t)
sc=26; cw,ch=430,500; S=Image.new('RGB',(cw*4,ch*len(order)+40),(246,245,241)); dr=ImageDraw.Draw(S)
dr.text((10,10),'Before the Shovels, round 12: tree skeletons from the engine (sample id, species). Left: side elevation, true scale (figure = 1.75 m). Right: plan view (what the camera sees) and sun shadow at 15 deg (same geometry).',fill=(0,0,0))
for r,sp in enumerate(order):
    for c,t in enumerate(got[sp]):
        ox=c*cw+130; gy=40+r*ch+ch-30; x0,y0=t['x'],t['y']
        dr.line((c*cw+10,gy,c*cw+cw-150,gy),fill=(170,160,150))
        # a person for scale
        dr.line((c*cw+20,gy,c*cw+20,gy-1.75*sc),fill=(200,60,40),width=3); dr.ellipse((c*cw+16,gy-1.75*sc-8,c*cw+24,gy-1.75*sc),fill=(200,60,40))
        segs=sorted(t['segs'],key=lambda s:-(s[1]+s[3]))
        for s in segs:
            x1,y1,x2,y2,d1,z1,z2,d2,k=s; w=max(1,round((d1+d2)/2*sc))
            col=(36,66,42) if k==1 else ((70,62,55) if (d1+d2)/2>0.012 else (150,140,130))
            if sp=='birch' and k==0 and (d1+d2)/2>0.04: col=(190,186,178)
            dr.line((ox+(x1-x0)*sc,gy-z1*sc,ox+(x2-x0)*sc,gy-z2*sc),fill=col,width=w)
        # plan and shadow, small
        px,py=c*cw+cw-75,40+r*ch+110; ps=7; el=math.radians(15); cot=1/math.tan(el)
        for s in sorted(t['segs'],key=lambda s:s[5]+s[6]):
            x1,y1,x2,y2,d1,z1,z2,d2,k=s; w=max(1,round((d1+d2)/2*ps*1.5)); col=(36,66,42) if k==1 else (70,62,55)
            dr.line((px+(x1-x0)*ps,py+(y1-y0)*ps,px+(x2-x0)*ps,py+(y2-y0)*ps),fill=col,width=w)
        sx,sy=c*cw+cw-140,40+r*ch+300
        for s in t['segs']:
            x1,y1,x2,y2,d1,z1,z2,d2,k=s; w=max(1,round((d1+d2)/2*ps*0.25*2))
            dr.line((sx+((x1-x0)+z1*cot)*ps*0.25*1.6,sy+(y1-y0)*ps*0.6,sx+((x2-x0)+z2*cot)*ps*0.25*1.6,sy+(y2-y0)*ps*0.6),fill=(110,118,150),width=w)
        dr.text((c*cw+10,40+r*ch+8),f"#{t['src']} {sp}{' (off-frame)' if t['ghost'] else ''}  h {t['h']:.1f} m  crown r {t['R']:.1f} m  clear bole {t['H0']:.1f} m  {len(t['segs'])} segs",fill=(0,0,0))
        dr.text((c*cw+cw-140,40+r*ch+30),'plan',fill=(90,90,90)); dr.text((c*cw+cw-140,40+r*ch+260),'shadow (sun 15 deg)',fill=(90,90,90))
S.save(out); print(out,S.size,{k:len(v) for k,v in got.items()})
