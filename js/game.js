// Cat Orbs: Conquerors of Cat Earth - match flow, rules, AI and the per-frame update
// ---------- game flow ----------
function start(){
  if(mode==='camp'&&LEVELS[camp.sel]&&LEVELS[camp.sel].alien&&campUnl(camp.sel)&&!camp.sawIntro){camp.sawIntro=1;saveCamp();showStory(ARENA_STORY(),start);return;}
  if(mode==='clean'&&!clean.sawIntro){clean.sawIntro=1;saveClean();showStory(CREW_STORY,start);return;}
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  if(mode==='camp')LV=LEVELS[campUnl(camp.sel)?camp.sel:0];if(mode==='clean')CL=CLEAN_LEVELS[cleanUnl(clean.sel)?clean.sel:0];setTheme(mapFor(mode));cleanStage=0;setIsland(mode==='clean'?CL.stages[0].k:6);
  setupWeather();
  ufo=null;aliveN=(mode==='solo'||mode==='clean'?0:mode==='camp'?LV.rivals:AI_COUNT)+1;cats=[];eaten=[];foodEaten=[];parts=[];floats=[];time=0;arenaR=R0*1.42;finalOn=false;king=null;setCity(mode==='solo'?dailySeed():mode==='camp'?LV.seed:mode==='clean'?CL.seed:(Math.random()*4294967295)>>>0);buildProps();finT=0;endShown=false;recorded=false;myCats=0;myTreats=0;MILESTONES.forEach(m=>m.done=false);
  wasUnl=FUR.map(isUnl);
  RNG=mode==='solo'?seeded(dailySeed()):Math.random; // same start for everyone on the same day
  if(mode==='clean'){foods=[];placeJunk(0);cleanBonus=0;cleanBest=0;for(const p of props)if(p.k==='bldg')p.out=1;} // a small island full of junk; buildings aren't part of the job
  else{foods=[];for(const T of FOODT.slice().reverse())for(let i=0;i<T.n;i++)foods.push(placeFood(T));}
  const nm=($('nameIn').value.trim()||'You').slice(0,14);
  const pf=isUnl(FUR[prog.pick]||FUR[0])?FUR[prog.pick]:FUR[0];
  // every cat (you included) starts the same size at evenly spread spots across the city
  const spots=[];
  const nAI=mode==='solo'||mode==='clean'?0:mode==='camp'?LV.rivals:AI_COUNT;
  // evenly spaced grid over the whole island (7x7 for 46 cats, ~830 apart), lightly jittered
  const G=Math.ceil(Math.sqrt(nAI+1));
  if(G<=1)spots.push({x:rnd(-R0*.5,R0*.5),y:rnd(-R0*.5,R0*.5)});
  else{const lo=-R0+SPAWN_EDGE,step=(R0-SPAWN_EDGE)*2/(G-1);
    for(let gx=0;gx<G;gx++)for(let gy=0;gy<G;gy++)spots.push({x:lo+gx*step+rnd(-step*.12,step*.12),y:lo+gy*step+rnd(-step*.12,step*.12)});
    spots.sort(()=>RNG()-.5);spots.length=nAI+1;}
  const ps=spots.pop();RNG=Math.random;if(mode==='clean'){ps.x=0;ps.y=0;}
  player=makeCat(ps.x,ps.y,START_R,nm,true,pf);player.charges=DASH_MAX;player.chargeT=0;cats.push(player);
  const names=NAMES.slice().sort(()=>Math.random()-.5);
  spots.forEach((p,i)=>{const c=makeCat(p.x,p.y,START_R,names[i%names.length],false);c.pers=PERS[i%PERS.length];c.buff={};cats.push(c);});
  if(mode==='camp')campRegulars(cats,LV.champs?1+CHAMPS.length:1);
  if(mode==='camp'&&LV.champs)CHAMPS.forEach((n,i)=>{const c=cats[i+1];if(!c)return;c.name=n;c.t=c.r=START_R*1.5;c.pers='hunter';c.champ=1;});
  player.buff={};stats=newStats();powerups=[];puT=2;
  if(mode==='camp')nemName=NEMESIS;else if(mode!=='solo'&&cats.length>2){const pool=cats.filter(c=>!c.player&&!c.champ),nem=pool[Math.floor(Math.random()*pool.length)];nem.pers='nemesis';nemName=nem.name;}else nemName='';
  cam={x:player.x,y:player.y,z:1};state='count';cdT=COUNTDOWN;cdShown=0;document.body.classList.add('playing');
  $('menu').hidden=true;$('end').hidden=true;['stats','board','mini'].forEach(i=>$(i).hidden=false);
  $('board').hidden=mode==='solo'||mode==='clean';$('pbar').hidden=!(mode==='solo'||mode==='clean'||mode==='camp'&&LV.goal.type==='size');$('leftLbl').textContent=mode==='clean'?'Junk left':mode==='solo'||mode==='camp'&&LV.goal.type!=='win'?'Goal':'Cats left';
  joy.id=null;if(!phone&&'ontouchstart' in window)$('dash').style.display='block';
  hud(cats);
  if(mode==='camp')setTimeout(()=>{if(state==='count'||state==='play')say(NEMESIS,TAUNTS[LEVELS.indexOf(LV)],FUR[REGULARS[0].fur],6.5);},350);else hideSay();
}
function toast(t){const el=$('toast');el.textContent=t;el.style.opacity=1;toastT=2.2;}
// Movement feel. Speed through the city grows with size so that, with the camera zooming out,
// a big cat still seems to glide at about the same pace on screen. Small cats keep their edge
// through agility: they accelerate and turn much faster.
const SPEED_BASE=250,SPEED_GROW=0,SPEED_CAP_R=600;
const ZOOM_OUT=.4; // how strongly the camera pulls back as you grow (was .55)
let nemName='';
const speedOf=c=>SPEED_BASE*Math.pow(Math.min(c.r,SPEED_CAP_R)/22,SPEED_GROW)*(c.dash>0?2.1:1)*(c.buff&&c.buff.catnip>0?1.6:1);
const shielded=c=>c.buff&&c.buff.shield>0;
const agilityOf=c=>12*Math.sqrt(22/c.r);
// Pull-in: from this size, nearby crumbs (items much smaller than you) drift into you
const ITEM_GROWTH=.55; // how much treats and city objects grow a cat (cats absorbed count in full)
const PLAYER_PULL=45; // extra reach (in city units) that tugs small items into the player's cat
const MAGNET_R=70,MAGNET_RANGE=1.4,MAGNET_SMALL=.35;
const canEat=(a,b)=>a.r>b.r*EAT;
const dashNeed=c=>DASH_RECHARGE*(1-.4*Math.min(1,c.r/300)); // big cats recharge faster
function tryDash(c){if(!c.alive||c.cd>0)return;const g=Math.min(1,c.r/300);
  let pw=1;
  if(c.player){if(!(c.charges>0))return;c.charges--;c.cd=DASH_GAP;snd.dash();dashed=true;
    c.chain=time-(c.lastDash??-9)<DASH_CHAIN?(c.chain||0)+1:0;pw=DASH_WEAK[Math.min(c.chain,DASH_WEAK.length-1)];c.lastDash=time;c.holdT=DASH_HOLD;
    if(c.chain)floats.push({x:c.x,y:c.y-c.r,t:.8,txt:'winded',col:'#ffc98a'});
    let th=null,td=1e9;for(const o of cats)if(o.alive&&!o.player&&canEat(o,c)){const d=Math.hypot(o.x-c.x,o.y-c.y)-o.r-c.r;if(d<td){td=d;th=o;}}c.dashThreat=td<70?th:null;}
  else c.cd=3.5*(1-.5*g);
  c.dash=.35*(1+g)*pw;c.wasDashing=true;} // big cats dash longer
function dashRefund(c,amt,txt){if(!c.player||c.charges>=DASH_MAX)return;const need=dashNeed(c);c.chargeT+=need*amt;
  while(c.chargeT>=need&&c.charges<DASH_MAX){c.charges++;c.chargeT-=need;}if(c.charges>=DASH_MAX)c.chargeT=0;
  floats.push({x:c.x,y:c.y-c.r*1.3,t:1.2,txt,col:'#fff4b0'});tone(880,.08,'triangle',.08,1320);tip('dashwise','Smart dashing pays: pounce on prey or escape a close call to get dash charge back. Spamming leaves you winded.');}

// Campaign: the goal is met. Every rival left is sucked into your mouth, then you swallow the city.
// Alien Arena ending: you fill the arena, the invader swoops in, and you eat it, ship and all
let ufo=null;
function alienFinale(dt){const k=king;
  if(finT<FIN_CITY){ufo=null;return;}
  if(!ufo){ufo={x:k.x+k.r*1.7,y:k.y-k.r*1.95,r:k.r*.45,eaten:false};toast('The alien invader swoops in to claim Cat Earth!');snd.warn();}
  if(!ufo.eaten){const q=Math.min(1,(finT-FIN_CITY)/1.6),e=q*q*(3-2*q);ufo.x=k.x+k.r*(1.7-.7*e);ufo.y=k.y-k.r*(1.95-.75*e);ufo.r=k.r*.45;
    if(finT>FIN_CITY+1.9){ufo.eaten=true;propEaten.push({p:{k:'ufo',x:ufo.x,y:ufo.y,r:ufo.r},by:k,k:0,spin:1,r:ufo.r});k.gulp=.6;k.pulse=.3;kick(14);snd.crunch(200);snd.slurp(200);
      toast('You ate the alien invader and its ship!');}}
  else if(!ufo.said&&finT>FIN_CITY+4.8){ufo.said=1;toast('Cat Earth is safe!');}}
// once the winner is full, eating (and its sounds) stops: after swallowing Cat Earth, or in the campaign
// once the city is filled (in the Alien Arena, once the invader's ship has been eaten)
function doneEating(){if(state!=='finale'||!king)return false;if(king.earthDone)return true;
  if(mode==='clean')return finT>.3; // job done: stop eating, then one satisfied burp
  if(mode==='camp')return LV.alien&&king.player?!!(ufo&&ufo.eaten&&finT>FIN_CITY+2.6):finT>FIN_CITY;return false;}
// The winner is full: it closes its mouth, shuts its eyes contentedly, then lets out one quick burp before the results
function burpTick(dt){const k=king;if(!k||!k.player||!doneEating())return;
  if(!k.burped){if(!k.fullT)k.content=2.6;k.fullT=(k.fullT||0)+dt;
    if(k.fullT>.8){k.burped=1;k.burpT=.42;snd.burp();kick(4);floats.push({x:k.x+k.r*(mouthX(k)+.62),y:k.y+k.r*.42,t:1.5,txt:'*burp*',col:'#fff4b0'});}}
  else if(k.burpT>-2)k.burpT-=dt;}
const burpDone=()=>!king||!king.player||!!king.burped&&king.burpT<=-.6;
function campWin(){king=player;finT=0;state='finale';snd.win();stats.survived=time;if(!stats.frozen)stats.frozen=Object.assign({},stats);
  const rank=1+cats.filter(c=>c.alive&&!c.player&&c.r>player.r).length;record(rank,false);
  camp.res[LEVELS.indexOf(LV)]=campPlaces();saveCamp();
  for(const c of cats)if(c.alive&&!c.player){c.alive=false;c.campEaten=1;eaten.push({c,by:player,k:-Math.random()*.5,x:c.x,y:c.y,r:c.r});}
  king.camp=campComplete(time);toast(`${LV.name} conquered!`);}
function showCampEnd(){const t=stats.survived||time,r=king.camp||{st:0},i=LEVELS.indexOf(LV),nx=LEVELS[i+1],won=king.player;
  if(!won){showEnd(`${king.name} wins`,`${king.name} conquered ${LV.name}. Try again!`,false);return;}
  const how=LV.goal.type==='size'?`reached size ${LV.goal.n}`:LV.goal.type==='cats'?`absorbed ${LV.goal.n} cats`:`outlasted every rival`;
  if(LV.alien){camp.galaxy=1;saveCamp();showEnd('Cat Earth is saved!',`${starStr(r.st)}  You won the Alien Arena in ${fmtT(t)}`+(r.isBest?' (a new best)':'')+`, then ate the alien invader and its ship. Cat Earth is safe… but the alien's distress signal has reached the stars. The Intergalactic Circuit awaits!`+(r.st<3?` Three stars under ${fmtT(LV.t3)}.`:''),false);$('againBtn').textContent='Replay';return;}
  showEnd(LV.earth?'You conquered Cat Earth!':`${LV.name} conquered!`,
    `${starStr(r.st)}  You ${how} in ${fmtT(t)}`+(r.isBest?' (a new best)':'')+(LV.earth?', then swallowed the whole planet. Every continent is yours.':`, then swallowed the city.`)
    +(r.st<3?` Three stars under ${fmtT(LV.t3)}.`:'')+` Among the regulars you placed #${(camp.res[i]||[]).indexOf('You')+1} of 10.`+(r.newUnlock?(r.newUnlock.alien?' But as you finish, a strange green light appears in the sky…':` ${r.newUnlock.name} is now unlocked!`):''),false);
  if(nx&&campUnl(i+1)){const b=$('nextBtn');b.hidden=false;b.textContent=`Next: ${nx.name}`;}
  $('againBtn').textContent='Replay';}
function record(place,won){
  if(recorded)return;recorded=true;
  prog.games++;prog.cats+=myCats;prog.treats+=myTreats;prog.best=Math.min(prog.best,place);if(won)prog.wins++;saveProg();
  const nu=FUR.filter((f,i)=>!wasUnl[i]&&isUnl(f)).map(f=>f.n);
  $('unl').textContent=nu.length?`New color${nu.length>1?'s':''} unlocked: ${nu.join(', ')}!`:'';
}
function statsHtml(){if(!stats||mode==='solo')return'';const s=stats.frozen||stats,t=s.survived||time;
  const rows=[['Peak size',Math.round(s.peak)],['Cats absorbed',s.cats],['Things eaten',s.items],['Buildings',s.bldg],['Cars & vans',s.cars],['Trees & bushes',s.trees],['Pigeons & mice',s.critters],['Best combo',s.combo],['Power-ups',s.pu],[mode==='camp'||mode==='clean'?'Time':'Time survived',fmt(t)]];
  return rows.filter(([k])=>mode!=='clean'||k!=='Cats absorbed'&&k!=='Power-ups'&&k!=='Buildings').map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('');}
function showEnd(title,text,watch){hideSay();$('nextBtn').hidden=true;$('againBtn').textContent=mode==='camp'?'Try again':'Play again';$('endStats').innerHTML=statsHtml();$('endTitle').textContent=title;$('endText').textContent=text;$('watchBtn').hidden=!watch;$('medal').hidden=true;$('copyBtn').hidden=true;$('copyBtn').textContent='Copy result';$('end').hidden=false;}
function resultText(){const md=king&&king.medal;const url=/^https?:/.test(location.protocol)&&!/claude\.ai/.test(location.host)?'\n'+location.href:'';
  return`Cat Orbs · Grow Rush · ${dayLabel()} city\nReached size ${SOLO_GOAL} in ${fmtT(king.soloT)}${md?` (${md} medal)`:''}\nCan you beat it?${url}`;}
async function copyResult(btn){const t=resultText();let ok=false;
  try{await navigator.clipboard.writeText(t);ok=true;}catch(e){
    try{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();ok=document.execCommand('copy');ta.remove();}catch(e2){}}
  btn.textContent=ok?'Copied!':'Copy failed';if(!ok)$('endText').textContent+='\n\n'+t;}

let aliveN=46;
function think(c){
  const Dd=D(),P=c.pers,vis=aliveN<=10?5000:(380+c.r*4)*Dd.vis*(P==='hunter'?1.15:1); /* late game: hunters sense prey anywhere */let fx=0,fy=0,threat=0,best=null,bs=0,closeThreat=1e9;
  for(const o of cats){if(o===c||!o.alive)continue;
    const dx=o.x-c.x,dy=o.y-c.y,d=Math.hypot(dx,dy)||1,edge=d-o.r-c.r;if(edge>(P==='nemesis'&&o.player?vis*2.5:vis))continue;
    if(canEat(o,c)&&!shielded(c)){const w=(P==='coward'?1.8:1)/(Math.max(edge,1)+40);fx-=dx/d*w;fy-=dy/d*w;threat+=w;closeThreat=Math.min(closeThreat,edge);}
    else if(canEat(c,o)){if((o.player&&time<GRACE)||shielded(o))continue;const s=(o.r*o.r)/(Math.max(edge,1)+90)*(o.player?1.3*Dd.chase*(P==='nemesis'?4:1):1)*(P==='hunter'?1.6:P==='forager'?.6:1);if(s>bs){bs=s;best=o;}}}
  // treats compete with prey: a big edible treat can be worth more than a far-off cat
  const fv=280+c.r*3;let bf=null,fs=0;
  for(const f of foods){const ex=f.x-c.x,ey=f.y-c.y;if(Math.abs(ex)>fv||Math.abs(ey)>fv||!canEatF(c,f))continue;
    const s=f.v*f.v/(Math.hypot(ex,ey)+30);if(s>fs){fs=s;bf=f;}}
  eachProp(c.x-fv,c.y-fv,c.x+fv,c.y+fv,p=>{if(p.out||c.r<=p.r*EAT)return;const s=p.v*p.v/(Math.hypot(p.x-c.x,p.y-c.y)+30);if(s>fs){fs=s;bf=p;}});
  if(P==='forager')fs*=1.8;
  for(const u of powerups){if(!u.alive)continue;const d=Math.hypot(u.x-c.x,u.y-c.y);if(d<fv){const s=1600/(d+30);if(s>fs){fs=s;bf=u;}}}
  let tgt=best;if(bf&&(!best||fs*2.2>bs))tgt=bf;
  let dx=0,dy=0;
  if(threat>0){const m=Math.hypot(fx,fy)||1;dx=fx/m*1.4;dy=fy/m*1.4;}
  if(tgt){const tx=tgt.x-c.x,ty=tgt.y-c.y,m=Math.hypot(tx,ty)||1,w=threat>0?.6:1;dx+=tx/m*w;dy+=ty/m*w;
    if(tgt===best&&threat===0&&m-best.r-c.r<90&&Math.random()<.25*Dd.dash)tryDash(c);}
  if(threat>0&&closeThreat<(P==='coward'?130:70)&&Math.random()<Math.min(1,Dd.dash))tryDash(c);
  if(!tgt&&threat===0){
    if(c.wt<=0||Math.hypot(c.wx-c.x,c.wy-c.y)<60){const p=randPoint(200);c.wx=p.x;c.wy=p.y;c.wt=rnd(3,7);}
    const tx=c.wx-c.x,ty=c.wy-c.y,m=Math.hypot(tx,ty)||1;dx=tx/m*.6;dy=ty/m*.6;}
  const edge=R0-Math.min(c.r,160)-160;
  if(c.x>edge)dx-=Math.min(2,(c.x-edge)/120);if(c.x<-edge)dx+=Math.min(2,(-edge-c.x)/120);
  if(c.y>edge)dy-=Math.min(2,(c.y-edge)/120);if(c.y<-edge)dy+=Math.min(2,(-edge-c.y)/120);
  const dc=Math.hypot(c.x,c.y);
  if(finalOn&&dc>arenaR-c.r-160&&dc>1){const k=Math.min(2,(dc-(arenaR-c.r-160))/120);dx-=c.x/dc*k;dy-=c.y/dc*k;}
  const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}c.dx=dx;c.dy=dy;
}
function playerInput(c){
  let kx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),ky=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  if(kx||ky){const m=Math.hypot(kx,ky);c.dx=kx/m;c.dy=ky/m;mouse.active=false;return;}
  if(phone){
    if(joy.id!==null){const jx=joy.x-joy.ox,jy=joy.y-joy.oy,l=Math.hypot(jx,jy);
      if(l<8)return; // thumb just resting: keep the current heading
      const mag=Math.min(1,l/55);c.dx=jx/l*mag;c.dy=jy/l*mag;c.hx=jx/l;c.hy=jy/l;c.stopped=false;joy.moved=true;return;}
    // thumb lifted: cruise in the last direction at full speed (a quick tap stops)
    if(c.hx!==undefined&&!c.stopped){c.dx=c.hx;c.dy=c.hy;}else{c.dx*=.85;c.dy*=.85;}
    return;}
  if(SET.pc==='keys'||!mouse.active){c.dx*=.9;c.dy*=.9;return;} // keyboard mode: no keys held = gentle stop; the mouse doesn't steer
  const dx=mouse.x-W/2,dy=mouse.y-H/2,l=Math.hypot(dx,dy);if(l<4){c.dx=c.dy=0;return;}
  const mag=Math.min(1,l/90);c.dx=dx/l*mag;c.dy=dy/l*mag;
}
function burst(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*7,s=rnd(60,220);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.4,.8),col,r:rnd(2,5)});}}
function absorb(a,b){a.gulp=.5;b.deadT=time;
  if(mode==='camp'&&(a.player&&b.nem||b.player&&a.nem)){if(a.player){camp.h2h.you++;toast(`You swallowed ${NEMESIS}! Head to head: you ${camp.h2h.you}, her ${camp.h2h.her}`);}else camp.h2h.her++;saveCamp();}if(a.player)snd.slurp(b.r);
  if(a.player){comboHit();kick(10);slowmo(.4);if(a.dash>0)dashRefund(a,1,'Pounce! +1 dash');}if(b.player){kick(16);slowmo(.6);}
  b.alive=false;a.t=Math.sqrt(a.t*a.t+b.t*b.t*(a.player?1.15*comboMult():1));a.pulse=.35;
  eaten.push({c:b,by:a,k:0,x:b.x,y:b.y,r:b.r});burst(b.x,b.y,b.fur.b,12);
  if(a.player)snd.meow(false);else if(!b.player&&player.alive&&Math.hypot(a.x-player.x,a.y-player.y)<700/cam.z)snd.meow(true);
  if(a.player){myCats++;stats.cats++;floats.push({x:b.x,y:b.y-b.r,t:1,txt:'+'+Math.round(b.r)});}
  if(b.player){stats.survived=time;stats.frozen=Object.assign({},stats);snd.lose();state='dead';const place=cats.filter(c=>c.alive).length+1;record(place,false);
    showEnd('Absorbed!',`${a.name} swallowed you whole. You finished #${place} of ${cats.length}, at size ${Math.round(b.t)}.`,true);}
}

function update(dt){
  if(comboT>0){comboT-=dt;if(comboT<=0)combo=0;}
  time+=dt;
  for(const c of cats){if(!c.alive)continue;
    c.dash=Math.max(0,c.dash-dt);c.cd=Math.max(0,c.cd-dt);
    if(c.player&&c.wasDashing&&c.dash<=0){c.wasDashing=false;const t=c.dashThreat;c.dashThreat=null; // close call: you dashed clear of a cat that was about to eat you
      if(t&&t.alive&&c.alive&&Math.hypot(t.x-c.x,t.y-c.y)-t.r-c.r>200)dashRefund(c,.5,'Close call! +½ dash');}
    if(c.player&&c.holdT>0)c.holdT-=dt;
    else if(c.player&&c.charges<DASH_MAX){c.chargeT+=dt;const need=dashNeed(c);if(c.chargeT>=need){c.charges++;c.chargeT=c.charges<DASH_MAX?c.chargeT-need:0;tone(760,.06,'triangle',.06,980);}}c.wt-=dt;if(c.content>0){c.content-=dt;c.blink=-.05;}else{c.blink-=dt;if(c.blink<-.12)c.blink=rnd(2,6);}
    if(c.player&&c===player&&state!=='dead')playerInput(c);
    else if(!c.player){c.think-=dt;if(c.think<=0){c.think=D().think;think(c);}}
    if(c.buff)for(const k in c.buff)c.buff[k]-=dt;
    const sp=speedOf(c),ag=agilityOf(c),ax=Math.min(1,dt*(c.dash>0?Math.max(10,ag):ag));
    c.vx+=(c.dx*sp-c.vx)*ax;c.vy+=(c.dy*sp-c.vy)*ax;c.x+=c.vx*dt;c.y+=c.vy*dt;
    c.r+=(c.t-c.r)*Math.min(1,dt*8);if(c.pulse>0)c.pulse-=dt;
    const lm=Math.hypot(c.vx,c.vy)||1,lk=Math.min(1,lm/sp);c.look.x+=(c.vx/lm*lk-c.look.x)*.15;c.look.y+=(c.vy/lm*lk-c.look.y)*.15;
    const sq=R0-Math.min(c.r,160); /* big cats can reach the edges and corners */c.x=Math.max(-sq,Math.min(sq,c.x));c.y=Math.max(-sq,Math.min(sq,c.y));
    if(finalOn){const d=Math.hypot(c.x,c.y),lim=Math.max(0,arenaR-c.r);if(d>lim&&d>0){c.x=c.x/d*lim;c.y=c.y/d*lim;}}}
  const live=cats.filter(c=>c.alive).sort((a,b)=>b.r-a.r);
  for(let i=0;i<live.length;i++){const a=live[i];if(!a.alive)continue;
    for(let j=i+1;j<live.length;j++){const b=live[j];if(!b.alive||!canEat(a,b)||(b.player&&time<GRACE)||shielded(b))continue;
      if(Math.hypot(a.x-b.x,a.y-b.y)<a.r-b.r*.3)absorb(a,b);}}
  // once the winner has swallowed Cat Earth, the feast is over: no more eating, pulling, sounds or new food
  const fed=doneEating();
  for(const c of live){const mg=c.buff&&c.buff.magnet>0;if(fed||!c.alive||(c.r<MAGNET_R&&!c.player&&!mg))continue;
    const pm=c.player&&c.r<MAGNET_R*2, /* player assist: a small pull-in from the start */
      vac=mode==='clean'&&c.player, /* Clean-up Crew: a generous vacuum */
      PR=vac?Math.max(c.r*2,c.r+110):mg?c.r*2.6+80:pm?Math.max(c.r*MAGNET_RANGE,c.r+PLAYER_PULL):c.r*MAGNET_RANGE,pull=(vac?280+c.r:mg?300+c.r:pm?220:120+c.r*.8)*dt,lim=vac?.8:mg?.65:pm?.6:MAGNET_SMALL;
    const tug=o=>{if(o.out||c.r<=o.r*EAT||o.r>c.r*lim)return;const dx=c.x-o.x,dy=c.y-o.y;if(Math.abs(dx)>PR||Math.abs(dy)>PR)return;
      const d=Math.hypot(dx,dy);if(d>PR||d<1)return;const st=Math.min(d,pull*(1.25-d/PR));o.x+=dx/d*st;o.y+=dy/d*st;};
    for(const f of foods)tug(f);
    if(mode!=='clean')eachProp(c.x-PR-CELL,c.y-PR-CELL,c.x+PR+CELL,c.y+PR+CELL,p=>{if(p.k!=='bldg')tug(p);});}
  for(let i=fed?-1:foods.length-1;i>=0;i--){const f=foods[i];
    if(finalOn&&Math.hypot(f.x,f.y)>arenaR+f.r){foods.splice(i,1);continue;}
    for(const c of live){if(!c.alive)continue;const dx=f.x-c.x,dy=f.y-c.y,reach=c.r+f.r;
      if(Math.abs(dx)>reach||Math.abs(dy)>reach||!canEatF(c,f))continue;
      if(Math.hypot(dx,dy)<(f.r<14?c.r+f.r*.3:c.r-f.r*.4)){
        if(c.player)comboHit();c.t=Math.sqrt(c.t*c.t+f.v*f.v*ITEM_GROWTH*(c.player?PLAYER_BONUS*comboMult():D().grow));c.pulse=.25;c.gulp=.35;foods.splice(i,1);foodEaten.push({p:f,by:c,k:0,spin:Math.random()<.5?1:-1});if(c.player&&f.r>=46)kick(Math.min(9,2+f.r*.04));if(c.player&&c.dash>0&&f.r>=BIG_CATCH)dashRefund(c,.5,'Big catch! +½ dash');
        if(f.T.big)burst(f.x,f.y,f.T.glow,10);
        if(c.player&&mode==='clean')junkEaten(f);
        if(c.player){myTreats++;stats.items++;if(f.T.big){snd.crunch(f.r);snd.slurp(f.r);}else{snd.pick(f.r);if(f.r>=11)snd.slurp(f.r);}floats.push({x:f.x,y:f.y-f.r,t:f.T.big?1:.6,txt:f.T.big?'+'+Math.round(f.v/2):'+'});}
        break;}}}
  for(const c of live){if(fed||!c.alive)continue;
    const qr=(c.r>=MAGNET_R||c.player)?c.r*MAGNET_RANGE+PLAYER_PULL+CELL:c.r;
    eachProp(c.x-qr,c.y-qr,c.x+qr,c.y+qr,p=>{if(p.out||c.r<=p.r*EAT)return;
      if(Math.hypot(p.x-c.x,p.y-c.y)<(p.r<14?c.r+p.r*.3:c.r-p.r*.4)){p.alive=false;
        if(c.player)comboHit();c.t=Math.sqrt(c.t*c.t+p.v*p.v*ITEM_GROWTH*(c.player?PLAYER_BONUS*comboMult():D().grow));c.pulse=.25;c.gulp=.35;propEaten.push({p,by:c,k:0,spin:Math.random()<.5?1:-1});if(c.player&&p.r>=30)kick(Math.min(12,3+p.r*.04));if(c.player&&c.dash>0&&p.r>=BIG_CATCH)dashRefund(c,.5,'Big catch! +½ dash');
        if(p.r>=14)burst(p.x,p.y,p.k==='bldg'?p.col:p.k==='tree'?'#4f9a58':p.k==='car'?p.col:'#9a8f7e',p.r>60?16:8);
        if(c.player){myTreats++;stats.items++;if(p.k==='bldg')stats.bldg++;else if(p.k==='car'||p.k==='veh')stats.cars++;else if(p.k==='tree'||p.k==='bush')stats.trees++;
          if(p.r>=14){snd.crunch(p.r);snd.slurp(p.r);}else{snd.pick(p.r);if(p.r>=9)snd.slurp(p.r);}floats.push({x:p.x,y:p.y-p.r,t:p.r>=14?1:.6,txt:p.r>=14?'+'+Math.round(p.v/2):'+'});}}});}
  // power-ups: keep a few around the island; touching one grants it
  if(mode!=='solo'&&mode!=='clean'&&SET.pu&&state==='play'){puT-=dt;if(puT<=0&&powerups.filter(u=>u.alive).length<PU_MAX){puT=PU_EVERY;const ks=Object.keys(PU),p=randPoint(200);powerups.push({k:ks[Math.floor(Math.random()*ks.length)],x:p.x,y:p.y,r:14,v:0,alive:true,ph:Math.random()*7});}
    for(const u of powerups){if(!u.alive)continue;for(const c of live){if(!c.alive)continue;if(Math.hypot(u.x-c.x,u.y-c.y)<c.r+u.r){u.alive=false;c.buff[u.k]=PU[u.k].t;
      if(c.player){stats.pu++;snd.level();toast(`${PU[u.k].n}! ${u.k==='catnip'?'Zoom zoom':u.k==='shield'?"Nothing can eat you":'Everything small flies to you'} for ${PU[u.k].t}s`);}break;}}}
    powerups=powerups.filter(u=>u.alive);}
  if(player.alive&&stats)stats.peak=Math.max(stats.peak,player.r);
  // pigeons and mice: anyone who touches them eats them
  if(!fed)updateCritters(dt);
  for(const m of critters){if(fed||!m.alive)continue;for(const c of live){if(!c.alive||c.r<=m.r*EAT)continue;
    if(Math.hypot(m.x-c.x,m.y-c.y)<c.r+m.r*.3+(c.player?PLAYER_PULL*.35:0)){m.alive=false;c.t=Math.sqrt(c.t*c.t+m.v*m.v*ITEM_GROWTH*(c.player?PLAYER_BONUS*comboMult():1));c.gulp=.35;
      propEaten.push({p:{k:'critter',c:m,x:m.x,y:m.y},by:c,k:0,spin:1});
      if(c.player){comboHit();myTreats++;stats.critters++;stats.items++;snd.pick(4);snd.squeak();floats.push({x:m.x,y:m.y-8,t:.6,txt:'+'});}break;}}}
  propEaten=flyTick(propEaten,dt,.5);
  foodEaten=flyTick(foodEaten,dt,.42);
  // mouths: open while gulping; yours also opens in anticipation when something edible is within reach
  for(const c of live){if(!c.alive)continue;c.gulp=fed?0:(c.gulp||0)-dt;let tgt=c.gulp>0?1:0;
    if(fed)tgt=c.burpT>0?.62:0; // a full winner keeps its mouth shut… except for one quick burp
    else if(c.player&&tgt<1&&(c.nearT=(c.nearT||0)+1)%3!==0)tgt=c.nearPrev||0;
    else if(c.player&&tgt<1){const R=c.r+Math.max(28,c.r*.5);let near=false;
      for(const f of foods){if(Math.abs(f.x-c.x)<R&&Math.abs(f.y-c.y)<R&&canEatF(c,f)&&Math.hypot(f.x-c.x,f.y-c.y)<R){near=true;break;}}
      if(!near)eachProp(c.x-R,c.y-R,c.x+R,c.y+R,p=>{if(!near&&!p.out&&c.r>p.r*EAT&&Math.hypot(p.x-c.x,p.y-c.y)<R+p.r*.3)near=true;});
      if(!near)for(const o of cats)if(o.alive&&o!==c&&canEat(c,o)&&Math.hypot(o.x-c.x,o.y-c.y)<R+o.r){near=true;break;}
      if(near)tgt=.7;c.nearPrev=tgt;}
    c.mo=(c.mo||0)+(tgt-(c.mo||0))*Math.min(1,dt*14);}
  if(player.alive)for(const m of MILESTONES)if(!m.done&&player.r>m.need){m.done=true;toast(`You can eat ${m.name} now!`);snd.level();}
  const cnt=new Map();for(const f of foods)cnt.set(f.T,(cnt.get(f.T)||0)+1);
  const af=finalOn?Math.min(1,Math.PI*arenaR*arenaR/(4*R0*R0)):1;
  if(mode==='clean'&&state==='play')junkTick(dt);
  if(!fed&&mode!=='clean')for(const T of FOODT){const want=Math.round(T.n*af);let have=cnt.get(T)||0;
    let k=Math.floor(T.rate*dt+Math.random());while(k-->0&&have<want){foods.push(placeFood(T));have++;}}
  eaten=flyTick(eaten,dt,.45);
  for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.92;p.vy*=.92;p.life-=dt;}parts=parts.filter(p=>p.life>0);
  for(const f of floats){f.t-=dt;f.y-=40*dt;}floats=floats.filter(f=>f.t>0);
  const alive=live.filter(c=>c.alive);aliveN=alive.length;
  // final circle: once only a few cats are left, the edge slowly closes to bring them together
  if(mode!=='solo'&&!finalOn&&state!=='finale'&&alive.length<=FINAL_N&&alive.length>1){finalOn=true;toast(`Final ${alive.length}! The circle is closing in`);snd.warn();}
  if(mode==='camp'&&LV.arena&&!finalOn&&state==='play'&&time>=GRACE){finalOn=true;toast('The arena is closing in!');snd.warn();}
  if(finalOn&&state!=='finale'&&mode!=='clean'){const target=FINAL_MIN,sp=mode==='camp'&&LV.arena&&alive.length>FINAL_N?ARENA_SPEED:FINAL_SPEED;
    if(arenaR>target)arenaR=Math.max(target,arenaR-sp*dt);}
  // campaign goals: reaching a size or absorbing enough cats conquers the continent
  if(mode==='camp'&&!king&&state==='play'&&player.alive&&(LV.goal.type==='size'&&player.r>=LV.goal.n||LV.goal.type==='cats'&&myCats>=LV.goal.n))campWin();
  if(mode==='clean'&&!king&&state==='play'&&player.alive&&!foods.length){if(cleanStage<CL.stages.length-1)expandSite();else cleanWin();} // done only when every area is spotless
  // last cat standing: start the finale, where the king swells to fill the city
  if(mode==='solo'&&!king&&player.r>=SOLO_GOAL){king=player;finT=0;state='finale';snd.win();
    const t=time,isBest=!soloBest||t<soloBest,isDay=!dayBest||t<dayBest;
    try{if(isBest)localStorage.setItem('catorb-solobest',String(t));if(isDay)localStorage.setItem(dayKey(),String(t));}catch(e){}
    if(isBest)soloBest=t;if(isDay)dayBest=t;
    const md=medalFor(t);king.medal=md;king.soloT=t;
    king.soloText=`You reached size ${SOLO_GOAL} in ${fmtT(t)} on today's city.`+(isBest?' A new all-time best!':isDay?` A new best for today. All-time best ${fmtT(soloBest)}.`:` Today's best ${fmtT(dayBest)} · all-time ${fmtT(soloBest)}.`)
      +(md?'':` Bronze is ${fmtT(BRONZE_T)}.`);
    if(!recorded){recorded=true;prog.games++;prog.treats+=myTreats;saveProg();const nu=FUR.filter((f,i)=>!wasUnl[i]&&isUnl(f)).map(f=>f.n);$('unl').textContent=nu.length?`New color${nu.length>1?'s':''} unlocked: ${nu.join(', ')}!`:'';}
    toast(md?`${md[0].toUpperCase()+md.slice(1)} medal!`:isBest?'New best time!':'Max size!');}
  if(mode!=='solo'&&mode!=='clean'&&alive.length===1&&!king){king=alive[0];finT=0;
    if(king.player){stats.survived=time;record(1,true);if(mode==='camp'){camp.res[LEVELS.indexOf(LV)]=campPlaces();king.camp=campComplete(time);}}
    if(!stats.frozen)stats.frozen=Object.assign({},stats); // the match is decided: the finale doesn't count
    state='finale';if(king.player)snd.win();toast(king.player?'You are King of the Hill!':`${king.name} is King of the Hill`);}
  if(state==='finale'){finT+=dt;burpTick(dt);
    arenaR+=(R0*1.42-arenaR)*Math.min(1,dt*1.2);
    const alienEnd=mode==='camp'&&LV.alien&&king.player,noEarth=mode==='clean'||mode==='camp'&&!LV.earth;
    if(alienEnd)alienFinale(dt);
    if(mode==='clean'){}else if(finT<FIN_CITY||noEarth)king.t+=(R0*1.45-king.t)*Math.min(1,dt*.75);
    else{const k=Math.min(1,(finT-FIN_CITY)/FIN_EARTH),e=k*k*(3-2*k),r0=R0*1.45,r1=PLANET_R*1.06;king.t=r0*Math.pow(r1/r0,e);
      if(!king.earthSaid&&finT>FIN_CITY+.6){king.earthSaid=1;toast('The city was just the start… Cat Earth!');}
      if(!king.earthDone&&k>=1){king.earthDone=1;toast(king.player?'You swallowed the whole planet!':`${king.name} swallowed Cat Earth!`);kick(14);}}
    if(finT>(alienEnd?FIN_CITY+8:mode==='clean'?1.6:noEarth?FIN_CITY+.8:FIN_CITY+FIN_EARTH+2)&&!endShown&&burpDone()){endShown=true;
      if(mode==='camp')showCampEnd();
      else if(mode==='clean')showCleanEnd();
      else if(mode==='solo'){showEnd(king.medal?`${king.medal[0].toUpperCase()+king.medal.slice(1)} medal!`:'Max size!',king.soloText,false);
        const m=$('medal');m.className='medal '+(king.medal||'none');m.textContent=king.medal?king.medal[0].toUpperCase():'';m.hidden=!king.medal;$('copyBtn').hidden=false;}
      else if(king.player)showEnd('King of the Hill!',`${king.name} absorbed all ${cats.length-1} cats in ${fmt(time)}, then swallowed the city and the whole of Cat Earth.`,false);
      else showEnd(`${king.name} wins`,`${king.name} is King of the Hill and has swallowed the whole of Cat Earth.`,false);}}
  const focus=player.alive?player:alive.reduce((m,c)=>c.r>m.r?c:m,alive[0]);
  if(focus){cam.x+=(focus.x-cam.x)*Math.min(1,dt*5);cam.y+=(focus.y-cam.y)*Math.min(1,dt*5);
    const base=dev==='duo'?1.0:dev==='max'?.86:Math.min(W,H)/760;
    const tz=state==='finale'&&mode==='camp'&&LV.alien&&king&&king.player&&finT>FIN_CITY+4.4?Math.min(W,H)/(PLANET_R*2.7):state==='finale'?Math.max(.0004,Math.min(1.25,Math.min(W,H)/(Math.max(2.4*focus.r,finT>FIN_CITY?Math.min(PLANET_R*2.9,focus.r*5):0)))):Math.max(.14,Math.min(1.25,base*Math.pow(30/focus.r,ZOOM_OUT)));
    cam.z+=(tz-cam.z)*Math.min(1,dt*(state==='finale'?1.5:2));}
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0;}
  lbTimer-=dt;if(lbTimer<=0){lbTimer=.25;hud(alive);}
}
const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const esc=s=>s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function hud(alive){
  $('sz').textContent=player.alive?Math.round(player.r):'—';
  if(mode==='camp'&&LV.goal.type!=='win'){const g=LV.goal,n=g.type==='size'?Math.round(Math.min(player.r,g.n)):Math.min(myCats,g.n);
    $('left').textContent=`${n}/${g.n}`;if(g.type==='size')$('pbarFill').style.width=Math.min(100,player.r/g.n*100)+'%';
    $('hill').textContent=state==='count'?`${LV.name} · get ready…`:state==='finale'?`${LV.name} conquered!`:`${LV.name} · ${goalText(LV)} · ${fmt(time)}`;
    const top=alive.slice().sort((a,b)=>b.r-a.r);let rows=top.slice(0,5);if(player.alive&&!rows.includes(player))rows=rows.slice(0,4).concat(player);
    $('lb').innerHTML=rows.map(c=>`<li class="${c.player?'me':''}" value="${top.indexOf(c)+1}"><span>${esc(c.name)}</span><span>${Math.round(c.r)}</span></li>`).join('');return;}
  if(mode==='clean'){const tot=junkTotal(CL);$('left').textContent=foods.length;$('pbarFill').style.width=((tot-cleanLeft())/tot*100)+'%';
    $('hill').textContent=state==='count'?`${CL.name} · get ready…`:state==='finale'?'Spotless!':`${CL.name} · area ${cleanStage+1}/${CL.stages.length} · ${fmtT(cleanTime())}`+(cleanBonus>.05?` (−${cleanBonus.toFixed(1)}s streak)`:'')+` · ★★★ by ${fmtT(CL.t3)}`;return;}
  if(mode==='solo'){$('left').textContent=SOLO_GOAL;$('pbarFill').style.width=Math.min(100,player.r/SOLO_GOAL*100)+'%';
    const nx=MEDALS.find(([m,l])=>time<=l);$('hill').textContent=state==='finale'?'Max size!':`${mapName(TH_NAME)} · Time ${fmtT(time)}`+(nx?` · ${nx[0]} by ${fmtT(nx[1])}`:dayBest?` · today's best ${fmtT(dayBest)}`:'');return;}
  $('left').textContent=alive.length;
  $('hill').textContent=state==='count'?`Get ready… · ${mapName(TH_NAME)}`:state==='finale'?'Victory!':time<GRACE&&player.alive?`Safe for ${Math.ceil(GRACE-time)}s · rivals can't eat you yet`:state==='finale'?'Victory!':finalOn?'Final circle closing in!':`Match time ${fmt(time)} · final circle at ${FINAL_N} cats`;
  const top=alive.slice().sort((a,b)=>b.r-a.r);let rows=top.slice(0,5);
  if(player.alive&&!rows.includes(player))rows=rows.slice(0,4).concat(player);
  $('lb').innerHTML=rows.map(c=>`<li class="${c.player?'me':''}" value="${top.indexOf(c)+1}"><span>${esc(c.name)}</span><span>${Math.round(c.r)}</span></li>`).join('');
}

