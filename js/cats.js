// Cat Orbs: Conquerors of Cat Earth - drawing cats and treats
// ---------- cats ----------
function makeCat(x,y,r,name,isP,fur){return{x,y,r,t:r,vx:0,vy:0,dx:0,dy:0,name,fur:fur||AI_FURS[Math.floor(Math.random()*AI_FURS.length)],
  player:!!isP,alive:true,dash:0,cd:0,think:Math.random()*.3,wx:x,wy:y,wt:0,blink:rnd(1,5),look:{x:0,y:0}};}
const STARS=[[-.5,-.4],[.3,-.6],[.6,.1],[-.2,.5],[.1,-.15],[-.65,.15],[.45,.55],[-.1,-.7]];
function drawCat(g,c,x,y,r){
  const f=c.fur;g.save();g.translate(x,y);
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(r*.08,r*.9,r*.85,r*.22,0,0,7);g.fill();
  const hf=headSkin(f); // the hand-drawn head is now every cat's shape; the old orb drawing below is the fallback if the images are missing
  if(hf){const S=r*2.83; // sprite ball radius is .353 of its size, centered
    g.drawImage(hf,-S/2,-S/2,S,S);
    drawEyes(g,c,f,r,.4,-.02-.26*(c.mo||0),.9-.12*(c.mo||0));drawMouth(g,c,r);g.restore();return;} // eyes rise and shrink a touch as the mouth opens
  for(const s of[-1,1]){g.fillStyle=f.s;g.beginPath();g.moveTo(s*r*.8,-r*.4);g.lineTo(s*r*.62,-r*1.18);g.lineTo(s*r*.12,-r*.86);g.closePath();g.fill();
    g.fillStyle=f.fx==='cosmic'?'#c04fd8':'#f2a5a8';g.beginPath();g.moveTo(s*r*.66,-r*.5);g.lineTo(s*r*.58,-r*.98);g.lineTo(s*r*.28,-r*.8);g.closePath();g.fill();}
  circ(g,0,0,r,f.b);
  if(f.fx==='calico'||f.fx==='cosmic'){g.save();g.beginPath();g.arc(0,0,r,0,7);g.clip();
    if(f.fx==='calico'){circ(g,-r*.5,-r*.4,r*.5,'#e8873a');circ(g,r*.55,r*.2,r*.42,'#2d2a30');circ(g,-r*.2,r*.75,r*.3,'#e8873a');}
    else{g.globalAlpha=.55;circ(g,-r*.3,r*.25,r*.55,'#b04fd8');g.globalAlpha=.45;circ(g,r*.4,-r*.3,r*.45,'#3fa7d6');g.globalAlpha=1;
      for(const[a,b]of STARS)circ(g,a*r,b*r,Math.max(.8,r*.035),'#fff');}
    g.restore();}
  const gr=g.createRadialGradient(-r*.35,-r*.4,r*.05,0,0,r);
  gr.addColorStop(0,'rgba(255,255,255,.4)');gr.addColorStop(.45,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(0,0,0,.32)');
  g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,7);g.fill();
  if(f.st){g.strokeStyle=f.s;g.lineCap='round';g.lineWidth=r*.08;
    for(const k of[-1,0,1]){g.beginPath();g.moveTo(k*r*.18,-r*.92);g.lineTo(k*r*.12,-r*.62);g.stroke();}
    for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.97,r*.05);g.lineTo(s*r*.72,r*.08);g.moveTo(s*r*.93,r*.3);g.lineTo(s*r*.7,r*.28);g.stroke();}}
  g.globalAlpha=.55;g.fillStyle=shade(f.b,45);g.beginPath();g.ellipse(0,r*.32,r*.38,r*.26,0,0,7);g.fill();g.globalAlpha=1;
  if(f.fx==='gold'){g.fillStyle='#fff';g.beginPath();const sx=-r*.5,sy=-r*.5,q=r*.16;g.moveTo(sx,sy-q);g.lineTo(sx+q*.25,sy-q*.25);g.lineTo(sx+q,sy);g.lineTo(sx+q*.25,sy+q*.25);g.lineTo(sx,sy+q);g.lineTo(sx-q*.25,sy+q*.25);g.lineTo(sx-q,sy);g.lineTo(sx-q*.25,sy-q*.25);g.closePath();g.fill();}
  drawEyes(g,c,f,r,.34,-.06,1);
  g.fillStyle='#e97c8a';g.beginPath();g.moveTo(-r*.07,r*.17);g.lineTo(r*.07,r*.17);g.lineTo(0,r*.26);g.closePath();g.fill();
  g.strokeStyle='#3a2a2a';g.lineWidth=Math.max(1,r*.03);g.beginPath();g.arc(-r*.07,r*.27,r*.07,.1,Math.PI-.4);g.moveTo(r*.14,r*.27);g.arc(r*.07,r*.27,r*.07,.4,Math.PI-.1);g.stroke();
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=Math.max(.8,r*.02);
  for(const s of[-1,1])for(const k of[-1,0,1]){g.beginPath();g.moveTo(s*r*.28,r*.24+k*r*.04);g.lineTo(s*r*.85,r*.18+k*r*.12);g.stroke();}
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=Math.max(1.5,r*.035);g.beginPath();g.arc(0,0,r,0,7);g.stroke();
  g.restore();
}
// The big mouth: opens wide while eating (and, for you, when something edible is in reach), with suction streaks
// The mouth: a small closed smile that opens into a huge gulping mouth (small fangs, tongue, suction streaks).
// As it opens, the eyes slide up to make room (see drawCat).
// the mouth and nose slide toward the side the cat faces (like the eyes, but further)
const MOUTH_SHIFT=.16,mouthX=c=>(c.look?c.look.x:0)*MOUTH_SHIFT;
function drawMouth(g,c,r){const o=c.mo||0,mx=r*mouthX(c),w=r*(.1+.58*o),h=r*(.03+.5*o),my=r*(.43+.07*o);
  if(r*cam.z<4&&!c.player)return;
  const ink=lum(c.fur.b)<.33?'#ece4d8':'#1a1416';
  // the nose sits on the top edge of the mouth and rides up as the mouth opens
  const nose=()=>{const ny=Math.min(r*.31,my-h-r*.045),nw=r*.115,nh=r*.09;g.fillStyle=lum(c.fur.b)<.33?'#ece4d8':'#d5b5d7';g.strokeStyle=ink;g.lineWidth=Math.max(1,r*.035);g.lineJoin='round';
    g.beginPath();g.moveTo(mx-nw,ny-nh*.55);g.quadraticCurveTo(mx,ny-nh*.95,mx+nw,ny-nh*.55);g.quadraticCurveTo(mx+nw*.55,ny+nh*.45,mx,ny+nh*.75);g.quadraticCurveTo(mx-nw*.55,ny+nh*.45,mx-nw,ny-nh*.55);g.closePath();g.fill();g.stroke();
    if(o<.06){g.beginPath();g.moveTo(mx,ny+nh*.75);g.lineTo(mx,r*.4);g.stroke();}};
  if(o<.06){nose();g.strokeStyle=ink;g.lineWidth=Math.max(1,r*.035);g.lineCap='round';g.beginPath(); // closed: a little "w"
    g.arc(mx-r*.07,r*.4,r*.07,.15,Math.PI-.35);g.moveTo(mx+r*.14,r*.4);g.arc(mx+r*.07,r*.4,r*.07,.35,Math.PI-.15);g.stroke();return;}
  g.fillStyle='#3a1520';g.beginPath();g.ellipse(mx,my,w,h,0,0,7);g.fill();
  g.fillStyle='#e9707f';g.beginPath();g.ellipse(mx,my+h*.45,w*.55,h*.42,0,0,7);g.fill();
  // fangs hang inside the mouth: each tooth's top edge follows the mouth's own curve, so it tucks
  // under the lip outline (drawn next) and nothing pokes outside the mouth
  if(o>.35){const fw=w*.13,fh=h*.3;g.fillStyle='#fff';
    for(const s of[-1,1]){const fx=mx+s*w*.42,t1=-Math.acos((fx-fw-mx)/w),t2=-Math.acos((fx+fw-mx)/w),ey=my-h*Math.sqrt(1-((fx-mx)/w)**2);
      g.beginPath();g.ellipse(mx,my,w,h,0,t1,t2,false);g.lineTo(fx,ey+fh);g.closePath();g.fill();}}
  g.strokeStyle='#1a0a0e';g.lineWidth=Math.max(1,r*.03);g.beginPath();g.ellipse(mx,my,w,h,0,0,7);g.stroke();
  if(o>.35&&!SET.lite&&!(c.burpT>0)&&(c.player||r*cam.z>40))suction(g,r,mx,my,o); // no suction while burping
  nose();}
// Suction: streaks of air curve in from around the cat, speed up as they're pulled and vanish into the mouth.
// Drawn over the mouth so they visibly rush inside.
const SUCK_N=7;
function suction(g,r,mx,my,o){g.lineCap='round';
  for(let i=0;i<SUCK_N;i++){const a=Math.PI*(-.14+1.28*i/(SUCK_N-1))+Math.sin(clock*1.7+i*2.1)*.1,R=r*(1.4+.12*Math.sin(i*1.9)); // from the sides and below, clear of the eyes
    const sx=Math.cos(a)*R,sy=Math.sin(a)*R*.95+r*.1,dx=mx-sx,dy=my-sy,sw=(i%2?1:-1)*.22,cx=(sx+mx)/2-dy*sw,cy=(sy+my)/2+dx*sw;
    const P=u=>{const v=1-u;return[v*v*sx+2*v*u*cx+u*u*mx,v*v*sy+2*v*u*cy+u*u*my];};
    for(let j=0;j<2;j++){const ph=(clock*(1.6+.25*(i%3))+i*.37+j*.5)%1,u0=ph*ph,u1=Math.min(1,u0+.12+.3*ph); // ease-in: accelerates toward the mouth
      const fade=Math.min(1,ph*4)*(1-Math.max(0,(u1-.82)/.18)),al=.8*o*fade;if(al<.02)continue;
      g.strokeStyle=`rgba(255,255,255,${al})`;g.lineWidth=Math.max(1.5,r*.06*(1-u0*.65));g.beginPath();
      for(let k=0;k<=5;k++){const[x,y]=P(u0+(u1-u0)*k/5);k?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}}
  g.lineCap='butt';}
function drawEyes(g,c,f,r0,EX,EY,k){
  const r=r0*k,lx=c.look.x*r*.07,ly=c.look.y*r*.06;
  for(const s of[-1,1]){const ex=s*r0*EX+lx,ey=r0*EY+ly;
    if(c.blink<0){g.strokeStyle='#1a1416';g.lineWidth=r*.05;g.beginPath();g.arc(ex,ey-r*.04,r*.13,.3,Math.PI-.3);g.stroke();continue;}
    if(f.head||k<1){g.fillStyle='#111';g.beginPath();g.ellipse(ex,ey,r*.2,r*.22,0,0,7);g.fill();}
    g.fillStyle='#fffdf6';g.beginPath();g.ellipse(ex,ey,r*.17,r*.19,0,0,7);g.fill();
    g.fillStyle=f.eye;g.beginPath();g.ellipse(ex+lx*.6,ey+ly*.6,r*.13,r*.15,0,0,7);g.fill();
    g.fillStyle='#120e10';g.beginPath();g.ellipse(ex+lx*.9,ey+ly*.9,r*.045,r*.12,0,0,7);g.fill();
    circ(g,ex+lx*.6-r*.05,ey+ly*.6-r*.07,r*.035,'#fff');}
}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);const c=v=>Math.max(0,Math.min(255,v+amt));return`rgb(${c(n>>16)},${c(n>>8&255)},${c(n&255)})`;}

// ---------- treats ----------
const YARN=['#ff6f59','#7fb8ff','#c792ea'];
function drawFood(f,z){
  const T=f.T,r=f.r,amp=Math.min(10,Math.max(3,r*.18)),bob=Math.sin(clock*2.6+f.ph)*amp,lift=Math.min(r*.45,14)+4;
  const locked=player&&player.alive&&!canEatF(player,f);
  ctx.save();ctx.translate(f.x,f.y);
  const sh=1-(bob/amp)*.15;ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,r*.5,r*.85*sh,r*.25*sh,0,0,7);ctx.fill();
  ctx.translate(0,-lift+bob);
  ctx.globalAlpha=.22+.08*Math.sin(clock*4+f.ph);circ(ctx,0,0,r*(r>40?1.3:1.75),locked?PAL.danger:T.glow);ctx.globalAlpha=1;
  ctx.lineWidth=Math.max(2.5,2.5/z,r*.04);ctx.strokeStyle=T.glow;ctx.lineJoin='round';
  if(T.k==='kibble'){ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle='#c7843f';ctx.fill();ctx.stroke();circ(ctx,-r*.3,-r*.3,r*.4,'#e6a865');}
  else if(T.k==='goldfish'){ctx.rotate(f.rot);ctx.beginPath();ctx.ellipse(0,0,r,r*.5,0,0,7);ctx.moveTo(r*.8,0);ctx.lineTo(r*1.4,-r*.5);ctx.lineTo(r*1.4,r*.5);ctx.closePath();
    const gg=ctx.createLinearGradient(0,-r*.5,0,r*.5);gg.addColorStop(0,'#fff3a0');gg.addColorStop(1,'#e0a000');ctx.fillStyle=gg;ctx.fill();ctx.stroke();circ(ctx,-r*.55,-r*.1,r*.12,'#5a3a00');
    ctx.rotate(-f.rot);ctx.fillStyle='#fff';for(let i=0;i<3;i++){const a=clock*2+i*2.1,q=r*(.18+.1*Math.sin(clock*6+i));ctx.save();ctx.translate(Math.cos(a)*r*1.3,Math.sin(a)*r*1.3);ctx.rotate(clock);ctx.fillRect(-q/2,-q/8,q,q/4);ctx.fillRect(-q/8,-q/2,q/4,q);ctx.restore();}}
  else if(T.k==='fish'){ctx.rotate(f.rot);ctx.beginPath();ctx.ellipse(0,0,r,r*.5,0,0,7);ctx.moveTo(r*.8,0);ctx.lineTo(r*1.4,-r*.5);ctx.lineTo(r*1.4,r*.5);ctx.closePath();
    ctx.fillStyle='#8fc6e0';ctx.fill();ctx.stroke();circ(ctx,-r*.55,-r*.1,r*.12,'#1b2430');}
  else if(T.k==='yarn'){ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle=YARN[f.hue];ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.5;ctx.rotate(f.rot);for(const k of[.15,.5,.85]){ctx.beginPath();ctx.ellipse(0,0,r*.9,r*k,0,0,7);ctx.stroke();}}
  else if(T.k==='box'){ctx.rotate(Math.sin(f.ph)*.2);rr(ctx,-r,-r*.8,r*2,r*1.6,4);ctx.fillStyle='#c9965a';ctx.fill();ctx.stroke();
    ctx.fillStyle='#b07d45';ctx.fillRect(-r,-r*.8,r*2,r*.35);ctx.fillStyle='#e8d4a6';ctx.fillRect(-r*.15,-r*.8,r*.3,r*1.6);
    ctx.strokeStyle='#7a5530';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.5,r*.3);ctx.lineTo(-r*.3,r*.1);ctx.moveTo(-r*.4,r*.1);ctx.lineTo(-r*.4,r*.4);ctx.stroke();}
  else if(T.k==='tuna'){ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle='#c5ccd6';ctx.fill();ctx.stroke();
    circ(ctx,0,0,r*.86,'#3f7fd8');circ(ctx,0,0,r*.6,'#e9eef4');ctx.fillStyle='#1f3f6e';ctx.font=`800 ${r*.34}px "Baloo 2",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('TUNA',0,r*.04);
    ctx.strokeStyle='#9aa3ae';ctx.lineWidth=r*.05;ctx.beginPath();ctx.ellipse(0,-r*.35,r*.18,r*.1,0,0,7);ctx.stroke();}
  else if(T.k==='mouse'){ctx.rotate(f.rot);ctx.beginPath();ctx.ellipse(0,0,r,r*.62,0,0,7);ctx.fillStyle='#b9b4c7';ctx.fill();ctx.stroke();
    circ(ctx,-r*.55,-r*.5,r*.3,'#f2a5c0');circ(ctx,-r*.55,r*.5,r*.3,'#f2a5c0');circ(ctx,-r*.85,-r*.15,r*.08,'#1d2733');circ(ctx,-r*.85,r*.15,r*.08,'#1d2733');
    ctx.strokeStyle='#8e879e';ctx.lineWidth=r*.12;ctx.beginPath();ctx.moveTo(r*.9,0);ctx.quadraticCurveTo(r*1.5,r*.6,r*1.8,0);ctx.stroke();}
  else if(T.k==='bed'){ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle='#7a5cc2';ctx.fill();ctx.stroke();
    circ(ctx,0,r*.06,r*.7,'#f4e4c1');circ(ctx,-r*.18,-r*.12,r*.32,'rgba(255,255,255,.35)');}
  else if(T.k==='tower'){rr(ctx,-r,-r,r*2,r*2,r*.15);ctx.fillStyle='#a67c52';ctx.fill();ctx.stroke();
    for(const[a,b,q]of[[-.45,-.45,.42],[.45,.4,.48],[.5,-.5,.3],[-.4,.5,.3]]){circ(ctx,a*r+r*.05,b*r+r*.06,q*r,'rgba(0,0,0,.25)');circ(ctx,a*r,b*r,q*r,'#e3d6c2');circ(ctx,a*r,b*r,q*r*.25,'#c9a46a');}}
  else if(T.k==='tanker'){ctx.rotate(Math.sin(f.ph)*.3);rr(ctx,-r*1.3,-r*.55,r*2.6,r*1.1,r*.5);ctx.fillStyle='#eef5fc';ctx.fill();ctx.stroke();
    ctx.fillStyle='#3f7fd8';rr(ctx,r*.75,-r*.5,r*.5,r,r*.12);ctx.fill();ctx.fillStyle='#3f7fd8';ctx.font=`800 ${r*.42}px "Baloo 2",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('MILK',-r*.25,r*.04);}
  else if(T.k==='market'){rr(ctx,-r,-r*.8,r*2,r*1.6,r*.1);ctx.fillStyle='#8b5a3c';ctx.fill();ctx.stroke();
    for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#fff4e0':'#e8453c';ctx.fillRect(-r+i*r/4,-r*.8,r/4,r*.6);}
    ctx.fillStyle='#d9cbb0';ctx.fillRect(-r*.9,0,r*1.8,r*.7);
    for(let i=0;i<4;i++){ctx.save();ctx.translate(-r*.6+i*r*.4,r*.35);ctx.fillStyle=['#8fc6e0','#ff8a5c','#9dd99a','#c5ccd6'][i];ctx.beginPath();ctx.ellipse(0,0,r*.15,r*.08,0,0,7);ctx.fill();ctx.restore();}}
  else if(T.k==='yarnmtn'){for(const[a,b,q,c]of[[-.35,.25,.6,0],[.38,.22,.55,1],[0,-.3,.62,2]]){ctx.beginPath();ctx.arc(a*r,b*r,q*r,0,7);ctx.fillStyle=YARN[(c+f.hue)%3];ctx.fill();ctx.stroke();
      ctx.save();ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=Math.max(1.5,r*.015);ctx.translate(a*r,b*r);ctx.rotate(f.rot+c);for(const k of[.2,.5,.8]){ctx.beginPath();ctx.ellipse(0,0,q*r*.9,q*r*k,0,0,7);ctx.stroke();}ctx.restore();}}
  else{ctx.rotate(Math.sin(f.ph)*.3);rr(ctx,-r*1.3,-r*.7,r*2.6,r*1.4,r*.2);ctx.fillStyle='#f4f1ea';ctx.fill();ctx.stroke();
    ctx.fillStyle='#3f9bd8';rr(ctx,r*.55,-r*.62,r*.65,r*1.24,r*.14);ctx.fill();ctx.fillStyle='#1d2733';ctx.fillRect(r*.95,-r*.5,r*.18,r);
    ctx.save();ctx.translate(-r*.3,0);ctx.fillStyle='#ff8a5c';ctx.beginPath();ctx.ellipse(0,0,r*.6,r*.3,0,0,7);ctx.moveTo(-r*.5,0);ctx.lineTo(-r*.85,-r*.28);ctx.lineTo(-r*.85,r*.28);ctx.closePath();ctx.fill();circ(ctx,r*.35,-r*.05,r*.06,'#1d2733');ctx.restore();}
  ctx.restore();
  if(locked){ctx.save();ctx.translate(f.x,f.y-lift+bob);ctx.strokeStyle=PAL.danger;ctx.lineWidth=Math.max(3,3/z)*PAL.w;ctx.setLineDash([8/z+4,6/z+3]);
    ctx.beginPath();ctx.arc(0,0,r*1.55,0,7);ctx.stroke();ctx.setLineDash([]);
    const fs=Math.max(12/z,r*.38);ctx.font=`800 ${fs}px "Baloo 2",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.lineWidth=fs*.25;ctx.strokeStyle='rgba(10,12,16,.85)';ctx.strokeText(needF(f),0,-r*1.55-fs*.6);ctx.fillStyle=PAL.dangerLite;ctx.fillText(needF(f),0,-r*1.55-fs*.6);ctx.restore();}
}


