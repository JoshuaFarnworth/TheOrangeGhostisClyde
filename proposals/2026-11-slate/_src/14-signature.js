// SIGNATURE — Hollerbach's oscillation model of handwriting (1981), one person's signature at eight ages.
// Rule: the pen is two coupled oscillators — a vertical one that makes the letters and a horizontal one riding a steady drift.
// The person is a fixed sequence of stroke amplitudes and phases. Age changes only fluency, size, simplification and tremor.
const K=ri(7,12),strokes=[];for(let k=0;k<K;k++){const u=R();strokes.push({ay:rr(0.8,1.2),up:u<0.25?rr(2.2,3):1,down:u>0.85?rr(2,2.8):1,ph:rr(-0.5,0.5),loop:R()<0.45})}
const cap=R()<0.7,flourish=R()<0.55,slant0=rr(-0.05,0.35);
const AGES=[[7,0.35,1.5,0,0.0],[11,0.55,1.25,0,0],[16,0.8,1.05,0.05,0],[24,0.95,1,0.12,0],[38,1,0.92,0.25,0],[55,0.95,0.88,0.35,0.004],[72,0.8,0.8,0.4,0.012],[86,0.6,0.74,0.42,0.025]];
function write(x0,y0,age,flu,size,simp,trem,r){const pts=[],sc=20*size,drift=0.8+flu*0.3;const T=K*Math.PI*2,dt=0.04;
  for(let t=0;t<T;t+=dt){const k=Math.min(K-1,Math.floor(t/(Math.PI*2))),s=strokes[k],fade=Math.exp(-simp*k*0.6),wob=(1-flu)*0.6;
    const ay=s.ay*(k===0&&cap?2.3:1)*(0.3+0.7*fade)*(1+wob*(r()-0.5)*0.8),ax=(s.loop?2.0:0.95)*(0.6+0.4*fade);
    const v=Math.sin(t);let x=drift*t+ax*Math.cos(t+s.ph),y=-ay*(v>0?v*s.up:v*s.down)*0.5;
    x+=-y*(slant0+0.15*(1-flu))+wob*0.3*Math.sin(t*0.31);if(trem){x+=Math.sin(t*47)*trem*7;y+=Math.cos(t*43)*trem*7}pts.push([x0+x*sc*0.5,y0+y*sc*1.6])}
  noFill();stroke(24,32,58,210);strokeWeight(1.1+0.5*(1-flu));beginShape();for(const p of pts)vertex(p[0],p[1]);endShape();
  if(flourish&&age>=16&&age<80){const e=pts[pts.length-1];bezier(e[0],e[1],e[0]+25,e[1]+sc*1.4,x0+40,y0+sc*1.5,x0-10,y0+sc*1.0)}}
function setup(){createCanvas(W,H);pixelDensity(2);background(PAPER);const r=rng(SEED+'/hand');
  AGES.forEach((a,i)=>{const y=120+i*105;stroke(30,28,26,50);strokeWeight(0.7);line(60,y+18,W-60,y+18);noStroke();fill(30,28,26,120);textFont('monospace');textSize(11);text('age '+a[0],60,y+34);
    write(150,y,...a,r)});
  label(`${K} strokes · the same person at eight ages`);window.__done=true}
