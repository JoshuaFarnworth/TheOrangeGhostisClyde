# sweep.py <projectDir> <n> [res=200] [--res-check]
# Renders seeds 1..n (hash = sha256("clyde-<slug>-<i>")) and enforces a minimum visual-content check:
# detail = 4 x 70th-percentile tile std of band-passed luma + 0.1 x global std (see detail()). An output FAILS if
# detail < 0.4 x the sweep median or < an absolute floor (0.02). With --res-check, seeds 1-3 are rendered at 300 and 600 px and the
# 600 render is downsampled and compared (mean abs diff in 0-1 luma; > 0.04 = resolution-dependent).
import sys,os,subprocess,json,statistics
import numpy as np
from PIL import Image, ImageFilter
d=sys.argv[1].rstrip('/'); n=int(sys.argv[2]); res=int(sys.argv[3]) if len(sys.argv)>3 and sys.argv[3].isdigit() else 200
T='/workspace/clyde/2027/_tools'; out=f'/tmp/clyde27_sweep_{os.path.basename(d)}'
subprocess.run(['rm','-rf',out]); subprocess.run(['bash',f'{T}/batch.sh',d,'1',str(n),str(res),out],check=True)
def luma(p):
    im=Image.open(p).convert('L'); return im
def detail(p):
    # robust to a single strong edge (a paper border, a frame): 70th percentile over an 8x8 grid of tiles of the
    # std of the band-passed luma (fine structure that a viewer reads as marks), plus a small global term
    im=luma(p); a=np.asarray(im.filter(ImageFilter.GaussianBlur(1.2)),float)/255; b=np.asarray(im.filter(ImageFilter.GaussianBlur(im.width/30)),float)/255
    hp=a-b  # band-pass: film grain (sigma<1px) is removed first so grain alone cannot pass
    H,W=hp.shape; t=[hp[y*H//8:(y+1)*H//8, x*W//8:(x+1)*W//8].std() for y in range(8) for x in range(8)]
    return float(np.percentile(t,70)*4+0.1*a.std())
rows=[]
for i in range(1,n+1):
    p=f'{out}/{i:02d}.png'; f=json.load(open(f'{out}/{i:02d}.json')).get('features',{})
    rows.append((i,detail(p),f))
med=statistics.median(r[1] for r in rows); fails=[r for r in rows if r[1]<max(0.4*med,0.02)]
print(f'{os.path.basename(d)}: n={n} median detail={med:.4f} fails={len(fails)}')
for i,s,f in fails: print(f'  FAIL #{i:02d} {s:.4f} {f}')
lo=sorted(rows,key=lambda r:r[1])[:3]; print('  lowest:',[(i,round(s,4)) for i,s,_ in lo])
if '--res-check' in sys.argv:
    for i in (1,2,3):
        for r in (300,600): subprocess.run(['bash',f'{T}/batch.sh',d,str(i),str(i),str(r),f'{out}_r{r}'],check=True)
        a=np.asarray(luma(f'{out}_r300/{i:02d}.png'),float)/255; im=luma(f'{out}_r600/{i:02d}.png').resize((a.shape[1],a.shape[0]),Image.LANCZOS)
        m=float(np.abs(a-np.asarray(im,float)/255).mean()); print(f'  res-check #{i}: mean|300-600↓|={m:.4f}', 'OK' if m<0.04 else 'RES-DEPENDENT')
sys.exit(1 if fails else 0)
