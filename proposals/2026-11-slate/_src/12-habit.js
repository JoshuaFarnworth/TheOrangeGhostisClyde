// HABIT — the chaos game (an iterated function system, after Barnsley) played on one person's town.
// Rule: each day the person goes some fraction r of the way from where they are toward one of a few places, chosen at random.
// Two people with the same places and the same r, but different dice and different favourite places, trace the same figure.
const k=ri(3,5),r=k===3?rr(0.45,0.55):rr(0.34,0.42),names=['home','work','school','mum’s','the shop'];
const P=[];const a0=rr(0,Math.PI*2);for(let i=0;i<k;i++){const a=a0+i*Math.PI*2/k+rr(-0.25,0.25),d=rr(0.75,1);P.push([Math.cos(a)*d,Math.sin(a)*d])}
function walk(rand,weights,n){const pts=[];let x=0,y=0;const tot=weights.reduce((a,b)=>a+b);
  for(let i=0;i<n;i++){let u=rand()*tot,j=0;while(j<k-1&&u>weights[j]){u-=weights[j];j++}x+=(P[j][0]-x)*(1-r);y+=(P[j][1]-y)*(1-r);if(i>20)pts.push([x,y])}return pts}
const w1=P.map(()=>rr(0.3,3)),w2=P.map(()=>rr(0.3,3)),A=walk(rng(SEED+'/one'),w1,40000),B=walk(rng(SEED+'/two'),w2,40000);
function town(pts,w,cx,cy,sc){stroke(30,28,26,40);strokeWeight(1);for(let i=0;i<k;i++)for(let j=i+1;j<k;j++)if(R()<0.6)line(cx+P[i][0]*sc,cy+P[i][1]*sc,cx+P[j][0]*sc,cy+P[j][1]*sc);
  stroke(30,40,70,70);strokeWeight(1.1);for(const[x,y]of pts)point(cx+x*sc,cy+y*sc);
  for(let i=0;i<k;i++){noStroke();fill(30,28,26);circle(cx+P[i][0]*sc,cy+P[i][1]*sc,5);fill(30,28,26,150);textFont('monospace');textSize(11);
    text(`${names[i]} ${Math.round(w[i]/w.reduce((a,b)=>a+b)*100)}%`,cx+P[i][0]*sc+7,cy+P[i][1]*sc-6)}}
function setup(){createCanvas(W,H);pixelDensity(2);background(PAPER);town(A,w1,W/2,280,190);town(B,w2,W/2,730,190);
  label(`${k} places · each day ${Math.round((1-r)*100)}% of the way there · two people, different dice`);window.__done=true}
