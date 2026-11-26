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
  boat:    {k:'boat',    v:125,r:115,glow:'#c9f0ff'},
  // Frosty Festival
  cocoa:  {k:'cocoa', v:7, r:8, glow:'#ffd9b0'}, mitten:{k:'mitten',v:8, r:10,glow:'#ff9e9e'}, scarf:{k:'scarf',v:14,r:14,glow:'#c7a0ff',drift:40},
  ski:    {k:'ski',   v:18,r:20,glow:'#bfe3ff'}, sled:  {k:'sled',  v:40,r:40,glow:'#ffcf6b'}, lift: {k:'lift', v:128,r:118,glow:'#d6e6ff'},
  // Neon Night Market
  glowstick:{k:'glowstick',v:7,r:8,glow:'#7affc0'}, takeout:{k:'takeout',v:9,r:10,glow:'#ffd0a0'}, lantern:{k:'lantern',v:15,r:16,glow:'#ff9e9e',drift:30},
  sign:   {k:'sign',  v:30,r:30,glow:'#ff8ad0'}, arcade:{k:'arcade',v:62,r:60,glow:'#9ff3ff'}, truck:{k:'truck',v:135,r:125,glow:'#ffe08a'},
  // Dusty Fairground
  popcorn:{k:'popcorn',v:7,r:8,glow:'#fff36b'}, ccandy:{k:'ccandy',v:9,r:10,glow:'#ffb3e6'}, balloon:{k:'balloon',v:14,r:14,glow:'#ff9e9e',drift:35},
  plush:  {k:'plush', v:20,r:20,glow:'#d9b3ff'}, bumper:{k:'bumper',v:52,r:50,glow:'#7fd0ff'}, horse:{k:'horse',v:80,r:75,glow:'#ffe08a'},
  tent:   {k:'tent',  v:150,r:140,glow:'#ff9e9e'},
  // Mothership Mess
  goo:    {k:'goo',   v:7, r:9, glow:'#9dff7a'}, tube:{k:'tube',v:9,r:10,glow:'#d6e6ff'}, energy:{k:'energy',v:14,r:14,glow:'#7ff9ff',drift:50},
  gear:   {k:'gear',  v:22,r:22,glow:'#c0c8e0'}, probe:{k:'probe',v:58,r:55,glow:'#b98aff'}, saucer:{k:'saucer',v:160,r:150,glow:'#7affc0'}};
for(const T of Object.values(JUNK)){T.big=T.r>=24;T.junk=1;}
// Each job is one fixed island, k city blocks out from the middle each way (k=2 is 4x4 blocks); every job is bigger than the last.
// The junk is listed in tiers from small to big (stages, for readability only: it's all on the island from the start).
// mult scales the small and medium junk so bigger islands don't feel empty. t3/t2: finish time (after streak bonus) for three/two stars.
const CLEAN_LEVELS=[
  {id:'picnic',name:'Picnic Park',theme:'bay',seed:7101,k:2,mult:1,wx:'clear',tod:'day',t3:45,t2:70,
    stages:[{k:1,junk:[['can',14],['wrapper',12],['cup',8]]},
      {k:2,junk:[['can',16],['wrapper',13],['cup',8],['pizza',8],['bag',6]]},
      {k:3,junk:[['pizza',4],['bag',4],['grill',5],['dumpster',4],['heap',1]]}],
    blurb:'A sunny park after a very messy picnic. Cans, wrappers and cups, pizza boxes and trash bags, old grills, dumpsters and one giant garbage heap.'},
  {id:'beach',name:'Breezy Boardwalk',theme:'beach',seed:7202,k:3,mult:1.3,wx:'clear',tod:'day',t3:55,t2:85,
    stages:[{k:1,junk:[['bottle',14],['flop',12]]},
      {k:2,junk:[['bottle',22],['flop',18],['ball',12]]},
      {k:3,junk:[['ball',8],['cooler',10],['brolly',5]]},
      {k:4,junk:[['cooler',4],['chair',7],['kayak',4],['boat',1]]}],
    blurb:'A windy beach after a festival. Bottles and flip-flops, wind-blown beach balls, coolers and umbrellas, busted beach chairs, cracked kayaks and a wrecked rowboat.'},
  {id:'frosty',name:'Frosty Festival',theme:'snow',seed:7303,k:4,mult:1.6,wx:'snow',tod:'day',t3:100,t2:150,
    stages:[{k:1,junk:[['cocoa',16],['mitten',14]]},{k:2,junk:[['cocoa',18],['mitten',16],['scarf',12]]},{k:3,junk:[['scarf',12],['ski',16]]},
      {k:4,junk:[['scarf',10],['ski',10],['sled',12]]},{k:5,junk:[['ski',12],['sled',10],['lift',2]]}],
    blurb:'A winter festival in the snow. Cocoa cups and lost mittens, wind-blown scarves, dropped skis and sleds, and two runaway ski-lift gondolas.'},
  {id:'neon',name:'Neon Night Market',theme:'neon',seed:7404,k:5,mult:1.9,wx:'clear',tod:'night',t3:105,t2:160,
    stages:[{k:1,junk:[['glowstick',16],['takeout',14]]},{k:2,junk:[['glowstick',18],['takeout',16],['lantern',12]]},{k:3,junk:[['lantern',12],['sign',12]]},
      {k:4,junk:[['lantern',10],['sign',10],['arcade',8]]},{k:5,junk:[['sign',10],['arcade',6],['truck',2]]}],
    blurb:'A night market after closing time. Glowsticks and takeout boxes, drifting paper lanterns, broken neon signs, arcade cabinets and two wrecked food trucks.'},
  {id:'fair',name:'Dusty Fairground',theme:'desert',seed:7505,k:6,mult:2.2,wx:'clear',tod:'dusk',t3:115,t2:175,
    stages:[{k:1,junk:[['popcorn',16],['ccandy',14]]},{k:2,junk:[['popcorn',18],['ccandy',16],['balloon',12]]},{k:3,junk:[['balloon',10],['plush',16]]},
      {k:4,junk:[['plush',12],['bumper',10]]},{k:5,junk:[['plush',12],['bumper',8],['horse',6]]},{k:6,junk:[['bumper',8],['horse',6],['tent',2]]}],
    blurb:'A desert fair after the last ride. Popcorn and cotton candy, floating balloons, prize plushies, bumper cars, carousel horses and two collapsed circus tents. As big as the whole city.'},
  {id:'mother',name:'Mothership Mess',theme:'arena',seed:7606,k:7,mult:2.5,wx:'clear',tod:'day',t3:150,t2:225,
    stages:[{k:1,junk:[['goo',16],['tube',14]]},{k:2,junk:[['goo',18],['tube',16],['energy',12]]},{k:3,junk:[['energy',10],['gear',16]]},
      {k:4,junk:[['gear',12],['probe',10]]},{k:5,junk:[['gear',12],['probe',8],['saucer',1]]},{k:6,junk:[['probe',8],['gear',10],['saucer',3]]}],
    blurb:'The alien\'s old mothership, a total mess. Space goo and food tubes, floating energy orbs, robot parts, crashed probes and four wrecked flying saucers. Even bigger than the city: the biggest job of all.'}];
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
// every job's full junk list: its tiers merged, small and medium pieces scaled by the island's size
for(const L of CLEAN_LEVELS){const m=new Map();for(const S of L.stages)for(const[k,n]of S.junk)m.set(k,(m.get(k)||0)+n);
  L.junk=[...m].map(([k,n])=>[k,JUNK[k].r<40?Math.round(n*L.mult):n]);}
const junkTotal=L=>L.junk.reduce((s,[,n])=>s+n,0);
// fill the whole island with junk, biggest pieces first so they get room
function placeJunk(){foods=[];
  for(const[k,n]of CL.junk.slice().sort((a,b)=>JUNK[b[0]].r-JUNK[a[0]].r)){const T=Object.assign({n},JUNK[k]);
    for(let i=0;i<n;i++){let best=null,bs=-1e9;
      for(let t=0;t<14;t++){const m=T.r+30,x=rnd(-R0+m,R0-m),y=rnd(-R0+m,R0-m);if(Math.hypot(x,y)<T.r+60)continue; // not on top of you at the start
        let q=1e9;for(const o of foods){const d=Math.hypot(o.x-x,o.y-y)-o.r-T.r;if(d<q)q=d;}if(q>bs){bs=q;best={x,y};}}
      if(!best)best={x:R0-T.r-30,y:rnd(-R0+T.r+30,R0-T.r-30)};
      foods.push({x:best.x,y:best.y,T,r:T.r,v:T.v,rot:Math.random()*7,ph:Math.random()*7,hue:Math.floor(Math.random()*3)});}}}
// The job site: permanent fixtures stay (and can't be eaten); every loose street item (parked cars, vans, buses, bikes,
// cones, bins, carts) is swapped, in place, for a piece of this job's junk of a similar size. A finished job leaves only
// the buildings and permanents. No pigeons or mice on the job.
const PERMANENT=new Set(['bldg','tree','bush','fountain','statue','lamp','hydrant','mailbox','bench','table']);
let cleanTotal=0;
function setUpJobSite(){const kinds=[...new Set(CL.junk.map(([k])=>k))];
  for(const p of props){if(!p.alive)continue;if(PERMANENT.has(p.k)){p.out=1;continue;}
    p.alive=false;let best=kinds[0],bd=1e9;for(const k of kinds){const d=Math.abs(JUNK[k].r-p.r);if(d<bd){bd=d;best=k;}}
    const T=Object.assign({n:1},JUNK[best]);foods.push({x:p.x,y:p.y,T,r:T.r,v:T.v,rot:Math.random()*7,ph:Math.random()*7,hue:Math.floor(Math.random()*3)});}
  critters=[];cleanTotal=foods.length;}
function cleanNote(){const L=CLEAN_LEVELS[clean.sel],b=clean.best[clean.sel];
  return `${L.name}: ${L.blurb} A ${L.k*2}×${L.k*2}-block island: swallow every piece of junk (and every car, bike and bin left on the streets, now junk too) until only the buildings and fixtures remain. Three stars under ${fmtT(L.t3)}, two under ${fmtT(L.t2)}.`+(b?` Your best ${fmtT(b)}.`:'')+' More jobs coming soon.';}
function buildClean(){const box=$('cleanList');if(!box)return;box.innerHTML='';if(!cleanUnl(clean.sel))clean.sel=0;
  CLEAN_LEVELS.forEach((L,i)=>{const u=cleanUnl(i),st=clean.stars[i]||0,b=document.createElement('button');b.type='button';
    b.className='lvl'+(i===clean.sel?' on':'')+(u?'':' locked');b.setAttribute('aria-pressed',i===clean.sel?'true':'false');
    b.innerHTML=`<span class="n">${i+1}</span><span class="t"><b></b><small></small></span><span class="s" aria-label="${st} of 3 stars">${u?starStr(st):'Locked'}</span>`;
    b.querySelector('b').textContent=L.name;b.querySelector('small').textContent=u?`Job ${i+1} · ${L.k*2}×${L.k*2}-block island`:`Finish ${CLEAN_LEVELS[i-1].name} to unlock`;
    b.addEventListener('click',()=>{if(!u)return;clean.sel=i;saveClean();buildClean();setMode('clean');});box.appendChild(b);});}
// the job is done when the last piece of junk is gone
function cleanWin(){king=player;finT=0;state='finale';snd.win();stats.survived=time;if(!stats.frozen)stats.frozen=Object.assign({},stats);
  const i=CLEAN_LEVELS.indexOf(CL),t=cleanTime(),st=t<=CL.t3?3:t<=CL.t2?2:1,pb=clean.best[i],fresh=i+1<CLEAN_LEVELS.length&&!cleanUnl(i+1);
  clean.stars[i]=Math.max(clean.stars[i]||0,st);if(!pb||t<pb)clean.best[i]=t;saveClean();
  if(!recorded){recorded=true;prog.games++;prog.treats+=myTreats;saveProg();}
  king.clean={st,isBest:!!pb&&t<pb,first:!pb,newUnlock:fresh&&cleanUnl(i+1)?CLEAN_LEVELS[i+1]:null};toast('Spotless! Job done!');}
function showCleanEnd(){const T0=stats.survived||time,cut=Math.min(cleanBonus,T0*CLEAN_BONUS_CAP),r=king.clean,t=Math.max(0,T0-cut),i=CLEAN_LEVELS.indexOf(CL),nx=CLEAN_LEVELS[i+1];
  showEnd('Job done!',`${starStr(r.st)}  You cleaned up ${CL.name} in ${fmtT(t)}`+(cut>.05?` (${fmtT(T0)} on the clock, minus ${cut.toFixed(1)}s of streak bonus; longest streak ${cleanBest})`:'')+(r.isBest?', a new best':'')+'.'
    +(r.st<3?` Three stars under ${fmtT(CL.t3)}${r.st<2?`, two under ${fmtT(CL.t2)}`:''}.`:' The Crew Chief is impressed.')
    +(r.newUnlock?` ${r.newUnlock.name} is now unlocked!`:nx?'':' That\'s every job for now. More are on the way.'),false);
  $('againBtn').textContent='Replay';
  if(nx&&cleanUnl(i+1)){const b=$('nextBtn');b.hidden=false;b.textContent=`Next: ${nx.name}`;}}
// ---------- clean streaks: chain pickups for bonus growth (the combo) and time off your star time ----------
const STREAK_WINDOW=2.4; // seconds between pickups before a streak breaks (longer than the usual combo: it's a casual job)
const CLEAN_ARROWS=10; // arrows point to every remaining piece once this few are left in the job
const STREAK_MARKS=[10,25,50,75,100];
let cleanBonus=0,cleanBest=0;
const CLEAN_BONUS_CAP=.3; // the streak bonus can take off at most 30% of the clock
const cleanCut=()=>Math.min(cleanBonus,time*CLEAN_BONUS_CAP);
const cleanTime=()=>Math.max(0,time-cleanCut());
function junkEaten(f){const big=f.T.big;cleanBest=Math.max(cleanBest,combo);
  if(combo>=3)cleanBonus+=(big?.3:.08)*Math.min(1,combo/8);
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
  else if(T.k==='cocoa'){circ(g,0,0,r,'#f4f1ea');g.beginPath();g.arc(0,0,r,0,7);g.stroke();circ(g,0,0,r*.75,'#7a4b2a');circ(g,-r*.2,-r*.15,r*.18,'#fff');circ(g,r*.22,r*.1,r*.15,'#fff');
    g.strokeStyle='#f4f1ea';g.lineWidth=Math.max(2,r*.2);g.beginPath();g.arc(r*1.05,0,r*.35,-1.3,1.3);g.stroke();}
  else if(T.k==='mitten'){g.rotate(rot);g.fillStyle=['#e8453c','#3f7fd8','#3fae7a'][hue%3];g.beginPath();g.ellipse(0,r*.1,r*.62,r*.85,0,0,7);g.fill();g.stroke();
    g.beginPath();g.ellipse(-r*.62,-r*.05,r*.24,r*.42,-.5,0,7);g.fill();g.stroke();g.fillStyle='#fff';g.fillRect(-r*.62,r*.6,r*1.24,r*.3);g.strokeRect(-r*.62,r*.6,r*1.24,r*.3);}
  else if(T.k==='scarf'){g.rotate(rot);g.lineCap='round';const cols=[['#c77dff','#fff6e6'],['#e8453c','#f2c14e'],['#3fae7a','#fff6e6']][hue%3];
    for(let i=0;i<6;i++){g.strokeStyle=cols[i%2];g.lineWidth=r*.5;g.beginPath();const a=-r*1.1+i*r*.37;g.moveTo(a,Math.sin(i)*r*.3);g.lineTo(a+r*.37,Math.sin(i+1)*r*.3);g.stroke();}g.lineCap='butt';}
  else if(T.k==='ski'){g.rotate(rot);for(const s of[-1,1]){rr(g,-r*1.2,s*r*.25-r*.12,r*2.3,r*.24,r*.1);g.fillStyle=['#e8453c','#3f7fd8','#ffd23f'][hue%3];g.fill();g.stroke();circ(g,r*1.12,s*r*.25,r*.13,'#fff');}
    g.fillStyle='#2b2b2e';g.fillRect(-r*.15,-r*.45,r*.3,r*.9);}
  else if(T.k==='sled'){g.rotate(rot*.4);rr(g,-r*1.1,-r*.55,r*2,r*1.1,r*.25);g.fillStyle='#b5734a';g.fill();g.stroke();g.strokeStyle='rgba(60,35,20,.5)';
    for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(-r,i*r*.3);g.lineTo(r*.8,i*r*.3);g.stroke();}g.fillStyle='#e8453c';g.beginPath();g.ellipse(r*.95,0,r*.25,r*.55,0,0,7);g.fill();
    g.strokeStyle='#f2c14e';g.lineWidth=Math.max(1.5,r*.05);g.beginPath();g.moveTo(r*.9,-r*.3);g.quadraticCurveTo(r*1.5,0,r*.9,r*.3);g.stroke();}
  else if(T.k==='lift'){g.rotate(rot*.2);g.strokeStyle='#5a6070';g.lineWidth=Math.max(3,r*.06);g.beginPath();g.moveTo(-r*1.3,-r*.95);g.lineTo(r*1.3,-r*.95);g.moveTo(0,-r*.95);g.lineTo(0,-r*.6);g.stroke();
    g.lineWidth=Math.max(1.5,r*.03);g.strokeStyle='rgba(30,20,20,.55)';rr(g,-r*.85,-r*.6,r*1.7,r*1.4,r*.25);g.fillStyle=['#e8453c','#3f7fd8','#ffd23f'][hue%3];g.fill();g.stroke();
    g.fillStyle='#bfe3ff';for(const x of[-.55,-.05,.45])g.fillRect(x*r,-r*.4,r*.4,r*.45);g.fillStyle='#fff';g.fillRect(-r*.85,-r*.62,r*1.7,r*.12);}
  else if(T.k==='glowstick'){g.rotate(rot);const col=['#7affc0','#ff8ad0','#7ff9ff'][hue%3];g.fillStyle=col;g.globalAlpha=.35;rr(g,-r*1.4,-r*.55,r*2.8,r*1.1,r*.5);g.fill();g.globalAlpha=1;
    rr(g,-r*1.1,-r*.25,r*2.2,r*.5,r*.25);g.fill();g.stroke();}
  else if(T.k==='takeout'){g.rotate(rot*.5);g.fillStyle='#fff6ee';g.beginPath();g.moveTo(-r*.9,-r*.8);g.lineTo(r*.9,-r*.8);g.lineTo(r*.7,r*.8);g.lineTo(-r*.7,r*.8);g.closePath();g.fill();g.stroke();
    g.fillStyle='#e8453c';g.fillRect(-r*.3,-r*.2,r*.6,r*.5);g.strokeStyle='#8e939b';g.beginPath();g.arc(0,-r*.8,r*.5,Math.PI,0);g.stroke();}
  else if(T.k==='lantern'){g.fillStyle=['#e8453c','#ffd23f','#ff8ad0'][hue%3];g.beginPath();g.ellipse(0,0,r,r*.85,0,0,7);g.fill();g.stroke();
    g.strokeStyle='rgba(120,40,30,.45)';for(const k of[-.5,0,.5]){g.beginPath();g.ellipse(0,0,r*Math.abs(k)*1.6+1,r*.85,0,0,7);g.stroke();}
    g.fillStyle='#f2b04a';g.fillRect(-r*.4,-r*.98,r*.8,r*.22);g.fillRect(-r*.4,r*.76,r*.8,r*.22);circ(g,0,0,r*.25,'rgba(255,240,180,.7)');}
  else if(T.k==='sign'){g.rotate(rot*.3);rr(g,-r*1.1,-r*.6,r*2.2,r*1.2,r*.15);g.fillStyle='#1d1a2e';g.fill();g.stroke();
    g.font=`800 ${r*.75}px "Baloo 2",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=Math.max(1.5,r*.07);
    g.strokeStyle=['#ff5fa8','#5fd8ff','#7affc0'][hue%3];g.strokeText('CAT',0,r*.05);g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=Math.max(1,r*.03);
    g.beginPath();g.moveTo(r*.4,-r*.6);g.lineTo(r*.2,-r*.1);g.lineTo(r*.45,r*.15);g.lineTo(r*.3,r*.6);g.stroke();}
  else if(T.k==='arcade'){g.rotate(rot*.2);rr(g,-r*.8,-r*1.05,r*1.6,r*2.1,r*.15);g.fillStyle=['#5a3f9a','#2f5fb3','#b3261e'][hue%3];g.fill();g.stroke();
    g.fillStyle='#0b0820';g.fillRect(-r*.6,-r*.85,r*1.2,r*.9);g.fillStyle='rgba(127,249,255,.6)';g.fillRect(-r*.5,-r*.75,r*1,r*.7);
    circ(g,-r*.3,r*.45,r*.14,'#e8453c');circ(g,r*.15,r*.4,r*.1,'#ffd23f');circ(g,r*.42,r*.5,r*.1,'#7affc0');}
  else if(T.k==='truck'){g.rotate(rot*.2);rr(g,-r*1.2,-r*.55,r*2.4,r*1.1,r*.15);g.fillStyle=['#7fc8c0','#f4c28f','#ff9ad5'][hue%3];g.fill();g.stroke();
    for(let i=0;i<8;i++){g.fillStyle=i%2?'#fff':'#e8453c';g.fillRect(-r*.9+i*r*.2,-r*.75,r*.2,r*.25);}
    g.fillStyle='#1d2733';g.fillRect(r*.7,-r*.45,r*.4,r*.9);g.fillStyle='#fff6ee';g.fillRect(-r*.7,-r*.25,r*1.1,r*.5);
    g.fillStyle='#f2a259';g.beginPath();g.ellipse(-r*.15,0,r*.3,r*.16,0,0,7);g.moveTo(r*.15,0);g.lineTo(r*.32,-r*.14);g.lineTo(r*.32,r*.14);g.fill();
    for(const x of[-.75,.75])for(const y of[-.6,.6])circ(g,x*r,y*r,r*.12,'#222');}
  else if(T.k==='popcorn'){g.rotate(rot*.4);for(let i=0;i<4;i++){g.fillStyle=i%2?'#fff':'#e8453c';g.fillRect(-r*.7+i*r*.35,-r*.3,r*.35,r*1.1);}g.strokeRect(-r*.7,-r*.3,r*1.4,r*1.1);
    for(const[a,b]of[[-.45,-.5],[0,-.65],[.45,-.5],[-.2,-.8],[.25,-.85]])circ(g,a*r,b*r,r*.3,'#fff6c0');}
  else if(T.k==='ccandy'){g.rotate(rot);g.strokeStyle='#f4f1ea';g.lineWidth=Math.max(2,r*.15);g.beginPath();g.moveTo(r*.2,r*.2);g.lineTo(r*1.2,r*1.1);g.stroke();
    for(const[a,b,k]of[[0,0,.6],[-.35,-.25,.45],[.3,-.3,.45],[-.1,-.5,.4]])circ(g,a*r,b*r,r*k,['#ffb3e6','#9fd3ff','#ffe08a'][hue%3]);}
  else if(T.k==='balloon'){g.strokeStyle='rgba(60,60,60,.6)';g.lineWidth=1;g.beginPath();g.moveTo(0,r);g.quadraticCurveTo(r*.4,r*1.6,0,r*2.2);g.stroke();
    g.fillStyle=['#e8453c','#3f7fd8','#ffd23f'][hue%3];g.beginPath();g.ellipse(0,0,r*.85,r,0,0,7);g.fill();g.lineWidth=Math.max(1.5,r*.06);g.strokeStyle='rgba(30,20,20,.4)';g.stroke();
    circ(g,-r*.3,-r*.35,r*.2,'rgba(255,255,255,.6)');}
  else if(T.k==='plush'){g.rotate(rot*.3);const col=['#c9a27a','#c7a0ff','#9fd3ff'][hue%3];circ(g,-r*.55,-r*.55,r*.32,col);circ(g,r*.55,-r*.55,r*.32,col);
    g.beginPath();g.arc(0,0,r*.8,0,7);g.fillStyle=col;g.fill();g.stroke();circ(g,0,r*.2,r*.3,'#fff6ee');circ(g,-r*.28,-r*.15,r*.09,'#1a1416');circ(g,r*.28,-r*.15,r*.09,'#1a1416');circ(g,0,r*.12,r*.08,'#1a1416');}
  else if(T.k==='bumper'){g.rotate(rot*.3);rr(g,-r*1.05,-r*.8,r*2.1,r*1.6,r*.55);g.fillStyle='#222';g.fill();rr(g,-r*.85,-r*.62,r*1.7,r*1.24,r*.45);
    g.fillStyle=['#3f7fd8','#e8453c','#3fae7a'][hue%3];g.fill();g.stroke();circ(g,-r*.1,0,r*.35,'#1d2733');g.strokeStyle='#d7dde4';g.lineWidth=Math.max(2,r*.06);g.beginPath();g.moveTo(r*.45,0);g.lineTo(r*.45,-r*.9);g.stroke();}
  else if(T.k==='horse'){g.rotate(rot*.25);g.fillStyle='#f4f1ea';g.beginPath();g.ellipse(-r*.1,0,r*.85,r*.42,0,0,7);g.fill();g.stroke();
    g.beginPath();g.ellipse(r*.75,-r*.25,r*.35,r*.22,-.5,0,7);g.fill();g.stroke();g.fillStyle='#e8453c';g.fillRect(-r*.35,-r*.42,r*.45,r*.84);
    g.strokeStyle=['#c77dff','#3f7fd8','#f2b04a'][hue%3];g.lineWidth=Math.max(2,r*.1);g.beginPath();g.moveTo(r*.3,-r*.35);g.quadraticCurveTo(r*.5,-r*.6,r*.7,-r*.45);g.stroke();
    circ(g,-r*.1,0,r*.12,'#f2c14e');}
  else if(T.k==='tent'){g.rotate(rot*.2);const n=7;g.beginPath();for(let i=0;i<=n*2;i++){const a=i/(n*2)*Math.PI*2,q=i%2?r*.72:r*(.95+.08*Math.sin(i*3));g.lineTo(Math.cos(a)*q,Math.sin(a)*q);}g.closePath();
    g.save();g.clip();for(let i=0;i<n*2;i++){g.fillStyle=i%2?'#fff6ee':'#e8453c';g.beginPath();g.moveTo(0,0);g.arc(0,0,r*1.1,i*Math.PI/n,(i+1)*Math.PI/n);g.closePath();g.fill();}g.restore();
    g.stroke();circ(g,0,0,r*.12,'#f2c14e');g.fillStyle='#3f7fd8';g.beginPath();g.moveTo(0,0);g.lineTo(r*.35,-r*.1);g.lineTo(0,-r*.2);g.fill();}
  else if(T.k==='goo'){const col=['#9dff7a','#c77dff','#7ff9ff'][hue%3];for(const[a,b,k]of[[0,0,.75],[-.45,.2,.45],[.4,.3,.4],[.15,-.45,.35]])circ(g,a*r,b*r,r*k,col);
    circ(g,-r*.2,-r*.2,r*.15,'rgba(255,255,255,.6)');}
  else if(T.k==='tube'){g.rotate(rot);g.fillStyle='#c0c8e0';g.beginPath();g.moveTo(-r*1.1,-r*.45);g.lineTo(r*.6,-r*.3);g.lineTo(r*.6,r*.3);g.lineTo(-r*1.1,r*.45);g.closePath();g.fill();g.stroke();
    g.fillStyle=['#ff8ad0','#7affc0','#ffd23f'][hue%3];g.fillRect(r*.6,-r*.22,r*.45,r*.44);g.fillStyle='rgba(30,20,60,.5)';g.fillRect(-r*.7,-r*.12,r*.9,r*.24);}
  else if(T.k==='energy'){circ(g,0,0,r*1.3,'rgba(127,249,255,.18)');circ(g,0,0,r*.8,'#7ff9ff');circ(g,0,0,r*.45,'#e8ffff');
    g.strokeStyle='rgba(127,249,255,.8)';g.lineWidth=Math.max(1.5,r*.08);g.beginPath();g.ellipse(0,0,r*1.15,r*.4,rot,0,7);g.stroke();}
  else if(T.k==='gear'){g.rotate(rot);const n=8;g.beginPath();for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2,q=i%2?r*.78:r;g.lineTo(Math.cos(a-.12)*q,Math.sin(a-.12)*q);g.lineTo(Math.cos(a+.12)*q,Math.sin(a+.12)*q);}
    g.closePath();g.fillStyle=['#8f9ab0','#b0b8d0','#9a7fd8'][hue%3];g.fill();g.stroke();circ(g,0,0,r*.35,'#3b3957');circ(g,0,0,r*.15,'#c0c8e0');}
  else if(T.k==='probe'){g.rotate(rot*.4);g.fillStyle='#4f6a9a';g.fillRect(-r*1.25,-r*.25,r*.65,r*.5);g.fillRect(r*.6,-r*.25,r*.65,r*.5);g.strokeRect(-r*1.25,-r*.25,r*.65,r*.5);g.strokeRect(r*.6,-r*.25,r*.65,r*.5);
    g.beginPath();g.arc(0,0,r*.6,0,7);g.fillStyle='#c0c8e0';g.fill();g.stroke();circ(g,0,0,r*.3,'#b98aff');
    g.strokeStyle='#5a5878';g.beginPath();g.moveTo(0,-r*.6);g.lineTo(r*.2,-r*1.05);g.stroke();circ(g,r*.2,-r*1.05,r*.08,'#ff5fa8');}
  else if(T.k==='saucer'){g.rotate(-.35+rot*.1);drawUFO(g,0,0,r*.95,0);g.strokeStyle='#1a1416';g.lineWidth=Math.max(2,r*.03);g.beginPath();g.moveTo(-r*.6,-r*.05);g.lineTo(-r*.3,r*.15);g.lineTo(-r*.05,r*.02);g.lineTo(r*.2,r*.22);g.stroke();
    for(let i=0;i<3;i++)circ(g,r*(.5+i*.15),-r*(.3+i*.22),r*(.12+i*.05),`rgba(90,90,100,${.45-i*.12})`);}
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
