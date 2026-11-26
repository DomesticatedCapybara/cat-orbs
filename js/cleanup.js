// Cat Orbs: Conquerors of Cat Earth - Clean-up Crew: a separate campaign of cleaning jobs.
// Each job is a small island city full of themed junk. Swallow every last piece; the faster, the more stars.
// ---------- junk: themed items for each job (kinds are drawn in drawJunk below) ----------
// r = size, v = growth value, n = how many. A cat must be EAT x bigger than an item to swallow it.
const JUNK={
  can:    {k:'can',    v:6, r:7, glow:'#bff3ff'},
  wrapper:{k:'wrapper',v:7, r:8, glow:'#ffe08a'},
  cup:    {k:'cup',    v:10,r:11,glow:'#ffb3c7'},
  pizza:  {k:'pizza',  v:24,r:24,glow:'#ffcf6b'},
  bag:    {k:'bag',    v:34,r:34,glow:'#a8f0b0'},
  // beach junk. drift = how fast it wanders on the wind (it bounces off the sea wall)
  bottle: {k:'bottle', v:7, r:8, glow:'#9ff3e0'},
  flop:   {k:'flop',   v:8, r:10,glow:'#ffb3c7'},
  ball:   {k:'ball',   v:14,r:14,glow:'#fff36b',drift:70},
  cooler: {k:'cooler', v:30,r:30,glow:'#7fd0ff'},
  brolly: {k:'brolly', v:46,r:46,glow:'#ff9e9e',drift:22},
  // big trash: buildings aren't part of the job, so these are what you grow into
  grill:   {k:'grill',   v:48, r:46, glow:'#ffb07a'},
  dumpster:{k:'dumpster',v:72, r:68, glow:'#9ff0b8'},
  heap:    {k:'heap',    v:120,r:110,glow:'#ffe08a'},
  chair:   {k:'chair',   v:50, r:52, glow:'#ffd0f0'},
  kayak:   {k:'kayak',   v:74, r:70, glow:'#ffcf6b'},
  boat:    {k:'boat',    v:125,r:115,glow:'#c9f0ff'}};
for(const T of Object.values(JUNK)){T.big=T.r>=24;T.junk=1;}
// The job site grows as you clean: each area is an island k blocks out from the middle each way (k=1 is 2x2 blocks).
// Clear an area and the island expands, with the next area's (bigger) junk in the new ring around it.
// t3/t2: finish time (seconds, after the streak bonus) for three and two stars.
const CLEAN_LEVELS=[
  {id:'picnic',name:'Picnic Park',theme:'bay',seed:7101,wx:'clear',tod:'day',t3:90,t2:140,
    stages:[{k:1,junk:[['can',14],['wrapper',12],['cup',8]]},
      {k:2,junk:[['can',16],['wrapper',13],['cup',8],['pizza',8],['bag',6]]},
      {k:3,junk:[['pizza',4],['bag',4],['grill',5],['dumpster',4],['heap',1]]}],
    blurb:'A sunny park after a very messy picnic. Start with cans, wrappers and cups; as the site grows come pizza boxes and trash bags, then old grills, dumpsters and one giant garbage heap.'},
  {id:'beach',name:'Breezy Boardwalk',theme:'beach',seed:7202,wx:'clear',tod:'day',t3:165,t2:240,
    stages:[{k:1,junk:[['bottle',14],['flop',12]]},
      {k:2,junk:[['bottle',22],['flop',18],['ball',12]]},
      {k:3,junk:[['ball',8],['cooler',10],['brolly',5]]},
      {k:4,junk:[['cooler',4],['chair',7],['kayak',4],['boat',1]]}],
    blurb:'A windy beach after a festival. Bottles and flip-flops first, then wind-blown beach balls, coolers and umbrellas, and finally busted beach chairs, cracked kayaks and a wrecked rowboat.'}];
// wind: drifting junk wanders and bounces off the sea wall at the island's edge
function junkTick(dt){for(const f of foods){const v=f.T.drift;if(!v)continue;
  if(f.vx===undefined){const a=Math.random()*7;f.vx=Math.cos(a)*v;f.vy=Math.sin(a)*v;}
  const a=Math.atan2(f.vy,f.vx)+(Math.random()-.5)*dt*1.5;f.vx=Math.cos(a)*v;f.vy=Math.sin(a)*v;
  f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=dt*v/f.r*.6;
  const L=R0-f.r-10;if(Math.abs(f.x)>L){f.x=Math.sign(f.x)*L;if(f.vx*f.x>0)f.vx=-f.vx;}if(Math.abs(f.y)>L){f.y=Math.sign(f.y)*L;if(f.vy*f.y>0)f.vy=-f.vy;}}}
let clean={sel:0,stars:[],best:[],sawIntro:0};
try{const s=JSON.parse(localStorage.getItem('catorb-clean')||'null');if(s)clean=Object.assign(clean,s);}catch(e){}
const saveClean=()=>{try{localStorage.setItem('catorb-clean',JSON.stringify(clean));}catch(e){}};
const cleanUnl=i=>i===0||(clean.stars[i-1]||0)>0;
let CL=CLEAN_LEVELS[0];
const junkTotal=L=>L.stages.reduce((s,S)=>s+S.junk.reduce((a,[,n])=>a+n,0),0);
let cleanStage=0;
// pieces left in the whole job: this area's, plus every area still to come
const cleanLeft=()=>foods.length+CL.stages.slice(cleanStage+1).reduce((s,S)=>s+S.junk.reduce((a,[,n])=>a+n,0),0);
// fill an area with junk: only the new ring outside the previous area (inner), biggest pieces first so they get room
function placeJunk(inner){
  for(const[k,n]of CL.stages[cleanStage].junk.slice().sort((a,b)=>JUNK[b[0]].r-JUNK[a[0]].r)){const T=Object.assign({n},JUNK[k]);
    for(let i=0;i<n;i++){let best=null,bs=-1e9;
      for(let t=0;t<14;t++){const m=T.r+30,x=rnd(-R0+m,R0-m),y=rnd(-R0+m,R0-m);if(Math.max(Math.abs(x),Math.abs(y))<inner+T.r+20)continue;
        let q=1e9;for(const o of foods){const d=Math.hypot(o.x-x,o.y-y)-o.r-T.r;if(d<q)q=d;}if(q>bs){bs=q;best={x,y};}}
      if(!best)best={x:R0-T.r-30,y:rnd(-R0+T.r+30,R0-T.r-30)};
      foods.push({x:best.x,y:best.y,T,r:T.r,v:T.v,rot:Math.random()*7,ph:Math.random()*7,hue:Math.floor(Math.random()*3)});}}}
// an area is spotless: the island grows outward, new city appears in the ring, and the next area's junk is dropped there.
// Props and critters already on the island keep their state (what you ate stays eaten).
function expandSite(){const oldR=R0,oldProps=props,oldCrit=critters.filter(m=>m.alive);cleanStage++;
  setIsland(CL.stages[cleanStage].k);setCity(CL.seed);buildProps();
  const fresh=props.filter(p=>Math.max(Math.abs(p.x),Math.abs(p.y))>oldR-p.r*.3-1);props=oldProps.concat(fresh);pgrid=new Map();
  for(const p of props){if(p.k==='bldg')p.out=1;const g=gkey(p.x,p.y);if(!pgrid.has(g))pgrid.set(g,[]);pgrid.get(g).push(p);}
  critters=oldCrit.concat(critters.filter(m=>Math.max(Math.abs(m.x),Math.abs(m.y))>oldR));
  arenaR=R0*1.42;placeJunk(oldR);snd.level();kick(6);
  toast(`Area ${cleanStage} spotless! The job site grows (area ${cleanStage+1} of ${CL.stages.length})`);}
function cleanNote(){const L=CLEAN_LEVELS[clean.sel],b=clean.best[clean.sel];
  return `${L.name}: ${L.blurb} Clean all ${L.stages.length} areas, ${junkTotal(L)} pieces in all. Three stars under ${fmtT(L.t3)}, two under ${fmtT(L.t2)}.`+(b?` Your best ${fmtT(b)}.`:'')+' More jobs coming soon.';}
function buildClean(){const box=$('cleanList');if(!box)return;box.innerHTML='';if(!cleanUnl(clean.sel))clean.sel=0;
  CLEAN_LEVELS.forEach((L,i)=>{const u=cleanUnl(i),st=clean.stars[i]||0,b=document.createElement('button');b.type='button';
    b.className='lvl'+(i===clean.sel?' on':'')+(u?'':' locked');b.setAttribute('aria-pressed',i===clean.sel?'true':'false');
    b.innerHTML=`<span class="n">${i+1}</span><span class="t"><b></b><small></small></span><span class="s" aria-label="${st} of 3 stars">${u?starStr(st):'Locked'}</span>`;
    b.querySelector('b').textContent=L.name;b.querySelector('small').textContent=u?`Job ${i+1} · ${L.stages.length} areas · ${junkTotal(L)} pieces of junk`:`Finish ${CLEAN_LEVELS[i-1].name} to unlock`;
    b.addEventListener('click',()=>{if(!u)return;clean.sel=i;saveClean();buildClean();setMode('clean');});box.appendChild(b);});}
// the job is done when the last piece of junk is gone
function cleanWin(){king=player;finT=0;state='finale';snd.win();stats.survived=time;if(!stats.frozen)stats.frozen=Object.assign({},stats);
  const i=CLEAN_LEVELS.indexOf(CL),t=cleanTime(),st=t<=CL.t3?3:t<=CL.t2?2:1,pb=clean.best[i],fresh=i+1<CLEAN_LEVELS.length&&!cleanUnl(i+1);
  clean.stars[i]=Math.max(clean.stars[i]||0,st);if(!pb||t<pb)clean.best[i]=t;saveClean();
  if(!recorded){recorded=true;prog.games++;prog.treats+=myTreats;saveProg();}
  king.clean={st,isBest:!!pb&&t<pb,first:!pb,newUnlock:fresh&&cleanUnl(i+1)?CLEAN_LEVELS[i+1]:null};toast('Spotless! Job done!');}
function showCleanEnd(){const r=king.clean,t=Math.max(0,(stats.survived||time)-cleanBonus),i=CLEAN_LEVELS.indexOf(CL),nx=CLEAN_LEVELS[i+1];
  showEnd('Job done!',`${starStr(r.st)}  You cleaned up ${CL.name} in ${fmtT(t)}`+(cleanBonus>.05?` (${fmtT(stats.survived||time)} on the clock, minus ${cleanBonus.toFixed(1)}s of streak bonus; longest streak ${cleanBest})`:'')+(r.isBest?', a new best':'')+'.'
    +(r.st<3?` Three stars under ${fmtT(CL.t3)}${r.st<2?`, two under ${fmtT(CL.t2)}`:''}.`:' The Crew Chief is impressed.')
    +(r.newUnlock?` ${r.newUnlock.name} is now unlocked!`:nx?'':' That\'s every job for now. More are on the way.'),false);
  $('againBtn').textContent='Replay';
  if(nx&&cleanUnl(i+1)){const b=$('nextBtn');b.hidden=false;b.textContent=`Next: ${nx.name}`;}}
// ---------- clean streaks: chain pickups for bonus growth (the combo) and time off your star time ----------
const STREAK_WINDOW=2.4; // seconds between pickups before a streak breaks (longer than the usual combo: it's a casual job)
const CLEAN_ARROWS=10; // arrows point to every remaining piece once this few are left in the area
const STREAK_MARKS=[10,25,50,75,100];
let cleanBonus=0,cleanBest=0;
const cleanTime=()=>Math.max(0,time-cleanBonus);
function junkEaten(f){const big=f.T.big;cleanBest=Math.max(cleanBest,combo);
  if(combo>=3)cleanBonus+=(big?.5:.12)*Math.min(1,combo/8);
  burst(f.x,f.y,f.T.glow,big?14:4);
  if(f.r>=40){kick(Math.min(10,3+f.r*.05));snd.crunch(f.r*1.5);}
  if(STREAK_MARKS.includes(combo)){snd.level();floats.push({x:player.x,y:player.y-player.r*1.4,t:1.6,txt:`Streak ${combo}! ${combo>=50?'Clean machine!':combo>=25?'Spotless work!':'Nice!'}`,col:'#fff4b0'});}}
// arrow to the nearest junk: edible pieces first, otherwise the nearest one at all
function junkTarget(){let best=null,bd=1e9,any=null,ad=1e9;
  for(const f of foods){const d=Math.hypot(f.x-player.x,f.y-player.y);if(d<ad){ad=d;any=f;}if(canEatF(player,f)&&d<bd){bd=d;best=f;}}
  return best||any;}

// ---------- the opening scene: the Crew Chief hires you ----------
const CREW_STORY=[
  {crew:1,text:'Crew Chief: "So you want to work the Cat Orb Clean-up Crew, huh?"'},
  {crew:1,text:'Crew Chief: "Let\'s see what you got."',btn:'Clock in!'}];
const CHIEF_FUR={n:'Chief',b:'#cfd4da',s:'#8a929c',st:1,eye:'#f2c94c'};
const LITTER=[[.08,.82,'can'],[.2,.9,'wrapper'],[.9,.84,'cup'],[.78,.93,'can'],[.33,.95,'pizza'],[.62,.97,'wrapper'],[.96,.95,'bag'],[.04,.96,'cup']];
function drawCrewScene(g,Wd,Hd,t){
  const sky=g.createLinearGradient(0,0,0,Hd);sky.addColorStop(0,'#8fd0f5');sky.addColorStop(1,'#d9f1ff');g.fillStyle=sky;g.fillRect(0,0,Wd,Hd);
  g.fillStyle='#4c9a52';g.fillRect(0,Hd*.7,Wd,Hd*.3);g.fillStyle='#3e7a46';g.fillRect(0,Hd*.7,Wd,3);
  for(const[x,y,k]of LITTER){g.save();g.translate(x*Wd,y*Hd);const T=JUNK[k],q=Math.min(Wd,Hd)/150;g.scale(q,q);drawJunk(g,T,T.r*.6,.4,0);g.restore();}
  // the Crew Chief: a big gray tabby orb in a hard hat, holding a clipboard
  const talk=Math.max(0,1-(t-.2)/1.6),R=Hd*.3,cx=Wd*.36,cy=Hd*.56+Math.sin(t*2)*2;
  const chief=makeCat(0,0,R,'Crew Chief',false,CHIEF_FUR);chief.look={x:.5,y:.1};chief.blink=1;chief.mo=talk>0?.18+.16*Math.sin(t*16):0;
  const z=cam.z;cam.z=1;drawCat(g,chief,cx,cy,R);cam.z=z;
  g.fillStyle='#ffd23f';g.strokeStyle='#b8860b';g.lineWidth=2;g.beginPath();g.ellipse(cx,cy-R*.78,R*.62,R*.42,0,Math.PI,0);g.closePath();g.fill();g.stroke();
  g.fillRect(cx-R*.82,cy-R*.8,R*1.64,R*.1);g.strokeRect(cx-R*.82,cy-R*.8,R*1.64,R*.1);g.fillStyle='#ffe680';g.fillRect(cx-R*.06,cy-R*1.18,R*.12,R*.38);
  const bx=cx+R*1.2,by=cy+R*.2;g.save();g.translate(bx,by);g.rotate(.18);g.fillStyle='#9a6b3f';g.fillRect(-R*.28,-R*.36,R*.56,R*.72);
  g.fillStyle='#fff';g.fillRect(-R*.22,-R*.26,R*.44,R*.56);g.fillStyle='#777';g.fillRect(-R*.1,-R*.42,R*.2,R*.1);
  g.strokeStyle='#9aa3ae';g.lineWidth=1.5;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-R*.16,-R*.14+i*R*.12);g.lineTo(R*.16,-R*.14+i*R*.12);g.stroke();}g.restore();
  // you: a small orb looking up at the boss
  const pf=FUR[prog.pick]&&isUnl(FUR[prog.pick])?FUR[prog.pick]:FUR[0],me=makeCat(0,0,R*.38,'You',true,pf);me.look={x:-.6,y:-.5};me.blink=1;
  cam.z=1;drawCat(g,me,Wd*.8,Hd*.74+Math.abs(Math.sin(t*3))*-3,R*.38);cam.z=z;}

// ---------- drawing junk (also used by drawFood in the game) ----------
function drawJunk(g,T,r,rot,hue){g.lineWidth=Math.max(1.5,r*.08);g.strokeStyle='rgba(30,20,20,.55)';g.lineJoin='round';
  if(T.k==='can'){g.rotate(rot);rr(g,-r*1.1,-r*.6,r*2.2,r*1.2,r*.3);g.fillStyle=['#e8453c','#3f7fd8','#3fae7a'][hue%3];g.fill();g.stroke();
    g.fillStyle='#d7dde4';g.fillRect(r*.8,-r*.6,r*.3,r*1.2);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-r*.8,-r*.35,r*1.3,r*.18);}
  else if(T.k==='wrapper'){g.rotate(rot);g.fillStyle=['#ff8ad0','#ffd23f','#7fd0ff'][hue%3];g.beginPath();
    g.moveTo(-r*1.2,-r*.6);g.lineTo(-r*.6,-r*.35);g.lineTo(r*.6,-r*.4);g.lineTo(r*1.2,-r*.7);g.lineTo(r*1.05,0);g.lineTo(r*1.25,r*.65);g.lineTo(r*.6,r*.4);g.lineTo(-r*.6,r*.42);g.lineTo(-r*1.2,r*.7);g.lineTo(-r*1.05,0);g.closePath();g.fill();g.stroke();
    g.fillStyle='rgba(255,255,255,.6)';g.fillRect(-r*.4,-r*.12,r*.8,r*.24);}
  else if(T.k==='cup'){g.rotate(rot);g.fillStyle='#fff6ee';g.beginPath();g.moveTo(-r*.9,-r*.75);g.lineTo(r*.9,-r*.5);g.lineTo(r*.9,r*.5);g.lineTo(-r*.9,r*.75);g.closePath();g.fill();g.stroke();
    g.fillStyle='#e8453c';g.fillRect(-r*.3,-r*.62,r*.3,r*1.24);g.fillStyle='#f2c3a0';g.beginPath();g.ellipse(-r*.9,0,r*.22,r*.75,0,0,7);g.fill();g.stroke();}
  else if(T.k==='pizza'){g.rotate(rot*.3);rr(g,-r,-r,r*2,r*2,r*.12);g.fillStyle='#e0c08a';g.fill();g.stroke();
    g.strokeStyle='rgba(120,80,40,.45)';g.strokeRect(-r*.82,-r*.82,r*1.64,r*1.64);g.fillStyle='#e8453c';g.font=`800 ${r*.42}px "Baloo 2",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('PIZZA',0,r*.05);
    g.fillStyle='#f2b04a';g.beginPath();g.moveTo(r*.3,r*.45);g.lineTo(r*.85,r*.55);g.lineTo(r*.55,r*.85);g.closePath();g.fill();}
  else if(T.k==='bag'){g.fillStyle='#2f3a33';g.beginPath();g.ellipse(0,r*.12,r,r*.88,0,0,7);g.fill();g.stroke();
    g.beginPath();g.moveTo(-r*.25,-r*.68);g.lineTo(0,-r*1.05);g.lineTo(r*.25,-r*.68);g.closePath();g.fill();g.stroke();
    g.fillStyle='#ffd23f';g.fillRect(-r*.22,-r*.78,r*.44,r*.14);g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(-r*.35,-r*.1,r*.2,r*.4,-.3,0,7);g.fill();}
  else if(T.k==='bottle'){g.rotate(rot);g.fillStyle=['rgba(90,200,140,.85)','rgba(120,190,240,.85)','rgba(170,110,60,.85)'][hue%3];
    rr(g,-r*1.2,-r*.45,r*1.6,r*.9,r*.3);g.fill();g.stroke();g.fillRect(r*.4,-r*.22,r*.7,r*.44);g.strokeRect(r*.4,-r*.22,r*.7,r*.44);
    g.fillStyle='#fff';g.fillRect(-r*.8,-r*.3,r*.7,r*.6);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(-r*1,-r*.3,r*1.3,r*.12);}
  else if(T.k==='flop'){g.rotate(rot);g.fillStyle=['#ff6b5a','#3fc4d8','#ffd23f'][hue%3];g.beginPath();g.ellipse(-r*.35,0,r*.7,r*.5,0,0,7);g.ellipse(r*.45,0,r*.6,r*.44,0,0,7);g.fill();g.stroke();
    g.strokeStyle='#fff6e6';g.lineWidth=Math.max(1.5,r*.14);g.beginPath();g.moveTo(r*.6,0);g.lineTo(-r*.2,-r*.4);g.moveTo(r*.6,0);g.lineTo(-r*.2,r*.4);g.stroke();}
  else if(T.k==='ball'){g.beginPath();g.arc(0,0,r,0,7);g.fillStyle='#fff';g.fill();g.save();g.clip();g.rotate(rot);
    ['#ff6b5a','#ffd23f','#3f7fd8'].forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.moveTo(0,0);g.arc(0,0,r,i*2.09,i*2.09+1.05);g.closePath();g.fill();});g.restore();
    g.beginPath();g.arc(0,0,r,0,7);g.stroke();circ(g,0,0,r*.18,'#fff');circ(g,-r*.35,-r*.4,r*.18,'rgba(255,255,255,.6)');}
  else if(T.k==='cooler'){g.rotate(rot*.2);rr(g,-r*1.1,-r*.75,r*2.2,r*1.5,r*.18);g.fillStyle=['#3f7fd8','#e8453c','#3fae7a'][hue%3];g.fill();g.stroke();
    rr(g,-r*1.1,-r*.75,r*2.2,r*.5,r*.18);g.fillStyle='#f4f1ea';g.fill();g.stroke();g.fillStyle='#d7dde4';g.fillRect(-r*.4,-r*.62,r*.8,r*.22);}
  else if(T.k==='brolly'){g.rotate(rot);const n=8;for(let i=0;i<n;i++){g.fillStyle=i%2?'#fff6e6':['#ff6b5a','#3fc4d8','#ffd23f'][hue%3];g.beginPath();g.moveTo(0,0);g.arc(0,0,r,i*Math.PI*2/n,(i+1)*Math.PI*2/n);g.closePath();g.fill();}
    g.beginPath();g.arc(0,0,r,0,7);g.stroke();g.strokeStyle='rgba(30,20,20,.35)';g.beginPath();for(let i=0;i<n;i++){g.moveTo(0,0);g.lineTo(Math.cos(i*Math.PI*2/n)*r,Math.sin(i*Math.PI*2/n)*r);}g.stroke();
    g.strokeStyle='#8a6236';g.lineWidth=Math.max(2,r*.08);g.beginPath();g.moveTo(0,0);g.lineTo(r*1.1,r*.5);g.stroke();circ(g,0,0,r*.1,'#8a6236');}
  else if(T.k==='grill'){g.rotate(rot*.3);for(const[a,b]of[[-.7,.75],[.7,.75],[0,-.95]]){g.strokeStyle='#3a3a3a';g.lineWidth=Math.max(2,r*.09);g.beginPath();g.moveTo(0,0);g.lineTo(a*r*1.1,b*r*1.1);g.stroke();}
    g.lineWidth=Math.max(1.5,r*.06);g.strokeStyle='rgba(30,20,20,.55)';g.beginPath();g.arc(0,0,r*.85,0,7);g.fillStyle='#2b2b2e';g.fill();g.stroke();
    g.beginPath();g.arc(0,0,r*.66,0,7);g.fillStyle='#4a4a50';g.fill();g.save();g.clip();g.strokeStyle='#b9bec6';g.lineWidth=Math.max(1,r*.04);g.beginPath();for(let i=-3;i<=3;i++){g.moveTo(i*r*.18,-r);g.lineTo(i*r*.18,r);}g.stroke();g.restore();
    for(const[a,b]of[[-.2,.1],[.15,-.25],[.25,.2],[-.3,-.25]])circ(g,a*r,b*r,r*.08,'#ff7a3a');}
  else if(T.k==='dumpster'){g.rotate(rot*.15);rr(g,-r*1.15,-r*.72,r*2.3,r*1.44,r*.1);g.fillStyle=['#3d7a52','#3f6fb0','#5a5f68'][hue%3];g.fill();g.stroke();
    g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-r*1.08,-r*.08,r*2.16,r*.16);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(-r*1.05,-r*.64,r*1,r*.5);g.fillRect(r*.05,-r*.64,r*1,r*.5);
    g.fillStyle='#ffd23f';g.fillRect(-r*.3,r*.22,r*.6,r*.3);for(const s of[-1,1])circ(g,s*r*.95,r*.62,r*.12,'#222');
    circ(g,r*.6,-r*.82,r*.16,'#e8453c');circ(g,-r*.7,-r*.8,r*.12,'#f4f1ea');}
  else if(T.k==='heap'){const cols=['#8a6a4a','#6f5a48','#9a7b58'];for(let i=0;i<7;i++){const a=i*.9+rot*.2,d=i?r*.45:0;circ(g,Math.cos(a)*d,Math.sin(a)*d,r*(i?.5:.62),cols[i%3]);}
    g.beginPath();g.arc(0,0,r,0,7);g.strokeStyle='rgba(30,20,20,.3)';g.stroke();
    const bits=[['#e8453c',-.4,-.3],['#3f7fd8',.35,-.45],['#ffd23f',.1,.35],['#3fae7a',-.5,.3],['#fff6ee',.5,.2],['#ff8ad0',-.1,-.6],['#2f3a33',.6,-.1]];
    for(const[col,a,b]of bits){g.save();g.translate(a*r,b*r);g.rotate(a*5+b*3);g.fillStyle=col;g.fillRect(-r*.12,-r*.07,r*.24,r*.14);g.restore();}
    g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(-r*.3,-r*.35,r*.25,r*.12,-.5,0,7);g.fill();}
  else if(T.k==='chair'){g.rotate(rot);const cols=[['#ff6b5a','#fff6e6'],['#3fc4d8','#fff6e6'],['#ffd23f','#3f7fd8']][hue%3];
    g.strokeStyle='#d7dde4';g.lineWidth=Math.max(2,r*.08);g.strokeRect(-r*.62,-r*.95,r*1.24,r*1.9);
    for(let i=0;i<5;i++){g.fillStyle=cols[i%2];g.fillRect(-r*.55+i*r*.22,-r*.88,r*.22,r*1.76);}
    g.strokeStyle='rgba(30,20,20,.55)';g.lineWidth=Math.max(1.5,r*.05);g.strokeRect(-r*.55,-r*.88,r*1.1,r*1.76);g.beginPath();g.moveTo(-r*.55,r*.1);g.lineTo(r*.55,-r*.2);g.stroke();}
  else if(T.k==='kayak'){g.rotate(rot*.4);g.fillStyle=['#ff7a1a','#e8453c','#ffd23f'][hue%3];g.beginPath();g.ellipse(0,0,r*1.2,r*.38,0,0,7);g.fill();g.stroke();
    g.fillStyle='#2b2b2e';g.beginPath();g.ellipse(-r*.15,0,r*.32,r*.2,0,0,7);g.fill();g.strokeStyle='#5a4a3c';g.lineWidth=Math.max(2,r*.06);g.beginPath();g.moveTo(-r*.9,-r*.45);g.lineTo(r*.6,r*.45);g.stroke();
    g.strokeStyle='#1a1416';g.lineWidth=Math.max(1.5,r*.035);g.beginPath();g.moveTo(r*.45,-r*.3);g.lineTo(r*.55,-r*.08);g.lineTo(r*.48,r*.08);g.lineTo(r*.6,r*.3);g.stroke();}
  else if(T.k==='boat'){g.rotate(rot*.25);g.beginPath();g.moveTo(-r*1.15,0);g.quadraticCurveTo(-r*.9,-r*.62,r*.2,-r*.6);g.quadraticCurveTo(r*1.05,-r*.45,r*1.2,0);g.quadraticCurveTo(r*1.05,r*.45,r*.2,r*.6);g.quadraticCurveTo(-r*.9,r*.62,-r*1.15,0);g.closePath();
    g.fillStyle='#8a5a36';g.fill();g.stroke();g.save();g.clip();g.fillStyle='#a8744f';g.fillRect(-r*1.2,-r*.42,r*2.4,r*.84);g.strokeStyle='rgba(60,35,20,.5)';g.lineWidth=Math.max(1,r*.03);
    for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(-r*1.2,i*r*.16);g.lineTo(r*1.2,i*r*.16);g.stroke();}g.restore();
    g.fillStyle='#7a4b2a';for(const x of[-.45,.25])g.fillRect(x*r,-r*.48,r*.14,r*.96);
    g.fillStyle='#1d2733';g.beginPath();g.ellipse(r*.6,r*.1,r*.16,r*.12,.4,0,7);g.fill();
    g.strokeStyle='#c9a06a';g.lineWidth=Math.max(2,r*.05);g.beginPath();g.moveTo(-r*.2,-r*.2);g.lineTo(r*.9,-r*.9);g.stroke();}}
