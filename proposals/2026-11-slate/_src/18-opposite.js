// OPPOSITE — a Watts–Strogatz small-world network (1998); after Milgram's letter-chain experiments (1967).
// Rule: a town of people each knows their few nearest neighbours on a ring; a small fraction of acquaintances are rewired at random
// to anyone. Two strangers sit opposite each other on a tram. The ink line is the shortest chain of acquaintance between them.
const N=ri(600,1100),k=3,p=rr(0.01,0.06),adj=[...Array(N)].map(()=>new Set());
for(let i=0;i<N;i++)for(let d=1;d<=k;d++){let j=(i+d)%N;if(R()<p)j=Math.floor(R()*N);if(j!==i){adj[i].add(j);adj[j].add(i)}}
const a=ri(0,N-1),b=(a+Math.floor(N/2)+ri(-20,20))%N;
const prev=new Int32Array(N).fill(-1);prev[a]=a;const q=[a];while(q.length){const i=q.shift();if(i===b)break;for(const j of adj[i])if(prev[j]<0){prev[j]=i;q.push(j)}}
const path=[];for(let i=b;i!==a;i=prev[i])path.push(i);path.push(a);
function setup(){createCanvas(W,H);pixelDensity(2);background(PAPER);const cx=W/2,cy=H/2-20,Rr=320,P=i=>{const t=i/N*Math.PI*2-Math.PI/2;return[cx+Math.cos(t)*Rr,cy+Math.sin(t)*Rr]};
  stroke(30,28,26,22);strokeWeight(0.7);noFill();for(let i=0;i<N;i++)for(const j of adj[i])if(j>i&&Math.min(j-i,N-j+i)>k){const A=P(i),B=P(j);bezier(A[0],A[1],cx+(A[0]-cx)*0.3,cy+(A[1]-cy)*0.3,cx+(B[0]-cx)*0.3,cy+(B[1]-cy)*0.3,B[0],B[1])}
  stroke(30,28,26,90);strokeWeight(2);for(let i=0;i<N;i++){const[x,y]=P(i);point(x,y)}
  stroke(28,26,24);strokeWeight(1.6);for(let s=0;s<path.length-1;s++){const A=P(path[s]),B=P(path[s+1]);bezier(A[0],A[1],cx+(A[0]-cx)*0.3,cy+(A[1]-cy)*0.3,cx+(B[0]-cx)*0.3,cy+(B[1]-cy)*0.3,B[0],B[1])}
  for(const i of path){const[x,y]=P(i);noStroke();fill(28,26,24);circle(x,y,6)}
  const A=P(a),B=P(b);stroke(150,60,40);strokeWeight(1);drawingContext.setLineDash([3,4]);line(A[0],A[1],B[0],B[1]);drawingContext.setLineDash([]);
  noStroke();fill(150,60,40);circle(A[0],A[1],10);circle(B[0],B[1],10);
  label(`${N} people · ${Math.round(p*100)}% of ties are long · the two on the tram are ${path.length-1} introductions apart`);window.__done=true}
