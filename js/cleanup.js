// Cat Orbs: Conquerors of Cat Earth - Clean-up Crew: a separate campaign of cleaning jobs.
// Each job is a fenced-off area full of themed junk. Swallow every last piece; the faster, the more stars.
// ---------- junk: themed items for each job (kinds are drawn in drawJunk below) ----------
// r = size, v = growth value, n = how many. A cat must be EAT x bigger than an item to swallow it.
const JUNK={
  can:    {k:'can',    v:6, r:7, glow:'#bff3ff'},
  wrapper:{k:'wrapper',v:7, r:8, glow:'#ffe08a'},
  cup:    {k:'cup',    v:10,r:11,glow:'#ffb3c7'},
  pizza:  {k:'pizza',  v:24,r:24,glow:'#ffcf6b'},
  bag:    {k:'bag',    v:34,r:34,glow:'#a8f0b0'},
  // beach junk. drift = how fast it wanders on the wind (it bounces off the fence)
  bottle: {k:'bottle', v:7, r:8, glow:'#9ff3e0'},
  flop:   {k:'flop',   v:8, r:10,glow:'#ffb3c7'},
  ball:   {k:'ball',   v:14,r:14,glow:'#fff36b',drift:70},
  cooler: {k:'cooler', v:30,r:30,glow:'#7fd0ff'},
  brolly: {k:'brolly', v:46,r:46,glow:'#ff9e9e',drift:22}};
for(const T of Object.values(JUNK)){T.big=T.r>=24;T.junk=1;}
// zone: radius of the job site. t3/t2: finish time (seconds) for three and two stars.
const CLEAN_LEVELS=[
  {id:'picnic',name:'Picnic Park',theme:'bay',seed:7101,zone:1000,wx:'clear',tod:'day',t3:60,t2:100,
    junk:[['can',30],['wrapper',25],['cup',16],['pizza',8],['bag',5]],
    blurb:'A sunny park after a very messy picnic. Cans, wrappers, cups, pizza boxes and trash bags everywhere.'},
  {id:'beach',name:'Breezy Boardwalk',theme:'beach',seed:7202,zone:1400,wx:'clear',tod:'day',t3:90,t2:150,
    junk:[['bottle',38],['flop',30],['ball',16],['cooler',9],['brolly',5]],
    blurb:'A windy beach after a festival. Bottles, flip-flops and coolers everywhere, and the wind keeps the beach balls and broken umbrellas rolling.'}];
// wind: drifting junk wanders and bounces off the fence
function junkTick(dt){for(const f of foods){const v=f.T.drift;if(!v)continue;
  if(f.vx===undefined){const a=Math.random()*7;f.vx=Math.cos(a)*v;f.vy=Math.sin(a)*v;}
  const a=Math.atan2(f.vy,f.vx)+(Math.random()-.5)*dt*1.5;f.vx=Math.cos(a)*v;f.vy=Math.sin(a)*v;
  f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=dt*v/f.r*.6;
  const d=Math.hypot(f.x,f.y),L=arenaR-f.r-10;if(d>L){f.x*=L/d;f.y*=L/d;const nx=f.x/d,ny=f.y/d,dot=f.vx*nx+f.vy*ny;if(dot>0){f.vx-=2*dot*nx;f.vy-=2*dot*ny;}}}}
let clean={sel:0,stars:[],best:[],sawIntro:0};
try{const s=JSON.parse(localStorage.getItem('catorb-clean')||'null');if(s)clean=Object.assign(clean,s);}catch(e){}
const saveClean=()=>{try{localStorage.setItem('catorb-clean',JSON.stringify(clean));}catch(e){}};
const cleanUnl=i=>i===0||(clean.stars[i-1]||0)>0;
let CL=CLEAN_LEVELS[0];
const junkTotal=L=>L.junk.reduce((s,[,n])=>s+n,0);
// fill the fenced zone with this job's junk (biggest first so they get the roomiest spots)
function placeJunk(){foods=[];
  for(const[k,n]of CL.junk.slice().sort((a,b)=>JUNK[b[0]].r-JUNK[a[0]].r)){const T=Object.assign({n},JUNK[k]);for(let i=0;i<n;i++)foods.push(placeFood(T));}}
function cleanNote(){const L=CLEAN_LEVELS[clean.sel],b=clean.best[clean.sel];
  return `${L.name}: ${L.blurb} Swallow all ${junkTotal(L)} pieces. Three stars under ${fmtT(L.t3)}, two under ${fmtT(L.t2)}.`+(b?` Your best ${fmtT(b)}.`:'')+' More jobs coming soon.';}
function buildClean(){const box=$('cleanList');if(!box)return;box.innerHTML='';if(!cleanUnl(clean.sel))clean.sel=0;
  CLEAN_LEVELS.forEach((L,i)=>{const u=cleanUnl(i),st=clean.stars[i]||0,b=document.createElement('button');b.type='button';
    b.className='lvl'+(i===clean.sel?' on':'')+(u?'':' locked');b.setAttribute('aria-pressed',i===clean.sel?'true':'false');
    b.innerHTML=`<span class="n">${i+1}</span><span class="t"><b></b><small></small></span><span class="s" aria-label="${st} of 3 stars">${u?starStr(st):'Locked'}</span>`;
    b.querySelector('b').textContent=L.name;b.querySelector('small').textContent=u?`Job ${i+1} · ${junkTotal(L)} pieces of junk`:`Finish ${CLEAN_LEVELS[i-1].name} to unlock`;
    b.addEventListener('click',()=>{if(!u)return;clean.sel=i;saveClean();buildClean();setMode('clean');});box.appendChild(b);});}
// the job is done when the last piece of junk is gone
function cleanWin(){king=player;finT=0;state='finale';snd.win();stats.survived=time;if(!stats.frozen)stats.frozen=Object.assign({},stats);
  const i=CLEAN_LEVELS.indexOf(CL),t=time,st=t<=CL.t3?3:t<=CL.t2?2:1,pb=clean.best[i],fresh=i+1<CLEAN_LEVELS.length&&!cleanUnl(i+1);
  clean.stars[i]=Math.max(clean.stars[i]||0,st);if(!pb||t<pb)clean.best[i]=t;saveClean();
  if(!recorded){recorded=true;prog.games++;prog.treats+=myTreats;saveProg();}
  king.clean={st,isBest:!!pb&&t<pb,first:!pb,newUnlock:fresh&&cleanUnl(i+1)?CLEAN_LEVELS[i+1]:null};toast('Spotless! Job done!');}
function showCleanEnd(){const r=king.clean,t=stats.survived||time,i=CLEAN_LEVELS.indexOf(CL),nx=CLEAN_LEVELS[i+1];
  showEnd('Job done!',`${starStr(r.st)}  You cleaned up ${CL.name} in ${fmtT(t)}`+(r.isBest?' (a new best)':'')+'.'
    +(r.st<3?` Three stars under ${fmtT(CL.t3)}${r.st<2?`, two under ${fmtT(CL.t2)}`:''}.`:' The Crew Chief is impressed.')
    +(r.newUnlock?` ${r.newUnlock.name} is now unlocked!`:nx?'':' That\'s every job for now. More are on the way.'),false);
  $('againBtn').textContent='Replay';
  if(nx&&cleanUnl(i+1)){const b=$('nextBtn');b.hidden=false;b.textContent=`Next: ${nx.name}`;}}
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
    g.strokeStyle='#8a6236';g.lineWidth=Math.max(2,r*.08);g.beginPath();g.moveTo(0,0);g.lineTo(r*1.1,r*.5);g.stroke();circ(g,0,0,r*.1,'#8a6236');}}
