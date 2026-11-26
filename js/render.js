// Cat Orbs: Conquerors of Cat Earth - drawing each frame, minimap, arrows, menu backdrop, main loop
// ---------- rendering ----------
function worldView(z){ctx.setTransform(DPR,0,0,DPR,0,0);const sh=state==='menu'?0:shakeA;ctx.translate(W/2+(Math.random()*2-1)*sh,H/2+(Math.random()*2-1)*sh);ctx.scale(z,z);ctx.translate(-cam.x,-cam.y);
  return[cam.x-W/2/z,cam.y-H/2/z,W/z,H/z];}
function render(){
  const z=cam.z,[vl,vt,vw,vh]=worldView(z);
  drawBackground(z,vl,vt,vw,vh);
  if(finalOn&&state!=='finale'){
    ctx.fillStyle='rgba(8,10,14,.68)';ctx.beginPath();ctx.rect(vl,vt,vw,vh);ctx.arc(0,0,arenaR,0,Math.PI*2);ctx.fill('evenodd');
    ctx.strokeStyle=mode==='clean'?'#ffd23f':PAL.danger;ctx.lineWidth=6/z*PAL.w;ctx.setLineDash([24/z,16/z]);ctx.beginPath();ctx.arc(0,0,arenaR,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
  const pad=120;
  if(state!=='finale'||finT<FIN_CITY)drawWorldWeather(z,vl,vt,vw,vh);
  drawPropOutlines(z);
  for(const f of foods)if(f.x>vl-pad&&f.x<vl+vw+pad&&f.y>vt-pad&&f.y<vt+vh+pad)drawFood(f,z);
  for(const u of powerups)if(u.alive&&u.x>vl-pad&&u.x<vl+vw+pad&&u.y>vt-pad&&u.y<vt+vh+pad)drawPU(u,z);
  const vis=cats.filter(c=>c.alive&&c.x+c.r*1.3>vl&&c.x-c.r*1.3<vl+vw&&c.y+c.r*1.3>vt&&c.y-c.r*1.3<vt+vh).sort((a,b)=>a.r-b.r);
  for(const c of vis){
    if(c.dash>0){ctx.fillStyle='rgba(255,244,224,.2)';ctx.beginPath();ctx.arc(c.x-c.vx*.06,c.y-c.vy*.06,c.r,0,7);ctx.fill();}
    if(c.player&&mode!=='solo'&&mode!=='clean'&&state!=='finale'&&(state==='count'||time<GRACE)){const a=.45+.35*Math.sin(clock*6);ctx.strokeStyle=`rgba(127,208,255,${a})`;ctx.lineWidth=7/z;
      ctx.setLineDash([10/z,8/z]);ctx.lineDashOffset=-clock*30/z;ctx.beginPath();ctx.arc(c.x,c.y,c.r+16/z,0,7);ctx.stroke();ctx.setLineDash([]);}
    // shape cues for everyone: spiky ring = can eat you, dotted ring = you can eat it
    if(!c.player&&player&&player.alive&&state!=='finale'){
      if(canEat(c,player)){const n=Math.max(14,Math.min(40,Math.round(c.r*z/4))),r1=c.r+5/z,r2=c.r+13/z;ctx.beginPath();
        for(let i=0;i<=n*2;i++){const a=i/(n*2)*Math.PI*2+clock*.4,rr2=i%2?r2:r1;ctx.lineTo(c.x+Math.cos(a)*rr2,c.y+Math.sin(a)*rr2);}
        ctx.fillStyle=rgba(PAL.danger,.28);ctx.fill();ctx.strokeStyle=PAL.danger;ctx.lineWidth=2.5/z*PAL.w;ctx.lineJoin='miter';ctx.stroke();}
      else if(canEat(player,c)){ctx.strokeStyle=PAL.edible;ctx.lineWidth=3/z*PAL.w;ctx.setLineDash([2/z,6/z]);ctx.lineCap='round';
        ctx.beginPath();ctx.arc(c.x,c.y,c.r+7/z,0,7);ctx.stroke();ctx.setLineDash([]);ctx.lineCap='butt';}}
    if(c.buff){if(c.buff.shield>0){ctx.strokeStyle=rgba(PU.shield.col,.5+.3*Math.sin(clock*8));ctx.lineWidth=5/z;ctx.fillStyle=rgba(PU.shield.col,.15);ctx.beginPath();ctx.arc(c.x,c.y,c.r*1.25+8/z,0,7);ctx.fill();ctx.stroke();}
      if(c.buff.magnet>0){ctx.strokeStyle=rgba(PU.magnet.col,.45);ctx.lineWidth=3/z;for(let i=0;i<3;i++){const q=((clock*.8+i/3)%1);ctx.globalAlpha=1-q;ctx.beginPath();ctx.arc(c.x,c.y,c.r*(1.1+q*1.4),0,7);ctx.stroke();}ctx.globalAlpha=1;}
      if(c.buff.catnip>0){ctx.fillStyle=rgba(PU.catnip.col,.6);for(let i=0;i<5;i++){const a=Math.atan2(-c.vy,-c.vx)+(i-2)*.25,d=c.r*(1.1+((clock*3+i*.2)%1)*.8);circ(ctx,c.x+Math.cos(a)*d,c.y+Math.sin(a)*d,Math.max(2/z,c.r*.08),rgba(PU.catnip.col,.6));}}}
    if(c.player){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=4/z;ctx.beginPath();ctx.arc(c.x,c.y,c.r+7/z,0,7);ctx.stroke();
      if(phone&&joy.id===null&&c.hx!==undefined&&!c.stopped){const a=Math.atan2(c.hy,c.hx),d=c.r+16/z,q=8/z;
        ctx.save();ctx.translate(c.x+c.hx*d,c.y+c.hy*d);ctx.rotate(a);ctx.fillStyle='rgba(255,255,255,.85)';
        ctx.beginPath();ctx.moveTo(q,0);ctx.lineTo(-q*.6,q*.9);ctx.lineTo(-q*.2,0);ctx.lineTo(-q*.6,-q*.9);ctx.closePath();ctx.fill();ctx.restore();}}
    if(c.pulse>0){const k=Math.sin(c.pulse/.35*Math.PI);ctx.save();ctx.translate(c.x,c.y);ctx.scale(1+k*.11,1-k*.09);drawCat(ctx,c,0,0,c.r);ctx.restore();} // squash and stretch
    else drawCat(ctx,c,c.x,c.y,c.r);}
  if(ufo&&!ufo.eaten&&state==='finale')drawUFO(ctx,ufo.x,ufo.y,ufo.r,.6+.4*Math.sin(clock*4));
  // things being eaten fly over the cats into their mouths
  for(const e of eaten)suck(e,()=>drawCat(ctx,e.c,e.x,e.y,e.r));
  for(const e of propEaten)suck(e,()=>e.p.k==='ufo'?drawUFO(ctx,e.p.x,e.p.y,e.p.r,0):e.p.k==='critter'?critterDraw(ctx,e.p.c):drawProp(ctx,e.p,lastLo));
  for(const e of foodEaten)suck(e,()=>drawFood(e.p,z));
  const tags=[];
  for(const c of vis.slice().sort((a,b)=>(b.player-a.player)||(b.r-a.r))){
    const fs=Math.max(13/z,c.r*.3);ctx.font=`700 ${fs}px "Baloo 2",sans-serif`;ctx.textAlign='center';ctx.textBaseline='top';
    const tw=ctx.measureText(`${c.name} · ${Math.round(c.r)}`).width,bx=c.x-tw/2,by=c.y+c.r*1.12;
    if(!c.player&&tags.some(t=>bx<t[0]+t[2]&&bx+tw>t[0]&&by<t[1]+t[3]&&by+fs>t[1]))continue;tags.push([bx,by,tw,fs]);
    let col='#e9dcc6';if(c.player)col='#fff';else if(player.alive){if(canEat(player,c))col=PAL.edible;else if(canEat(c,player))col=PAL.danger;}
    ctx.lineWidth=fs*.22;ctx.strokeStyle='rgba(10,12,16,.85)';ctx.lineJoin='round';
    const lbl=`${c.name} · ${Math.round(c.r)}`;
    if(c.pers==='nemesis'&&player.alive){const f2=fs*.7;ctx.font=`800 ${f2}px "Baloo 2",sans-serif`;ctx.lineWidth=f2*.22;ctx.strokeText('NEMESIS',c.x,c.y+c.r*1.12+fs*1.05);ctx.fillStyle=PAL.danger;ctx.fillText('NEMESIS',c.x,c.y+c.r*1.12+fs*1.05);ctx.font=`700 ${fs}px "Baloo 2",sans-serif`;ctx.lineWidth=fs*.22;}ctx.strokeText(lbl,c.x,c.y+c.r*1.12);ctx.fillStyle=col;ctx.fillText(lbl,c.x,c.y+c.r*1.12);}
  for(const p of parts){ctx.globalAlpha=Math.min(1,p.life*2);circ(ctx,p.x,p.y,p.r/z*.8+p.r*.4,p.col);}ctx.globalAlpha=1;
  for(const f of floats){ctx.globalAlpha=Math.min(1,f.t*1.5);ctx.font=`800 ${22/z}px "Baloo 2",sans-serif`;ctx.fillStyle=f.col||PAL.edible;ctx.textAlign='center';ctx.fillText(f.txt,f.x,f.y);}ctx.globalAlpha=1;
  if(state!=='finale'||finT<FIN_CITY)drawScreenWeather(Math.min(.05,clock-(render.lt||clock)));render.lt=clock;
  drawArrows();
  if(phone&&joy.id!==null&&player.alive){ctx.setTransform(DPR,0,0,DPR,0,0);
    const jx=joy.x-joy.ox,jy=joy.y-joy.oy,l=Math.hypot(jx,jy),k=l>55?55/l:1;
    ctx.fillStyle='rgba(255,244,224,.12)';ctx.strokeStyle='rgba(255,244,224,.5)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(joy.ox,joy.oy,55,0,7);ctx.fill();ctx.stroke();circ(ctx,joy.ox+jx*k,joy.oy+jy*k,24,'rgba(255,244,224,.55)');}
  drawMini();
}
// Edge arrows: nearby bigger cats (red, danger), cats you can eat (green), and in Grow Rush a juicy target (gold)
function drawArrows(){
  if(!player.alive||state!=='play')return;
  const z=cam.z,range=Math.max(W,H)*2.2/z,out=[];
  const offscreen=(x,y,r)=>{const sx=(x-cam.x)*z+W/2,sy=(y-cam.y)*z+H/2,sr=r*z;return(sx<-sr||sx>W+sr||sy<-sr||sy>H+sr)?[sx,sy]:null;};
  const th=[],pr=[];
  for(const c of cats){if(!c.alive||c===player)continue;const t=canEat(c,player),p=canEat(player,c);if(!t&&!p)continue;
    const o=offscreen(c.x,c.y,c.r);if(!o)continue;const d=Math.hypot(c.x-player.x,c.y-player.y);if(d>range)continue;
    (t?th:pr).push({sx:o[0],sy:o[1],d,col:t?PAL.danger:PAL.edible,lbl:String(Math.round(c.r)),pulse:t,kind:t?'danger':'prey'});}
  th.sort((a,b)=>a.d-b.d);pr.sort((a,b)=>a.d-b.d);out.push(...th.slice(0,3),...pr.slice(0,2));
  if(mode==='clean'&&player.alive&&foods.length<=CLEAN_ARROWS)for(const f of foods){const o=offscreen(f.x,f.y,f.r);if(o)out.push({sx:o[0],sy:o[1],d:Math.hypot(f.x-player.x,f.y-player.y),col:PAL.gold,lbl:'',pulse:false,kind:'target'});} // the last few pieces get arrows
  if(mode==='solo'){let best=null,bs=0;const cand=o=>{if(!canEatF(player,o)||o.r<player.r*.3)return;const d=Math.hypot(o.x-player.x,o.y-player.y);if(d>range*1.5)return;
      const sc=o.v*o.v/(d+200);if(sc>bs&&offscreen(o.x,o.y,o.r)){bs=sc;best=o;}};
    for(const f of foods)if(f.T.big)cand(f);for(const p of props)if(p.alive)cand(p);
    if(best){const o=offscreen(best.x,best.y,best.r);out.push({sx:o[0],sy:o[1],d:Math.hypot(best.x-player.x,best.y-player.y),col:PAL.gold,lbl:'',pulse:false,kind:'target'});}}
  if(!out.length)return;
  ctx.setTransform(DPR,0,0,DPR,0,0);const mx=30,mt=phone?96:120,mb=40; // keep clear of the top panels
  for(const a of out){const ang=Math.atan2(a.sy-H/2,a.sx-W/2),dx=Math.cos(ang),dy=Math.sin(ang);
    const cy=(mt+(H-mb))/2,hh=((H-mb)-mt)/2;
    const t=Math.min((W/2-mx)/Math.max(.001,Math.abs(dx)),hh/Math.max(.001,Math.abs(dy))),px=W/2+dx*t,py=cy+dy*t;
    const near=Math.max(0,1-a.d/(range*1.2)),sz=11+9*near;
    ctx.save();ctx.translate(px,py);ctx.globalAlpha=(.55+.45*near)*(a.pulse?.75+.25*Math.sin(clock*8):1);
    ctx.rotate(ang);ctx.beginPath();
    if(a.kind==='target'){ctx.moveTo(sz,0);ctx.lineTo(0,sz*.7);ctx.lineTo(-sz,0);ctx.lineTo(0,-sz*.7);}
    else{ctx.moveTo(sz,0);ctx.lineTo(-sz*.7,sz*.8);ctx.lineTo(-sz*.35,0);ctx.lineTo(-sz*.7,-sz*.8);}
    ctx.closePath();ctx.fillStyle=a.col;ctx.fill();ctx.lineWidth=2*PAL.w;ctx.strokeStyle='rgba(10,12,16,.8)';ctx.stroke();
    if(a.kind==='danger'){ctx.rotate(-ang);ctx.fillStyle='rgba(10,12,16,.9)';ctx.font=`900 ${sz*1.05}px "Baloo 2",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',-dx*sz*.15,-dy*sz*.15+1);ctx.rotate(ang);}
    if(a.lbl){ctx.rotate(-ang);ctx.font='800 13px "Baloo 2",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      const lx=-dx*(sz+14),ly=-dy*(sz+12);ctx.lineWidth=3.5;ctx.strokeText(a.lbl,lx,ly);ctx.fillStyle=a.col;ctx.fillText(a.lbl,lx,ly);}
    ctx.restore();}
}
// power-up orbs: a glowing bubble with an icon (leaf, shield or horseshoe magnet)
function drawPU(u,z){const T=PU[u.k],bob=Math.sin(clock*3+u.ph)*4,r=u.r;ctx.save();ctx.translate(u.x,u.y-10+bob);
  ctx.globalAlpha=.3+.15*Math.sin(clock*5+u.ph);circ(ctx,0,0,r*2,T.col);ctx.globalAlpha=1;
  circ(ctx,0,0,r,'#1d2027');ctx.strokeStyle=T.col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.stroke();
  ctx.fillStyle=T.col;ctx.strokeStyle=T.col;ctx.lineWidth=2.5;ctx.lineCap='round';
  if(u.k==='catnip'){ctx.beginPath();ctx.ellipse(0,0,r*.35,r*.65,.6,0,7);ctx.fill();ctx.strokeStyle='#1d2027';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-r*.3,r*.4);ctx.lineTo(r*.3,-r*.4);ctx.stroke();}
  else if(u.k==='shield'){ctx.beginPath();ctx.moveTo(0,-r*.6);ctx.lineTo(r*.5,-r*.35);ctx.quadraticCurveTo(r*.45,r*.4,0,r*.65);ctx.quadraticCurveTo(-r*.45,r*.4,-r*.5,-r*.35);ctx.closePath();ctx.fill();}
  else{ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-r*.05,r*.4,Math.PI,0);ctx.lineTo(r*.4,r*.45);ctx.moveTo(-r*.4,-r*.05);ctx.lineTo(-r*.4,r*.45);ctx.stroke();ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(-r*.4,r*.3);ctx.lineTo(-r*.4,r*.45);ctx.moveTo(r*.4,r*.3);ctx.lineTo(r*.4,r*.45);ctx.stroke();}
  ctx.restore();}
function drawMini(){
  if(mini.hidden)return;const s=mini.width,h=s/2,k=(h-6)/R0;
  if(state==='finale'){mctx.setTransform(1,0,0,1,0,0);mctx.clearRect(0,0,s,s);mctx.fillStyle='rgba(31,78,107,.6)';mctx.fillRect(0,0,s,s);mctx.fillStyle=king?king.fur.b:'#f4a259';mctx.globalAlpha=.85;mctx.fillRect(0,0,s,s);mctx.globalAlpha=1;return;}
  mctx.setTransform(1,0,0,1,0,0);mctx.clearRect(0,0,s,s);
  mctx.fillStyle='rgba(31,78,107,.6)';mctx.fillRect(0,0,s,s);mctx.fillStyle='rgba(60,62,70,.9)';mctx.fillRect(h-R0*k,h-R0*k,R0*2*k,R0*2*k);
  if(finalOn&&state!=='finale'){mctx.strokeStyle=mode==='clean'?'#ffd23f':PAL.danger;mctx.lineWidth=1.5*DPR;mctx.beginPath();mctx.arc(h,h,arenaR*k,0,7);mctx.stroke();}
  for(const f of foods)if(f.T.big||mode==='clean'){mctx.fillStyle=f.T.glow;mctx.globalAlpha=.8;mctx.beginPath();mctx.arc(h+f.x*k,h+f.y*k,Math.max(1.2*DPR,f.r*k),0,7);mctx.fill();mctx.globalAlpha=1;}
  for(const c of cats){if(!c.alive)continue;
    mctx.fillStyle=c.player?'#ffffff':player.alive?(canEat(player,c)?PAL.edible:canEat(c,player)?PAL.danger:'#e9dcc6'):'#e9dcc6';
    mctx.beginPath();mctx.arc(h+c.x*k,h+c.y*k,Math.max(c.player?3*DPR:1.6*DPR,c.r*k),0,7);mctx.fill();}
  mctx.strokeStyle='rgba(255,255,255,.4)';mctx.lineWidth=DPR;const vw=W/cam.z*k,vh=H/cam.z*k;
  mctx.strokeRect(h+cam.x*k-vw/2,h+cam.y*k-vh/2,vw,vh);
}
// menu backdrop: a slow drift over the city with a few cats wandering
let demo=[],mcam={x:0,y:0};
function menuScene(dt){
  mcam.t=(mcam.t||0)+dt*.03;cam.x=Math.cos(mcam.t)*1400;cam.y=Math.sin(mcam.t*1.3)*1400;const z=phone?.75:.9;cam.z=z;
  const[vl,vt,vw,vh]=worldView(z);drawBackground(z,vl,vt,vw,vh);
  if(!demo.length)for(let i=0;i<12;i++){const c=makeCat(cam.x+rnd(-vw/2,vw/2),cam.y+rnd(-vh/2,vh/2),rnd(14,46),'',false);c.dx=rnd(-1,1);c.dy=rnd(-1,1);demo.push(c);}
  for(const c of demo){c.x+=c.dx*30*dt;c.y+=c.dy*30*dt;
    if(c.x<vl-80)c.x+=vw+150;if(c.x>vl+vw+80)c.x-=vw+150;if(c.y<vt-80)c.y+=vh+150;if(c.y>vt+vh+80)c.y-=vh+150;
    c.look.x=c.dx;c.look.y=c.dy;c.blink-=dt;if(c.blink<-.12)c.blink=rnd(2,6);drawCat(ctx,c,c.x,c.y,c.r);}
}
let last=performance.now();
let paused=false,cdT=0,cdShown=0;
function countdown(dt){cdT-=dt;const n=Math.ceil(cdT);
  if(n!==cdShown&&n>0){cdShown=n;showCount(String(n));tone(520,.14,'triangle',.18);}
  if(cdT<=0){state='play';showCount('Go!');tone(880,.25,'triangle',.2);tone(1320,.3,'triangle',.12,0,.05);
    toast(mode==='clean'?`Clean up ${CL.name}! Clear each area and the job site grows`:mode==='solo'?`Reach size ${SOLO_GOAL}, fast!`:mode==='camp'?`${LV.name}: ${goalText(LV)}!`:`Rivals leave you alone for ${GRACE} seconds`+(nemName?`. Watch out for ${nemName}, your nemesis!`:''));}}
function showCount(t){const e=$('count');e.textContent=t;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');}
function setPause(on){if(on&&state==='menu')return;paused=on;$('pauseOv').hidden=!on;joy.id=null;keys={};
  if(on)$('pauseInfo').textContent=mode==='clean'?`Time ${fmtT(time)} · area ${cleanStage+1} of ${CL.stages.length} · ${cleanLeft()} pieces of junk left`:mode==='solo'?`Time ${fmtT(time)} · size ${Math.round(player.r)} of ${SOLO_GOAL}`:`Size ${Math.round(player.alive?player.r:0)} · ${cats.filter(c=>c.alive).length} cats left`;}
function toMenu(){hideSay();ambient('none');paused=false;$('pauseOv').hidden=true;$('end').hidden=true;buildFurs();setMode(mode);$('menu').hidden=false;state='menu';document.body.classList.remove('playing');['stats','board','mini'].forEach(i=>$(i).hidden=true);}
let errCount=0;
let comboShown='';
let buffShown='';
function buffHud(){let t='';if(player&&player.alive&&player.buff)for(const k in PU)if(player.buff[k]>0)t+=`<span style="--bc:${PU[k].col}">${PU[k].n} ${Math.ceil(player.buff[k])}s</span>`;
  if(t!==buffShown){buffShown=t;$('buffs').innerHTML=t;}}
function comboHud(){const t=combo>=3&&state==='play'&&player&&player.alive?(mode==='clean'?`<b>Streak ${combo}</b> ×${comboMult().toFixed(2)} growth · −${cleanBonus.toFixed(1)}s`:`<b>×${comboMult().toFixed(2)}</b> combo ${combo}`):'';
  if(t!==comboShown){comboShown=t;const e=$('combo');e.innerHTML=t;e.classList.toggle('on',!!t);}
  if(t)$('combo').style.opacity=String(.45+.55*Math.min(1,comboT/(mode==='clean'?STREAK_WINDOW:COMBO_WINDOW)));}
function loop(now){requestAnimationFrame(loop);const rdt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;clock+=rdt;
  shakeA*=Math.exp(-rdt*7);if(shakeA<.2)shakeA=0;
  const dt=slowT>0?rdt*.3:rdt;if(slowT>0)slowT-=rdt;
  try{musicTick(rdt);}catch(e){}
  try{if(state==='menu')menuScene(rdt);else if(!paused){if(state==='count'){countdown(rdt);render();}else{update(dt);render();comboHud();buffHud();tipsTick(rdt);}}}
  catch(e){if(++errCount<4)showErr((e&&e.message)+'\n'+((e&&e.stack)||'').split('\n').slice(0,3).join('\n'));}}

