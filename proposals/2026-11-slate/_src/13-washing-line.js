// WASHING LINE — a Verlet rope (Jakobsen 2001) loaded with one household's week of washing.
// Rule: the line is a chain of points joined by stiff but slightly elastic links between two posts; each pegged item adds its weight at its pegs.
// The sag is solved, not drawn. Who lives here is told only by what hangs and how much the line gives.
const house=pick([['adult','adult'],['adult'],['adult','adult','child','baby'],['adult','child','child'],['old'],['adult','adult','child']]);
const ITEMS={adult:[['shirt',80,95,3],['trousers',60,140,4],['towel',95,150,6],['sock',18,45,0.5],['sock',18,45,0.5]],child:[['shirt',52,60,1.5],['trousers',40,80,1.5],['sock',13,28,0.3]],
  baby:[['vest',34,40,0.4],['vest',34,40,0.4],['cloth',42,42,0.4]],old:[['cardigan',84,95,4],['vest',52,66,1],['cloth',52,52,0.5]]};
let items=[];for(const p of house)for(const it of ITEMS[p])if(R()<0.85)items.push(it);items.sort(()=>R()-0.5);
if(house.includes('adult')&&house.length>1&&R()<0.5)items.unshift(['sheet',230,200,9]);
const NP=80,x0=60,x1=W-60,yP=330,seg=(x1-x0)/(NP-1)*1.0,pts=[];for(let i=0;i<NP;i++){const x=x0+(x1-x0)*i/(NP-1);pts.push({x,y:yP,px:x,py:yP,m:1})}
while(items.reduce((a,b)=>a+b[1]+14,0)>x1-x0-60)items.pop();
let total=items.reduce((a,b)=>a+b[1]+8,0),cur=(x1-x0-total)/2+x0,hung=[];
for(const it of items){const a=cur,b=cur+it[1];const ia=Math.round((a-x0)/(x1-x0)*(NP-1)),ib=Math.round((b-x0)/(x1-x0)*(NP-1));
  pts[ia].m+=it[3]/2;pts[ib].m+=it[3]/2;hung.push({it,ia,ib});cur=b+8+rr(0,6)}
for(let s=0;s<900;s++){for(let i=1;i<NP-1;i++){const p=pts[i],vx=(p.x-p.px)*0.98,vy=(p.y-p.py)*0.98;p.px=p.x;p.py=p.y;p.x+=vx;p.y+=vy+0.05*p.m}
  for(let k=0;k<10;k++)for(let i=0;i<NP-1;i++){const a=pts[i],b=pts[i+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),df=(d-seg)/d;
    const wa=i===0?0:1/a.m,wb=i+1===NP-1?0:1/b.m,wsum=(wa+wb)/0.9;if(!wsum)continue;a.x+=dx*df*wa/wsum;a.y+=dy*df*wa/wsum;b.x-=dx*df*wb/wsum;b.y-=dy*df*wb/wsum}}
function garment(n,ax,ay,bx,by,w,h){const c=pick(['#d9d4c7','#7b93a8','#b45a4a','#e6dcc0','#4d5b4a','#c9b37a','#f2efe9']);stroke(40,36,32,160);strokeWeight(1);fill(c);
  push();translate(ax,ay);const ww=bx-ax;applyMatrix(ww/w,(by-ay)/w,0,1,0,0);   // top follows the line, cloth hangs plumb
  if(n==='shirt'||n==='cardigan'||n==='vest'){beginShape();vertex(0,0);vertex(w,0);vertex(w+(n==='vest'?0:10),h*0.35);vertex(w*0.85,h*0.3);vertex(w*0.85,h);vertex(w*0.15,h);vertex(w*0.15,h*0.3);vertex(-(n==='vest'?0:10),h*0.35);endShape(CLOSE)}
  else if(n==='trousers'){beginShape();vertex(0,0);vertex(w,0);vertex(w+3,h);vertex(w*0.56,h);vertex(w*0.5,h*0.3);vertex(w*0.44,h);vertex(-3,h);endShape(CLOSE)}
  else if(n==='sock'){beginShape();vertex(0,0);vertex(w,0);vertex(w,h*0.8);vertex(w+8,h);vertex(-1,h);endShape(CLOSE)}
  else{rect(0,0,w,h*(n==='sheet'?1:1));if(n==='towel'){stroke(255,255,255,120);line(0,h*0.85,w,h*0.85)}}
  noStroke();fill('#8a6a3a');rect(-2,-6,4,12);rect(w-2,-6,4,12);pop()}
function setup(){createCanvas(W,H);pixelDensity(2);background(PAPER);stroke(60,50,40);strokeWeight(6);line(x0,yP-20,x0,H*0.86);line(x1,yP-20,x1,H*0.86);
  strokeWeight(1);line(30,H*0.86,W-30,H*0.86);
  noFill();stroke(40,36,32);strokeWeight(1.2);beginShape();for(const p of pts)vertex(p.x,p.y);endShape();
  for(const {it,ia,ib} of hung)garment(it[0],pts[ia].x,pts[ia].y,pts[ib].x,pts[ib].y,it[1],it[2]);
  let sag=0;for(const p of pts)sag=Math.max(sag,p.y-yP);label(`${items.length} things on the line · lowest point ${Math.round(sag)} px below the posts`);window.__done=true}
