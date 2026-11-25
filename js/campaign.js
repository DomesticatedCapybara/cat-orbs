// Cat Orbs: Conquerors of Cat Earth - Campaign: conquer Cat Earth one continent at a time, then the world arena
// ---------- themes: colors and prop looks for each continent's city ----------
const SHADOW=(a)=>`rgba(0,0,0,${a})`;
const THEMES={
  bay:{water:'#1f4e6b',road:'#2b2d34',lane:'rgba(235,200,90,.75)',zebra:'rgba(255,255,255,.65)',pave:'#868b94',paveEdge:'#5d616a',lot:'#6f747c',
    grass:'#3e7a46',path:'#cdb98a',pond:'#3c8fb8',pondEdge:'#7fc4dd',plaza:'#bdb2a0',plazaLine:'#ab9f8c',plazaPot:'#8b7b62',parking:'#474950',
    field:'#4c9a52',field2:'#469049',wall:'#b9ab8e',
    roofs:['#b85c45','#6d7a8a','#c9b48f','#4f8a8b','#8c5e7a','#d18f52','#5d6b52','#a3a7ad','#7a4b3a','#5a6f9a'],
    cars:['#e84a3c','#f2c14e','#3f7fd8','#f0f0f0','#2b2b2b','#3fae7a','#9b59b6'],
    tree:[[.3,.35,1,SHADOW(.3)],[0,0,1,'#2e6a38'],[-.25,-.25,.6,'#4f9a58']],
    bush:[[.25,.25,1,SHADOW(.25)],[0,0,1,'#3b7d3f'],[-.35,-.2,.6,'#56a05a'],[.4,.15,.45,'#4a9150']]},
  beach:{water:'#1b8fb3',road:'#3b3e46',lane:'rgba(255,255,255,.7)',zebra:'rgba(255,255,255,.65)',pave:'#e3cf9c',paveEdge:'#c2a873',lot:'#d6c08c',
    grass:'#ecd9a4',path:'#b98f5f',pond:'#3fc4d8',pondEdge:'#a8ecf2',plaza:'#f2e6c8',plazaLine:'#e0cfa6',plazaPot:'#5aa06a',parking:'#55585f',
    field:'#ecd8a0',field2:'#e5cf94',wall:'#f0dfb0',
    roofs:['#f2a7a0','#9fd3e0','#f6e3a1','#b5e0b0','#f4c28f','#e9e4da','#c3b1e1','#7fc8c0'],
    cars:['#ff6b5a','#ffd23f','#3fc4d8','#ffffff','#7ed37a','#ff9ad5'],
    // palm trees (fronds around a trunk) and beach umbrellas
    tree:[[.35,.4,1,SHADOW(.22)],[0,0,.55,'#2f8a45'],[-.55,0,.45,'#4cb05a'],[.55,0,.45,'#4cb05a'],[0,-.55,.45,'#4cb05a'],[0,.55,.45,'#4cb05a'],[0,0,.22,'#8a6236']],
    bush:[[.3,.3,1,SHADOW(.2)],[0,0,1,'#ff6b5a'],[0,0,.72,'#fff6e6'],[0,0,.45,'#ff6b5a'],[0,0,.16,'#fff6e6']]},
  desert:{water:'#2a6d86',road:'#4b3f37',lane:'rgba(255,230,170,.7)',zebra:'rgba(255,240,210,.6)',pave:'#d9bb8b',paveEdge:'#b5915c',lot:'#c8a36f',
    grass:'#d7b47c',path:'#b0844d',pond:'#2aa6b8',pondEdge:'#9fe0e0',plaza:'#dc9c6c',plazaLine:'#c57f52',plazaPot:'#4f8a4a',parking:'#5c4d42',
    field:'#cfa86c',field2:'#c79f62',wall:'#c9a06a',
    roofs:['#d98c5f','#e0b07a','#c7745a','#e8c9a0','#b8603f','#f0dcc0','#a9704a'],
    cars:['#c9483a','#e8c06a','#6a8fb0','#efe6d6','#5b4a3e','#8aa36a'],
    // cacti and tumbleweeds
    tree:[[.3,.35,.85,SHADOW(.25)],[0,0,.7,'#3f7a46'],[-.62,-.1,.38,'#3f7a46'],[.62,.12,.38,'#3f7a46'],[-.15,-.2,.36,'#5e9e5c'],[0,0,.1,'#f4d27a']],
    bush:[[.25,.25,1,SHADOW(.2)],[0,0,1,'#a8874f'],[-.3,-.2,.55,'#c6a565'],[.35,.2,.4,'#8f7040']]},
  neon:{water:'#101632',road:'#17181f',lane:'rgba(255,95,210,.8)',zebra:'rgba(120,230,255,.6)',pave:'#353850',paveEdge:'#22243a',lot:'#2a2d40',
    grass:'#1d4436',path:'#8f6fb8',pond:'#2d6bd6',pondEdge:'#6fd8ff',plaza:'#3a3352',plazaLine:'#4d4570',plazaPot:'#c77dff',parking:'#202230',
    field:'#1f4c3a',field2:'#1c4535',wall:'#6a5aa0',
    roofs:['#ff5fa8','#5fd8ff','#c77dff','#ffd25f','#5fffb0','#ff8a5f','#7a7fff'],
    cars:['#ff5fa8','#5fd8ff','#ffd25f','#5fffb0','#c77dff','#f0f0f0'],
    // round trees and giant balls of yarn
    tree:[[.3,.35,1,SHADOW(.35)],[0,0,1,'#2b6a52'],[-.25,-.25,.6,'#3f9a78']],
    bush:[[.25,.25,1,SHADOW(.3)],[0,0,1,'#e05a9a'],[-.2,-.2,.55,'#ff8cc0'],[.22,.25,.25,'#c7457f']]},
  snow:{water:'#33617f',road:'#596071',lane:'rgba(255,255,255,.75)',zebra:'rgba(255,255,255,.7)',pave:'#e7edf4',paveEdge:'#b5c3d4',lot:'#d3dce8',
    grass:'#f3f7fb',path:'#c3d1e2',pond:'#9fd2ea',pondEdge:'#e8f6fd',plaza:'#dfe7f1',plazaLine:'#c9d4e2',plazaPot:'#2f6a48',parking:'#4f5565',
    field:'#bfe2f2',field2:'#b5dcee',wall:'#e2e9f2',
    roofs:['#e8eef6','#b34a3f','#4f6f8f','#f1f4f9','#7a5a4a','#5f8a6a','#d9e2ee'],
    cars:['#c9483a','#2f5fb3','#f2c14e','#2b2b2b','#3fae7a','#f0f0f0'],
    // snowy pines and snowmen
    tree:[[.3,.35,1,'rgba(20,40,70,.25)'],[0,0,1,'#1f5a3c'],[0,0,.7,'#2f7a50'],[0,0,.36,'#eaf3fb']],
    bush:[[.25,.3,1,'rgba(20,40,70,.22)'],[0,.18,.95,'#ffffff'],[0,-.55,.6,'#f6f9fd'],[0,-.55,.13,'#ff8a3a']]},
  // the alien mothership's arena: metal decks, glowing pools, alien plants and light pods
  arena:{water:'#0b0820',road:'#2a2440',lane:'rgba(120,255,170,.75)',zebra:'rgba(170,240,255,.55)',pave:'#5a5878',paveEdge:'#3b3957',lot:'#4a4866',
    grass:'#3f2f5e',path:'#7affc0',pond:'#36e08c',pondEdge:'#b8ffd9',plaza:'#6b7390',plazaLine:'#59607c',plazaPot:'#36e08c',parking:'#2f2c45',
    field:'#33285a',field2:'#2d2350',wall:'#8a7fd0',
    roofs:['#8fa0c0','#6f7fa8','#b0b8d0','#5fd0c0','#9a7fd8','#c0c8e0','#4f6a9a'],
    cars:['#7affc0','#c7a0ff','#9ff3ff','#e0e6f0','#ff9ad5'],
    tree:[[.3,.35,1,SHADOW(.35)],[0,0,1,'#1f7a6a'],[-.3,-.25,.45,'#5fe0b0'],[.3,.2,.35,'#5fe0b0'],[0,0,.16,'#e0ff8a']],
    bush:[[.25,.25,1,SHADOW(.3)],[0,0,1,'#3a2f6a'],[0,0,.62,'#b98aff'],[0,0,.3,'#f0e0ff']]}};
let TH=THEMES.bay,TH_NAME='bay';
// King of the Hill and Grow Rush use the continent maps too: a random one each match, or one per day for Grow Rush
const MAPS=['bay','beach','desert','neon','snow','arena'];
const mapName=th=>(LEVELS.find(L=>L.theme===th)||{name:'Whisker Bay'}).name;
function mapFor(m){if(m==='camp')return LV.theme;if(SET.map!=='random'&&THEMES[SET.map])return SET.map;
  return m==='solo'?MAPS[dailySeed()%MAPS.length]:MAPS[Math.floor(Math.random()*MAPS.length)];}
function setTheme(n){TH_NAME=THEMES[n]?n:'bay';TH=THEMES[TH_NAME];if(typeof mkBatch==='function')mkBatch();}

// ---------- the campaign: one city per continent, then the arena ----------
// goal: size = reach that size; cats = absorb that many cats; win = last cat standing.
// t3/t2: finish time (seconds) for three and two stars. pin: where the level sits on Cat Earth.
const LEVELS=[
  {id:'bay',name:'Whisker Bay',region:'Cat-Head Continent',theme:'bay',seed:1101,rivals:12,diff:'easy',wx:'clear',tod:'day',
    goal:{type:'size',n:300},t3:50,t2:90,pin:[-17000,-9000],blurb:'A busy harbor city on the cat-head continent. Grow big enough to swallow it.'},
  {id:'beach',name:'Paw Print Isles',region:'Paw Print Archipelago',theme:'beach',seed:2202,rivals:18,diff:'easy',wx:'clear',tod:'day',
    goal:{type:'cats',n:6},t3:90,t2:150,pin:[16000,13000],blurb:'Sunny beach towns with palms and umbrellas. Hunt down six rival cats.'},
  {id:'desert',name:'Fishbone Dunes',region:'Fish Continent',theme:'desert',seed:3303,rivals:24,diff:'normal',wx:'clear',tod:'dusk',
    goal:{type:'size',n:700},t3:105,t2:165,pin:[15500,-15500],blurb:'An adobe city among cacti at sunset. Rivals here bite back. Reach size 700.'},
  {id:'neon',name:'Yarnball Island',region:'Yarn-Ball Island',theme:'neon',seed:4404,rivals:28,diff:'normal',wx:'rain',tod:'night',
    goal:{type:'cats',n:10},t3:120,t2:180,pin:[-13000,19000],blurb:'A rainy neon city that never sleeps. Absorb ten rival cats.'},
  {id:'snow',name:'Frostwhisker Pole',region:'Northern Ice Cap',theme:'snow',seed:5505,rivals:24,diff:'normal',wx:'snow',tod:'day',
    goal:{type:'win'},t3:150,t2:210,pin:[0,-36500],blurb:'A snowy village on the ice cap. Be the last cat standing.'},
  {id:'arena',name:'The Alien Arena',region:'Alien mothership, in orbit',theme:'arena',seed:6606,rivals:30,diff:'normal',wx:'clear',tod:'day',
    goal:{type:'win'},t3:180,t2:240,pin:[31000,-31000],arena:true,alien:true,champs:true,
    blurb:'An alien invader has abducted the best cat orbs and dropped them into its shrinking arena. Orb for the fate of Earth.'}];
const CHAMPS=['Bay Boss','Isle Queen','Dune King','Yarn Duke','Frost Lord'];
let camp={sel:0,stars:[],best:[]};
try{const s=JSON.parse(localStorage.getItem('catorb-camp')||'null');if(s)camp=Object.assign(camp,s);}catch(e){}
const saveCamp=()=>{try{localStorage.setItem('catorb-camp',JSON.stringify(camp));}catch(e){}};
const campUnl=i=>i===0||(camp.stars[i-1]||0)>0;
let LV=LEVELS[0];
const goalText=L=>L.goal.type==='size'?`Reach size ${L.goal.n}`:L.goal.type==='cats'?`Absorb ${L.goal.n} cats`:'Be the last cat standing';
const starStr=n=>'★'.repeat(n)+'☆'.repeat(3-n);
function starsFor(L,t){return t<=L.t3?3:t<=L.t2?2:1;}
// the planet's land shapes, drawn small for the campaign map (see earthLand in city.js)
function drawCampMap(){const cv=$('campMap');if(!cv)return;const d=Math.min(2,window.devicePixelRatio||1),S=cv.clientWidth||260;
  cv.width=S*d;cv.height=S*d;const g=cv.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,S,S);
  const k=S/(PLANET_R*2.3);g.save();g.translate(S/2,S/2);g.scale(k,k);
  const oc=g.createRadialGradient(-PLANET_R*.35,-PLANET_R*.35,PLANET_R*.1,0,0,PLANET_R);oc.addColorStop(0,'#2f7fae');oc.addColorStop(1,'#163c5a');
  g.fillStyle='rgba(120,200,255,.25)';g.beginPath();g.arc(0,0,PLANET_R*1.07,0,7);g.fill();
  g.fillStyle=oc;g.beginPath();g.arc(0,0,PLANET_R,0,7);g.fill();earthLand(g,false);g.restore();
  // pins: number inside a circle; done levels show a check and stars, locked ones a lock
  LEVELS.forEach((L,i)=>{const x=S/2+L.pin[0]*k,y=S/2+L.pin[1]*k,on=i===camp.sel,u=campUnl(i),st=camp.stars[i]||0,R=L.arena?15:12;
    if(L.alien&&u){g.fillStyle='rgba(122,255,192,.22)';g.beginPath();g.moveTo(x-6,y+6);g.lineTo(x+6,y+6);g.lineTo(S/2+8,S/2+PLANET_R*k*.55);g.lineTo(S/2-22,S/2+PLANET_R*k*.4);g.closePath();g.fill();}
    if(L.arena){g.strokeStyle='rgba(122,255,192,.9)';g.lineWidth=2;g.setLineDash([3,3]);g.beginPath();g.arc(x,y,R+6,0,7);g.stroke();g.setLineDash([]);}
    g.fillStyle=on?'#fff4e0':u?'#3d6b5e':'#6b6b6b';g.strokeStyle=on?'#f4a259':'#fff';g.lineWidth=on?4:2;g.beginPath();g.arc(x,y,R,0,7);g.fill();g.stroke();
    g.fillStyle=on?'#3d2b1f':'#fff';g.font=`800 ${L.arena?13:12}px "Baloo 2",sans-serif`;g.textAlign='center';g.textBaseline='middle';
    if(L.alien&&u){ufoIcon(g,x,y,R*.9);}else g.fillText(u?(L.arena?'♛':String(i+1)):'🔒',x,y+1);
    if(st){g.font='700 10px sans-serif';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.7)';g.strokeText(starStr(st),x,y+R+9);g.fillStyle='#ffd86b';g.fillText(starStr(st),x,y+R+9);}});}
function buildCamp(){const box=$('campList');if(!box)return;box.innerHTML='';
  if(!campUnl(camp.sel))camp.sel=0;
  LEVELS.forEach((L,i)=>{const u=campUnl(i),st=camp.stars[i]||0,b=document.createElement('button');b.type='button';
    b.className='lvl'+(i===camp.sel?' on':'')+(u?'':' locked')+(L.arena?' final':'');b.setAttribute('aria-pressed',i===camp.sel?'true':'false');
    b.innerHTML=`<span class="n">${L.arena?'♛':i+1}</span><span class="t"><b></b><small></small></span><span class="s" aria-label="${st} of 3 stars">${u?starStr(st):'Locked'}</span>`;
    b.querySelector('b').textContent=L.name;b.querySelector('small').textContent=u?`${L.region} · ${goalText(L)}`:`Finish ${LEVELS[i-1].name} to unlock`;
    b.addEventListener('click',()=>{if(!u){$('modeNote').textContent=`Locked. Finish ${LEVELS[i-1].name} first.`;return;}camp.sel=i;saveCamp();buildCamp();setMode('camp');});
    box.appendChild(b);});
  drawCampMap();}
function campNote(){const L=LEVELS[camp.sel],b=camp.best[camp.sel];
  return `${L.name}: ${L.blurb} Three stars under ${fmtT(L.t3)}, two under ${fmtT(L.t2)}.`+(b?` Your best ${fmtT(b)}.`:'')+(camp.galaxy?' Coming soon: the Intergalactic Circuit.':'');}
// called when the player completes the current level
function campComplete(t){const i=LEVELS.indexOf(LV),st=starsFor(LV,t),prev=camp.stars[i]||0,pb=camp.best[i];
  const fresh=i+1<LEVELS.length&&!campUnl(i+1);
  camp.stars[i]=Math.max(prev,st);if(!pb||t<pb)camp.best[i]=t;saveCamp();
  return{st,isBest:!!pb&&t<pb,newUnlock:fresh?LEVELS[i+1]:null};}
// ---------- the regulars: the same 9 rival cats compete with you on every continent ----------
// fur: index into FUR. Duchess is your campaign nemesis: she hunts you everywhere and grows tougher each level.
const REGULARS=[
  {n:'Duchess',fur:2,pers:'nemesis',bio:'Your nemesis. She has sworn to conquer Cat Earth before you do.'},
  {n:'Biscuit',fur:4,pers:'forager',bio:'Never met a snack she didn\'t like.'},
  {n:'Tank',fur:5,pers:'hunter',bio:'Big appetite, bigger ego.'},
  {n:'Pixel',fur:1,pers:'coward',bio:'Quick, nervous and very hard to catch.'},
  {n:'Mochi',fur:3,pers:'forager',bio:'Soft, round and always eating.'},
  {n:'Rusty',fur:0,pers:'hunter',bio:'A scrappy street cat who loves a chase.'},
  {n:'Smokey',fur:6,pers:'forager',bio:'Slow and steady wins the snacks.'},
  {n:'Biddy Blas',fur:7,pers:'coward',bio:'Small, sneaky and surprisingly sly.'},
  {n:'Patches',fur:8,pers:'hunter',bio:'Patient. Waits for you to slip up.'}];
const NEMESIS='Duchess';
// Duchess's line at the start of each continent (shown in her speech banner)
const TAUNTS=['Oh, I see they\'re letting any old rabble into the Pro Cat Orbing League...',
  'Back for more? Enjoy the beach. It\'s the last one you\'ll see.','The desert dries out little orbs like you.',
  'Lost in the neon? Don\'t worry, I\'ll find you.','Cold paws, cold heart. Come and get me.','Abducted together, huh? Only one of us gets to save Earth.'];
const PLACE_PTS=[12,9,7,5,4,3,2,1,0,0];
camp.res=camp.res||[];camp.h2h=camp.h2h||{you:0,her:0};
// spawned rivals: the first nine become the regulars (after the arena's champions)
function campRegulars(list,i0){const li=LEVELS.indexOf(LV);REGULARS.forEach((R,k)=>{const c=list[i0+k];if(!c)return;
  c.name=R.n;c.fur=FUR[R.fur];c.pers=R.pers;c.reg=1;if(R.n===NEMESIS){c.t=c.r=START_R*(1+.08*li);c.nem=1;}});}
// finishing order among you and the regulars: survivors by size, then fallen cats by how long they lasted
function campPlaces(){const me={name:'You',alive:player.alive,r:player.r,deadT:player.deadT||0,me:1};
  const L=cats.filter(c=>c.reg).map(c=>({name:c.name,alive:c.alive&&!c.campEaten,r:c.r,deadT:c.deadT||0})).concat(me);
  L.sort((a,b)=>(b.me&&king===player)-(a.me&&king===player)||(b.alive-a.alive)||(a.alive?b.r-a.r:b.deadT-a.deadT));return L.map(x=>x.name);}
function campStandings(){const pts={You:0};REGULARS.forEach(R=>pts[R.n]=0);
  for(const order of camp.res)if(order)order.forEach((n,k)=>{if(n in pts)pts[n]+=PLACE_PTS[k]||0;});
  return Object.entries(pts).sort((a,b)=>b[1]-a[1]||(a[0]==='You'?-1:b[0]==='You'?1:0));}
function buildStandings(){const el=$('campStand');if(!el)return;const S=campStandings(),done=camp.res.filter(Boolean).length;
  el.innerHTML=`<div class="lbl">Rival standings <span style="font-weight:500;opacity:.7">${done?`after ${done} level${done>1?'s':''}`:'· finish levels to score points'}</span></div>`+
    `<ol>${S.map(([n,p])=>{const R=REGULARS.find(r=>r.n===n);return `<li class="${n==='You'?'me':''}${n===NEMESIS?' nem':''}" title="${R?R.bio.replace(/"/g,'&quot;'):''}"><span>${n}${n===NEMESIS?' <i>nemesis</i>':''}</span><b>${p}</b></li>`;}).join('')}</ol>`+
    `<p class="h2h">Head to head with ${NEMESIS}: you swallowed her ${camp.h2h.you} time${camp.h2h.you===1?'':'s'}, she swallowed you ${camp.h2h.her} time${camp.h2h.her===1?'':'s'}.</p>`;}

// ---------- the alien: a flying saucer with a little green pilot ----------
function drawUFO(g,x,y,r,beam){const t=clock;
  if(beam>0){g.fillStyle=`rgba(122,255,192,${.18*beam})`;g.beginPath();g.moveTo(x-r*.35,y+r*.2);g.lineTo(x+r*.35,y+r*.2);g.lineTo(x+r*1.3,y+r*3.2);g.lineTo(x-r*1.3,y+r*3.2);g.closePath();g.fill();}
  circ(g,x+r*.12,y+r*.5,r*.9,'rgba(0,0,0,.25)');
  g.fillStyle='#8f9ab0';g.beginPath();g.ellipse(x,y+r*.12,r,r*.34,0,0,7);g.fill();
  g.fillStyle='#c3cad8';g.beginPath();g.ellipse(x,y,r*.98,r*.26,0,0,7);g.fill();
  // the pilot under its glass dome
  g.save();g.beginPath();g.ellipse(x,y-r*.12,r*.46,r*.42,0,Math.PI,0);g.closePath();g.clip();
  g.fillStyle='rgba(159,243,255,.55)';g.fillRect(x-r,y-r,r*2,r);
  circ(g,x,y-r*.1,r*.2,'#7be37b');g.fillStyle='#10131a';g.beginPath();g.ellipse(x-r*.08,y-r*.13,r*.06,r*.085,-.4,0,7);g.ellipse(x+r*.08,y-r*.13,r*.06,r*.085,.4,0,7);g.fill();
  g.strokeStyle='#7be37b';g.lineWidth=r*.03;g.beginPath();g.moveTo(x-r*.08,y-r*.27);g.lineTo(x-r*.14,y-r*.38);g.moveTo(x+r*.08,y-r*.27);g.lineTo(x+r*.14,y-r*.38);g.stroke();
  g.restore();
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=r*.03;g.beginPath();g.ellipse(x,y-r*.12,r*.46,r*.42,0,Math.PI,0);g.stroke();
  for(let i=0;i<7;i++){const a=(i/6-.5)*2.4,on=Math.floor(t*6+i)%3===0;circ(g,x+Math.sin(a)*r*.82,y+r*.12+Math.cos(a)*r*.1,r*.06,on?'#fff36b':'#7affc0');}}
function ufoIcon(g,x,y,r){drawUFO(g,x,y+r*.15,r,0);}
// ---------- story scenes ----------
const ARENA_STORY=()=>{const top=campStandings().slice(0,3).map(([n])=>n==='You'?'you':n);
  return[{scene:0,text:'Far above Cat Earth, something has been watching the cat orbs conquer one continent after another…'},
    {scene:1,text:`An alien invader! Impressed by how the cat orbs fought across the continents (especially ${top[0]}, ${top[1]} and ${top[2]}), it beams up the best of them: you, Duchess, the regulars and the five continental champions.`},
    {scene:2,text:'"ORB IT OUT IN MY ARENA," it booms. "THE LAST ORB STANDING DECIDES THE FATE OF EARTH." The arena floor begins to shrink…'}];};
let storyPages=[],storyI=0,storyDone=null,storyRaf=0,storyT0=0;
function showStory(pages,done){storyPages=pages;storyI=0;storyDone=done;$('story').hidden=false;storyT0=performance.now();storyPage();
  cancelAnimationFrame(storyRaf);const tick=n=>{if($('story').hidden)return;drawStory((n-storyT0)/1000);storyRaf=requestAnimationFrame(tick);};storyRaf=requestAnimationFrame(tick);}
function storyPage(){const p=storyPages[storyI];$('storyText').textContent=p.text;$('storyNext').textContent=storyI<storyPages.length-1?'Next':'To the arena!';storyT0=performance.now();}
function storyEnd(){$('story').hidden=true;cancelAnimationFrame(storyRaf);const f=storyDone;storyDone=null;if(f)f();}
function drawStory(t){const cv=$('storyCv'),d=Math.min(2,window.devicePixelRatio||1),Wd=cv.clientWidth||300,Hd=cv.clientHeight||200;
  if(cv.width!==Wd*d){cv.width=Wd*d;cv.height=Hd*d;}const g=cv.getContext('2d');g.setTransform(d,0,0,d,0,0);
  g.fillStyle='#070a14';g.fillRect(0,0,Wd,Hd);for(const[x,y,r,s]of STARS_BG){g.globalAlpha=.35+.5*Math.abs(Math.sin(t*1.3+s*9));circ(g,x*Wd,y*Hd,r*.8,'#fff');}g.globalAlpha=1;
  const sc=storyPages[storyI].scene,pr=Hd*.62,px=Wd/2,py=Hd+pr*.42;
  g.save();g.translate(px,py);g.scale(pr/PLANET_R,pr/PLANET_R);g.fillStyle='rgba(120,200,255,.25)';g.beginPath();g.arc(0,0,PLANET_R*1.06,0,7);g.fill();
  g.fillStyle='#24608a';g.beginPath();g.arc(0,0,PLANET_R,0,7);g.fill();earthLand(g,false);g.restore();
  const ux=px+(sc===0?Math.sin(t*.9)*Wd*.28:0),uy=Hd*.2+Math.sin(t*2)*4,ur=Math.min(Wd,Hd)*.13;
  if(sc===2){ // the arena: a glowing ring with the abducted orbs inside
    const ax=px,ay=Hd*.5,rr=Math.min(Wd,Hd)*.22*(1-.25*Math.min(1,t/6));g.strokeStyle='rgba(122,255,192,.9)';g.lineWidth=3;g.setLineDash([8,6]);g.lineDashOffset=-t*20;g.beginPath();g.arc(ax,ay,rr,0,7);g.stroke();g.setLineDash([]);
    REGULARS.concat([{fur:9},{fur:10},{fur:0}]).forEach((R,i)=>{const a=i*2.1+t*.6*(i%2?1:-1),q=rr*(.25+.6*((i*37)%10)/10);circ(g,ax+Math.cos(a)*q,ay+Math.sin(a)*q,i===0?7:5,FUR[R.fur].b);});
    circ(g,ax,ay,8,FUR[prog.pick]?FUR[prog.pick].b:'#f4a259');g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(ax,ay,9,0,7);g.stroke();
    drawUFO(g,px,Hd*.13,ur*.7,0);return;}
  drawUFO(g,ux,uy,ur,sc===1?1:.5+.5*Math.sin(t*3));
  if(sc===1)REGULARS.forEach((R,i)=>{const k=((t*.35+i/9)%1),x=ux+Math.sin(i*2.3+t*2)*ur*.6*(1-k),y=Hd*.85-(Hd*.85-uy-ur*.3)*k;g.globalAlpha=Math.min(1,(1-k)*3);circ(g,x,y,5+2*(1-k),FUR[R.fur].b);g.globalAlpha=1;});}

// ---------- Duchess's speech banner ----------
let sayTimer=0;
function say(name,text,fur,dur){const el=$('say');if(!el)return;$('sayName').textContent=name;$('sayText').textContent=`"${text}"`;
  const cv=$('sayCv'),g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
  try{const c=makeCat(0,0,30,name,false,fur);c.look={x:-.4,y:0};drawCat(g,c,cv.width/2,cv.height/2+4,cv.width*.36);}catch(e){}
  el.hidden=false;requestAnimationFrame(()=>el.classList.add('on'));clearTimeout(sayTimer);sayTimer=setTimeout(hideSay,(dur||6)*1000);}
function hideSay(){const el=$('say');if(!el)return;el.classList.remove('on');clearTimeout(sayTimer);sayTimer=setTimeout(()=>{el.hidden=true;},400);}
