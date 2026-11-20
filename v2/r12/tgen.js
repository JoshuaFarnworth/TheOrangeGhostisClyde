const fs=require('fs');
function rng(seed){let s=seed>>>0;const f=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 return {random:f,range:(a,b)=>a+(b-a)*f(),int:(a,b)=>a+Math.floor(f()*(b-a+1)),chance:p=>f()<p,pick:a=>a[Math.floor(f()*a.length)],gaussian:(m,s)=>{let u=1-f(),v=f();return m+s*Math.sqrt(-2*Math.log(u))*Math.cos(6.283185*v);}};}
const PI=Math.PI, lerp=(a,b,t)=>a+(b-a)*t;
eval(fs.readFileSync(__dirname+'/trees12.js','utf8'));
const sps=(process.argv[2]||'maple,oak,elm,birch,spruce,young').split(','), n=+(process.argv[3]||4), out=[];
for(const sp of sps) for(let k=0;k<n;k++){const t=growTree(rng(k*7919+sp.length*31+1),0,0,sp,k/(n-1||1));out.push({sp,k,h:t.h,R:t.R,H0:t.H0,n:t.segs.length,segs:t.segs.map(s=>s.map(v=>+v.toFixed(3)))});}
fs.writeFileSync('/tmp/trees.json',JSON.stringify(out)); console.log(out.map(o=>o.sp+o.k+':'+o.n+' h'+o.h.toFixed(1)+' R'+o.R.toFixed(1)).join(' '));
