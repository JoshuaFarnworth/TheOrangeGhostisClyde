// node slate-render.js <demoDir> <outDir> seed1 seed2 ...
const fs=require('fs'),path=require('path'),puppeteer=require('puppeteer-core') /* npm i puppeteer-core; uses /usr/bin/google-chrome */;
const [dir,out,...seeds]=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--allow-file-access-from-files']});
for(const s of seeds){const p=await b.newPage();await p.setViewport({width:900,height:1100,deviceScaleFactor:1});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const t0=Date.now();await p.goto('file://'+path.resolve(dir,'index.html')+'?seed='+encodeURIComponent(s));
try{await p.waitForFunction('window.__done===true',{timeout:60000,polling:100})}catch(e){errs.push('timeout')}
let d=null;for(let k=0;k<3&&!d;k++){try{d=await p.evaluate(()=>{const c=document.querySelector('canvas');return c?c.toDataURL('image/png'):null})}catch(e){errs.push('ctx:'+e.message);await new Promise(r=>setTimeout(r,1500))}}
if(d)fs.writeFileSync(path.join(out,s+'.png'),Buffer.from(d.split(',')[1],'base64'));
console.log(s,(Date.now()-t0)+'ms',errs.join(' | '));await p.close()}
await b.close()})();
