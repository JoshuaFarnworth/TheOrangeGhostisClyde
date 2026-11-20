import sys,os,re
HEAD='''<!doctype html><html><head><meta charset="utf-8"><title>Clyde — %s (proposal demo)</title>
<style>html,body{margin:0;background:#ddd9d0;display:flex;justify-content:center;align-items:center;min-height:100vh}</style>
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"></script></head><body><script>
'''
COMMON='''const SEED=new URLSearchParams(location.search).get('seed')||'clyde';
function rng(s){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}let t=h>>>0;return()=>{t=t+0x6D2B79F5|0;let r=Math.imul(t^t>>>15,1|t);r=r+Math.imul(r^r>>>7,61|r)^r;return((r^r>>>14)>>>0)/4294967296}}
const R=rng(SEED),rr=(a,b)=>a+R()*(b-a),ri=(a,b)=>Math.floor(rr(a,b+1)),pick=a=>a[Math.floor(R()*a.length)];
const W=800,H=1000,PAPER='#f1eee6';
function label(s){push();noStroke();fill(30,28,26,140);textFont('monospace');textSize(11);textAlign(LEFT);text(s+' · seed '+SEED,60,H-40);pop()}
'''
for f in sys.argv[1:]:
    src=open(f).read(); slug=os.path.basename(f)[:-3]
    lines=src.split('\n'); k=0
    while k<len(lines) and lines[k].startswith('//'): k+=1
    title=re.search(r'^// (.+?) —',src).group(1).title()
    os.makedirs(slug,exist_ok=True)
    out=HEAD%title+'\n'.join(lines[:k])+'\n'+COMMON+'\n'.join(lines[k:])+'\n</script></body></html>\n'
    open(os.path.join(slug,'index.html'),'w').write(out)
    print(slug,len(out.split('\n')),'lines')
