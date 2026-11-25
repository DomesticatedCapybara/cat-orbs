// Cat Orbs: Conquerors of Cat Earth - world constants, treats, modes, medals
// ---------- world ----------
const R0=2800; // the whole city is open until only a few cats remain
const FINAL_N=5,FINAL_SPEED=24,FINAL_MIN=450; // final circle: starts at 5 cats left, shrinks 24 units/sec
let foodEaten=[],cats=[],player=null,eaten=[],parts=[],floats=[],foods=[];
let finalOn=false,state='menu',time=0,clock=0,cam={x:0,y:0,z:1},arenaR=R0*1.42,king=null,finT=0,endShown=false,recorded=false;
let mouse={x:0,y:0,active:false},keys={},lbTimer=0,toastT=0,myCats=0,myTreats=0,wasUnl=[];

// treats: small ones anyone can eat; big ones need a cat bigger than the treat
// Absorbables, tiny to colossal. n = how many at full city size, rate = respawns per second.
// A cat must be EAT x bigger than an item (or another cat) to absorb it.
const EAT=1.2;
const FOODT=[
 {k:'kibble', v:6,  r:7,  n:300,rate:25, glow:'#ffd166'},
 {k:'fish',   v:10, r:11, n:140,rate:12, glow:'#5ef2ff'},
 {k:'goldfish',v:32, r:12, n:6,  rate:.06,glow:'#ffd700'}, // rare and worth a lot
 {k:'yarn',   v:14, r:13, n:70, rate:6,  glow:'#ff8ae2'},
 {k:'mouse',  v:18, r:17, n:50, rate:4,  glow:'#e0d7ff'},
 {k:'box',    v:26, r:26, n:34, rate:2,  glow:'#ffe08a'},
 {k:'bed',    v:34, r:34, n:24, rate:1.2,glow:'#c9a8ff'},
 {k:'tuna',   v:44, r:46, n:16, rate:.8, glow:'#7fd0ff'},
 {k:'tower',  v:58, r:62, n:11, rate:.5, glow:'#ffcf9e'},
 {k:'truck',  v:76, r:84, n:7,  rate:.3, glow:'#ffb35c'},
 {k:'tanker', v:100,r:110,n:5,  rate:.2, glow:'#a8d8ff'},
 {k:'market', v:136,r:150,n:3,  rate:.12,glow:'#ff9e9e'},
 {k:'yarnmtn',v:180,r:200,n:2,  rate:.08,glow:'#ffa8f0'}];
FOODT.forEach(T=>{T.big=T.r>=26;});
// a random spot on the island (and inside the final circle once it appears)
function randPoint(m){for(let n=0;n<25;n++){let x,y;
    if(finalOn){const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*Math.max(0,arenaR-m);x=Math.cos(a)*d;y=Math.sin(a)*d;}
    else{x=rnd(-R0+m,R0-m);y=rnd(-R0+m,R0-m);}
    if(Math.abs(x)<=R0-m&&Math.abs(y)<=R0-m)return{x,y};}
  return{x:0,y:0};}
// spread items evenly: try several spots and keep the one farthest from same-tier and big items
function placeFood(T){
  const same=foods.filter(o=>o.T===T),bigs=T.big?foods.filter(o=>o.T.big&&o.T!==T):[];
  const tries=T.n>100?4:T.big?14:8;let best=null,bs=-1e9;
  for(let i=0;i<tries;i++){const{x,y}=randPoint(T.r+30);let m=1e9;
    for(const o of same){const q=Math.hypot(o.x-x,o.y-y)-o.r-T.r;if(q<m)m=q;}
    for(const o of bigs){const q=(Math.hypot(o.x-x,o.y-y)-o.r-T.r)*1.5;if(q<m)m=q;}
    if(m>bs){bs=m;best={x,y};}}
  return{x:best.x,y:best.y,T,r:T.r,v:T.v,rot:Math.random()*7,ph:Math.random()*7,hue:Math.floor(Math.random()*3)};}
const CAR_S=1.45; // cars are drawn and sized this much bigger than the original sprite
const START_R=22,AI_COUNT=45,SPAWN_EDGE=300;
const COUNTDOWN=3,GRACE=10,FIN_CITY=4.5,FIN_EARTH=6; // finale: seconds to fill the city, then to swallow Cat Earth // seconds of countdown before play; seconds rivals leave you alone after Go
const dailySeed=()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();};
// Solo: Grow Rush - no rival cats; race the clock to this size
const SOLO_GOAL=1000,GOLD_T=90,SILVER_T=120,BRONZE_T=180;
// medal times in seconds for reaching SOLO_GOAL
const MEDALS=[['gold',GOLD_T],['silver',SILVER_T],['bronze',BRONZE_T]];
let mode='koth',soloBest=null,dayBest=null;
const dayKey=()=>'catorb-day-'+dailySeed();
const dayLabel=()=>new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'});
const medalFor=t=>{for(const[m,lim]of MEDALS)if(t<=lim)return m;return null;};
function loadDayBest(){try{const v=parseFloat(localStorage.getItem(dayKey()));dayBest=v>0?v:null;}catch(e){dayBest=null;}}
try{mode=localStorage.getItem('catorb-mode')==='solo'?'solo':'koth';const b=parseFloat(localStorage.getItem('catorb-solobest'));if(b>0)soloBest=b;}catch(e){}
const fmtT=s=>`${Math.floor(s/60)}:${(s%60).toFixed(1).padStart(4,'0')}`;
function setMode(m){mode=m;for(const r of document.querySelectorAll('input[name=mode]'))r.checked=r.value===m;
  try{localStorage.setItem('catorb-mode',m);}catch(e){}
  loadDayBest();
  $('modeNote').textContent=m==='solo'?`Today's city (${dayLabel()}): reach size ${SOLO_GOAL} as fast as you can. Gold ${fmtT(GOLD_T)}, silver ${fmtT(SILVER_T)}, bronze ${fmtT(BRONZE_T)}.`
    +(dayBest?` Today's best ${fmtT(dayBest)}.`:'')+(soloBest?` All-time best ${fmtT(soloBest)}.`:''):'46 cats, one winner. Absorb or be absorbed.';}
const MILESTONES=[{name:'trees',need:12*1.2},{name:'cars',need:19*CAR_S*1.2},{name:'fountains',need:63*1.2},{name:'small buildings',need:95*1.2},{name:'tall buildings',need:136*1.2},{name:'whole city blocks',need:196*1.2}];
// Combo: eat things in quick succession to build a growth bonus (up to x1.5)
const COMBO_WINDOW=1.4;let combo=0,comboT=0,shakeA=0,slowT=0;
let RM=false;try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
const comboMult=()=>1+.5*Math.min(1,Math.max(0,combo-2)/22);
function comboHit(){combo=comboT>0?combo+1:1;comboT=COMBO_WINDOW;if(stats)stats.combo=Math.max(stats.combo,combo);}
// ---------- King of the Hill tuning ----------
// vis: how far rivals notice things; think: seconds between decisions; dash: how keen they are to dash; grow: how much rivals grow from food; chase: how hard they hunt you
const DIFF={easy:{vis:.7,think:.36,dash:.45,grow:.85,chase:.7},normal:{vis:1,think:.22,dash:1,grow:1,chase:1},hard:{vis:1.3,think:.14,dash:1.5,grow:1.12,chase:1.35}};
const D=()=>DIFF[SET.diff]||DIFF.normal;
// personalities: foragers love food, hunters love prey, cowards flee early; one nemesis hunts you
const PERS=['forager','forager','hunter','hunter','coward'];
// power-ups (King of the Hill, toggled in Settings): any cat can grab one by touching it
const PU={catnip:{n:'Catnip',col:'#7ddc4a',t:6},shield:{n:'Shield',col:'#5fc4ff',t:5},magnet:{n:'Magnet',col:'#d77bff',t:8}};
const PU_MAX=8,PU_EVERY=6;
let powerups=[],puT=0,stats=null;
const newStats=()=>({peak:START_R,cats:0,items:0,bldg:0,cars:0,trees:0,critters:0,combo:0,pu:0,survived:0});
function kick(a){if(!RM)shakeA=Math.max(shakeA,a);}
function slowmo(t){if(!RM)slowT=Math.max(slowT,t);}
const PLAYER_BONUS=1.35; // the player's cat grows a bit faster from treats
const canEatF=(c,f)=>c.r>f.r*EAT;
const needF=f=>Math.floor(f.r*EAT)+1;

