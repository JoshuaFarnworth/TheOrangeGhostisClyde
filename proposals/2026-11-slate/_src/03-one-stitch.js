// ONE STITCH — an elementary cellular automaton knitted as two scarves.
// Rule: each new row of stitches is a function of the three stitches below it (Wolfram's 256 rules).
// Both scarves share the same cast-on and the same rule. At one row a single stitch in the right-hand scarf is knitted
// in the wrong colour (marked with a stitch marker). Everything after that row is the consequence of that one stitch.
const RULES=[30,45,54,73,86,89,101,110,124,137,18,22,126,150,105,57,62];
const rule=pick(RULES),COLS=31,ROWS=72,errRow=ri(10,26),errCol=ri(6,COLS-7);
const yarn=pick([['#e9e1cf','#2f3a52'],['#ece4d2','#7a3b2a'],['#e6e0d4','#3c4a3a'],['#efe6d6','#5a4a3d']]);
function step(r){const n=[];for(let i=0;i<COLS;i++){const l=r[(i-1+COLS)%COLS],c=r[i],q=r[(i+1)%COLS];n.push((rule>>(l*4+c*2+q))&1)}return n}
const cast=[];for(let i=0;i<COLS;i++)cast.push(R()<0.5?1:0);
const A=[cast],B=[cast.slice()];
for(let y=1;y<ROWS;y++){A.push(step(A[y-1]));let b=step(B[y-1]);if(y===errRow){b=b.slice();b[errCol]^=1}B.push(b)}
let diff=0;for(let i=0;i<COLS;i++)diff+=A[ROWS-1][i]!==B[ROWS-1][i];
function scarf(G,x0,y0,cw,ch,mark){
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const px=x0+x*cw,py=y0+(ROWS-1-y)*ch,c=color(yarn[G[y][x]]);
    const j=(R()-0.5)*0.6;stroke(c);strokeWeight(cw*0.46);strokeCap(ROUND);
    line(px+cw*0.1+j,py+ch*0.05,px+cw*0.5,py+ch*0.95);line(px+cw*0.9+j,py+ch*0.05,px+cw*0.5,py+ch*0.95);
    stroke(0,0,0,28);strokeWeight(0.7);line(px+cw*0.5,py+ch*0.95,px+cw*0.5,py+ch*0.4)}
  if(mark){const my=y0+(ROWS-1-errRow)*ch+ch/2,mx=x0+COLS*cw+12;noFill();stroke('#b8892d');strokeWeight(1.6);
    ellipse(mx,my,9,13);line(mx-4,my,x0+COLS*cw+1,my)}}
function setup(){createCanvas(W,H);pixelDensity(2);background(PAPER);
  const cw=10,ch=12,y0=70;scarf(A,W/2-COLS*cw-30,y0,cw,ch,false);scarf(B,W/2+30,y0,cw,ch,true);
  label(`rule ${rule} · one stitch changed at row ${errRow} · ${diff} of ${COLS} stitches differ in the last row`);window.__done=true}
