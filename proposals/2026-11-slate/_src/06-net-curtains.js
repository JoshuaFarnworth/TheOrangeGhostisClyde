// NET CURTAINS — moiré from two identical nets hung one behind the other.
// Rule: two copies of the same square mesh; the rear one hangs at a slight angle and in soft folds.
// Neither net contains the large slow bands you see; they exist only where the two overlap.
const pitch=rr(3.6,5),ang=rr(1.2,4.5)*(R()<0.5?-1:1)*Math.PI/180,folds=ri(3,7),amp=rr(1,4);
function net(x0,y0,w,h,rot,fold,alpha){push();translate(x0+w/2,y0);rotate(rot);stroke(240,238,232,alpha);strokeWeight(1);
  for(let x=-w*0.6;x<=w*0.6;x+=pitch){beginShape();noFill();for(let y=0;y<=h;y+=8)vertex(x+(fold?amp*Math.sin((x/w)*folds*Math.PI*2+y*0.002):0),y);endShape()}
  for(let y=0;y<=h;y+=pitch){beginShape();noFill();for(let x=-w*0.6;x<=w*0.6;x+=8)vertex(x+(fold?amp*Math.sin((x/w)*folds*Math.PI*2):0),y+(fold?y*0.0:0));endShape()}pop()}
function setup(){createCanvas(W,H);pixelDensity(1);background(PAPER);
  const x0=120,y0=110,w=560,h=760;noStroke();fill('#1f2226');rect(x0,y0,w,h);       // the dark room behind the window
  drawingContext.save();drawingContext.beginPath();drawingContext.rect(x0,y0,w,h);drawingContext.clip();
  net(x0,y0-20,w,h+40,ang,true,190);net(x0,y0-20,w,h+40,0,false,190);drawingContext.restore();
  stroke('#7a6f62');strokeWeight(14);noFill();rect(x0-7,y0-7,w+14,h+14);strokeWeight(5);line(x0-30,y0-18,x0+w+30,y0-18);
  label(`pitch ${pitch.toFixed(2)} px · rear net turned ${(ang*180/Math.PI).toFixed(2)}° · ${folds} folds`);window.__done=true}
