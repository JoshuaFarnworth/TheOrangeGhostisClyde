// HELD — static equilibrium of a stack of books piled toward a shelf edge.
// Rule: book k stays only while the centre of mass of everything above it lies over book k (or over the shelf for the bottom book).
// Books are added one at a time, each nudged a little toward the edge. The stack fails where the weight above has drifted
// past its support — often well below the book that was added last.
const pal=['#6b2f2a','#2f4a5a','#7b6a3a','#3d5a40','#8a8072','#4a3b52','#9a5b3a','#2b2b2b','#b8a888'];
const edge=W*0.6;let books,failAt;
function attempt(){books=[];failAt=-2;const drift=rr(1.5,7);let x=0;
  for(let k=0;k<40&&failAt<-1;k++){const w=rr(130,220),t=rr(14,32),m=w*t;
    x=k?x+drift+rr(-26,30)+(books[k-1].w-w)/2:edge-w-rr(10,60);books.push({x,w,t,m,c:pick(pal)});
    for(let j=books.length-2;j>=-1;j--){let M=0,Mx=0;for(let i=j+1;i<books.length;i++){M+=books[i].m;Mx+=books[i].m*(books[i].x+books[i].w/2)}
      const cx=Mx/M,lo=j<0?-1e9:books[j].x,hi=j<0?edge:books[j].x+books[j].w;if(cx<lo||cx>hi){failAt=j;break}}}
  return failAt>-2&&books.length>=9&&books.length<=26}
for(let tries=0;tries<500&&!attempt();tries++);
function book(b,y){stroke(30,28,26);strokeWeight(1);fill(b.c);rect(b.x,y-b.t,b.w,b.t,2);
  fill('#ece6d6');rect(b.x+b.w-7,y-b.t+2,5,b.t-4);stroke(30,28,26,60);for(let k=4;k<b.t-3;k+=3)line(b.x+b.w-6,y-b.t+k,b.x+b.w-3,y-b.t+k)}
function setup(){createCanvas(W,H);pixelDensity(2);background(PAPER);const base=H*0.86;
  stroke(30,28,26);strokeWeight(2);fill('#cdbfa6');rect(40,base,edge-40,22);line(edge,base,edge,base+22);
  let y=base,ys=[];for(const b of books){ys.push(y);y-=b.t}
  const cut=failAt+1;for(let i=0;i<cut;i++)book(books[i],ys[i]);
  if(cut<books.length){push();const px=failAt<0?edge:books[failAt].x+books[failAt].w,py=ys[cut];translate(px,py);rotate(rr(0.12,0.32));translate(-px,-py);
    for(let i=cut;i<books.length;i++)book(books[i],ys[i]);pop()}
  label(`${books.length} books · gave way above ${failAt<0?'the shelf':'book '+(failAt+1)} · the last one added was book ${books.length}`);window.__done=true}
