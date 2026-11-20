// SAID AGAIN — serial reproduction as a rewriting grammar.
// Each line is the previous line retold by the next person. Rewrite rules follow Allport & Postman's
// levelling (detail dropped), sharpening (detail exaggerated) and assimilation (made familiar). One rule per retelling, sometimes none.
const STORIES=[
 ['the dog from number nine got out again on tuesday and ran down to the canal',[
  ['from number nine ','from next door '],['from next door ',''],[' again',''],[' on tuesday',''],['tuesday','the weekend'],['ran down to','ran to'],
  ['the canal','the river'],['the river','the main road'],['ran to','was hit on'],['got out','escaped'],['the dog','the big dog'],['escaped','attacked someone'],
  ['the big dog','that dog'],['and ran down to the canal','and nearly drowned']]],
 ['she said she might come for christmas if the trains are running',[
  ['she said she might','she might'],['might come','is coming'],['might come','will not come'],[' if the trains are running',''],['the trains are running','she can get time off'],
  ['for christmas','at christmas'],['at christmas','for new year'],['is coming','is coming home'],['coming home','coming home for good'],
  ['she said ','apparently '],['if she can get time off','if he lets her'],['will not come','is not speaking to us']]],
 ['the man in the corner flat had lived there forty years and kept to himself',[
  ['forty','fifty'],['fifty','sixty'],['kept to himself','never spoke to anyone'],['never spoke to anyone','was a bit strange'],['was a bit strange','was not right'],
  ['the man in the corner flat','the old man upstairs'],['the old man upstairs','that old man'],['had lived there forty years and ',''],['lived there','been there'],
  ['kept to himself','was always kind'],['was always kind','was a saint'],['and kept to himself','and died alone']]]];
const [first,rules]=pick(STORIES),N=ri(16,22);const lines=[first];
for(let i=1;i<N;i++){const s=lines[i-1];const ok=rules.filter(r=>s.includes(r[0]));
  lines.push(ok.length&&R()<0.8?s.replace(...pick(ok)).replace(/\s+/g,' ').trim():s)}
function setup(){createCanvas(W,H);pixelDensity(2);background(PAPER);textFont('Courier New');textSize(14);
  const lh=Math.min(40,(H-200)/N);let y=110;
  for(let i=0;i<N;i++){const words=lines[i].split(' '),prev=i?lines[i-1].split(' '):words;let x=72;
    noStroke();fill(30,28,26,110);textSize(11);text(String(i+1).padStart(2,' '),40,y);textSize(14);
    for(const w of words){const changed=i>0&&!prev.includes(w);fill(30,28,26);text(w,x,y);const tw=textWidth(w);
      if(changed){stroke(150,60,40,170);strokeWeight(1.2);line(x,y+5,x+tw,y+5+rr(-1,1));noStroke()}x+=tw+textWidth(' ')}
    y+=lh}
  label(`${N} retellings`);window.__done=true}
