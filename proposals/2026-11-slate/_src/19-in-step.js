// IN STEP — the Kuramoto model (1975) of coupled oscillators, as metronomes on one shared board (after Huygens' clocks, 1665).
// Rule: each metronome ticks at its own rate and is nudged toward the others through the board it stands on: dθi/dt = ωi + (K/N) Σ sin(θj − θi).
// Three moments from one run: as they are started, a minute later, ten minutes later. Whether they all fall into step depends on K against the spread of their rates.
const N=ri(5,9),spread=rr(0.04,0.14),Kc=2*spread*0.8,K=Kc*rr(0.6,2.2),om=[...Array(N)].map(()=>1+rr(-spread,spread));
let th=om.map(()=>rr(0,Math.PI*2));const snaps=[th.slice()];
for(let s=1;s<=600*20;s++){const n=th.map((t,i)=>{let c=0;for(const u of th)c+=Math.sin(u-t);return t+0.05*(om[i]+K/N*c)});th=n;if(s===60*20||s===600*20)snaps.push(th.slice())}
const order=t=>{let x=0,y=0;for(const u of t){x+=Math.cos(u);y+=Math.sin(u)}return Math.hypot(x,y)/t.length};
function metro(x,y,ph){stroke(40,34,28);strokeWeight(1);fill('#8a5a3a');beginShape();vertex(x-16,y);vertex(x+16,y);vertex(x+7,y-78);vertex(x-7,y-78);endShape(CLOSE);
  const a=0.5*Math.sin(ph);stroke(30,26,22);strokeWeight(2);line(x,y-12,x+Math.sin(a)*105,y-12-Math.cos(a)*105);noStroke();fill(30,26,22);rect(x+Math.sin(a)*70-5,y-12-Math.cos(a)*70-4,10,8)}
function setup(){createCanvas(W,H);pixelDensity(2);background(PAPER);
  ['started','a minute later','ten minutes later'].forEach((t,r)=>{const y=260+r*270;stroke(60,50,40);strokeWeight(1);fill('#cdbb98');rect(70,y,W-140,12);
    for(let i=0;i<N;i++)metro(110+i*(W-220)/(N-1),y,snaps[r][i]);noStroke();fill(30,28,26,150);textFont('monospace');textSize(11);text(`${t} · in step ${(order(snaps[r])*100).toFixed(0)}%`,70,y+34)});
  label(`${N} metronomes · coupling ${(K/Kc).toFixed(2)}× the critical value`);window.__done=true}
