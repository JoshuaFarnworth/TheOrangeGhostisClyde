import json,sys,math
from PIL import Image,ImageDraw
T=json.load(open('/tmp/trees.json')); mode=sys.argv[1] if len(sys.argv)>1 else 'side'; out=sys.argv[2] if len(sys.argv)>2 else '/tmp/side.png'
sp=sorted(set(t['sp'] for t in T),key=[t['sp'] for t in T].index); n=max(t['k'] for t in T)+1
cw,ch=300,330; sc=20  # px per m
S=Image.new('RGB',(cw*n,ch*len(sp)),(245,245,240)); d=ImageDraw.Draw(S)
el=math.radians(18); az=0.6
for t in T:
    r=sp.index(t['sp']); ox=t['k']*cw+cw//2; oy=r*ch+ch-20
    if mode=='side': d.line((t['k']*cw,oy,t['k']*cw+cw,oy),fill=(180,170,160))
    segs=sorted(t['segs'],key=lambda s:-(s[1]+s[3]) if mode=='side' else (s[5]+s[6]))
    for s in segs:
        x1,y1,x2,y2,d1,z1,z2,d2,k=s
        if mode=='side': P=(ox+x1*sc,oy-z1*sc,ox+x2*sc,oy-z2*sc)
        elif mode=='top': P=(ox+x1*sc,oy-150+y1*sc,ox+x2*sc,oy-150+y2*sc)
        else:
            c=1/math.tan(el); P=(ox-80+(x1-math.cos(az)*z1*c)*sc*0.45,oy-150+(y1-math.sin(az)*z1*c)*sc*0.45,ox-80+(x2-math.cos(az)*z2*c)*sc*0.45,oy-150+(y2-math.sin(az)*z2*c)*sc*0.45)
        w=max(1,int(round((d1+d2)/2*sc*(0.45 if mode=='shadow' else 1))))
        col=(40,70,45) if k==1 else ((60,52,45) if mode!='shadow' else (90,95,120))
        if k==0 and (d1+d2)/2<0.01: col=(130,120,110) if mode!='shadow' else (150,155,175)
        d.line(P,fill=col,width=w)
    d.text((t['k']*cw+5,r*ch+5),f"{t['sp']} h{t['h']:.1f} R{t['R']:.1f} clear{t['H0']:.1f} n{len(t['segs'])}",fill=(0,0,0))
S.save(out); print(out,S.size)
