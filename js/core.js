// Cat Orbs: Conquerors of Cat Earth - helpers, canvas, device profiles, cat colors and saved progress
const $=id=>document.getElementById(id);
const showErr=m=>window.__catErr&&window.__catErr(m);
addEventListener('unhandledrejection',e=>showErr(String(e.reason)));
const cv=$('c'),ctx=cv.getContext('2d'),mini=$('mini'),mctx=mini.getContext('2d');
let W=0,H=0,DPR=1,phone=false;
const joy={id:null,ox:0,oy:0,x:0,y:0};
let RNG=Math.random; // swapped for a seeded generator while setting up the daily Grow Rush city
const seeded=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const rnd=(a,b)=>a+RNG()*(b-a);

// ---------- device profiles ----------
let devPick='duo',dev='duo';
const DUO_AR=1.41;let FX=0,FY=0;
const DEVN={duo:'iPhone Duo (open)',max:'iPhone 13 Pro Max',desktop:'Desktop'};
function detectDev(){const touch=(navigator.maxTouchPoints>0)&&matchMedia('(pointer:coarse)').matches;
  if(!touch)return'desktop';return Math.min(innerWidth,innerHeight)>=580?'duo':'max';}
function applyDev(){dev=devPick==='auto'?detectDev():devPick;phone=dev!=='desktop';
  document.body.classList.toggle('phone',phone);document.body.classList.toggle('duo',dev==='duo');
  $('devNote').textContent=devPick==='auto'?`Detected: ${DEVN[dev]}`:'';
  if(!phone)joy.id=null;resize();}
function setDev(v){devPick=v;for(const r of document.querySelectorAll('input[name=dev]'))r.checked=r.value===v;
  try{localStorage.setItem('catorb-dev',v);}catch(e){}applyDev();}
function resize(){DPR=Math.min(window.devicePixelRatio||1,SET.lite?1.1:phone?1.5:2);
  const VW=innerWidth,VH=innerHeight,fr=$('frame');
  // On a screen that isn't a Duo, the Duo profile plays inside a 1.41:1 frame matching the open Duo
  const box=dev==='duo'&&detectDev()!=='duo';
  if(box){const land=VW>VH,avW=VW-24,avH=VH-48;
    if(land){H=Math.min(avH,avW/DUO_AR);W=H*DUO_AR;}else{W=Math.min(avW,avH/DUO_AR);H=W*DUO_AR;}
    W=Math.floor(W);H=Math.floor(H);FX=Math.round((VW-W)/2);FY=Math.round((VH-H)/2-12);}
  else{W=VW;H=VH;FX=0;FY=0;}
  fr.style.left=FX+'px';fr.style.top=FY+'px';fr.style.width=W+'px';fr.style.height=H+'px';
  fr.classList.toggle('boxed',box);document.body.classList.toggle('boxedbg',box);$('frameTag').hidden=!box;
  cv.width=W*DPR;cv.height=H*DPR;
  const m=mini.clientWidth||150;mini.width=m*DPR;mini.height=m*DPR;}
addEventListener('resize',()=>{if(devPick==='auto'&&detectDev()!==dev)applyDev();else resize();});
addEventListener('orientationchange',()=>setTimeout(resize,250));
if(window.visualViewport)visualViewport.addEventListener('resize',()=>{if(Math.abs(innerWidth-W)>1||Math.abs(innerHeight-H)>1)resize();});

// ---------- cat colors and progress ----------
const FUR=[
 {n:'Ginger',b:'#f4a259',s:'#c96a26',st:1,eye:'#9be36b'},
 {n:'Silver',b:'#9aa5b1',s:'#5f6a78',eye:'#f2c94c'},
 {n:'Midnight',b:'#34303a',s:'#1a171e',eye:'#f5d547'},
 {n:'Snowball',b:'#f6f0e6',s:'#cdbfae',eye:'#6fc3ff',req:['games',2,'Play 2 games']},
 {n:'Caramel',b:'#e8c69a',s:'#b88a55',eye:'#7ed37a',req:['cats',10,'Absorb 10 cats in total']},
 {n:'Chestnut',b:'#b5734a',s:'#7c4523',st:1,eye:'#f2c94c',req:['treats',200,'Eat 200 treats in total']},
 {n:'Gray tabby',b:'#cfd4da',s:'#8a929c',st:1,eye:'#9be36b',req:['top',10,'Finish in the top 10']},
 {n:'Cocoa',b:'#5b4636',s:'#36271c',st:1,eye:'#f7b733',req:['cats',40,'Absorb 40 cats in total']},
 {n:'Calico',b:'#f6efe4',s:'#c9b9a3',eye:'#9be36b',fx:'calico',req:['top',3,'Finish in the top 3']},
 {n:'Golden',b:'#f2c14e',s:'#b8862b',eye:'#ff7a59',fx:'gold',req:['wins',1,'Win a game']},
 {n:'Cosmic',b:'#3b2a6e',s:'#22164a',eye:'#7ff9ff',fx:'cosmic',req:['wins',3,'Win 3 games']},
 {n:'Doodle',b:'#fbf1e1',s:'#c9b9a3',eye:'#4fb35a',head:1}];
const AI_FURS=FUR.slice(0,9);
// hand-drawn head skin: white fill mask (tinted per fur color, cached), line art, face (eyes are drawn live)
const HEAD={},HEAD_TINT={};let headWait=3;
for(const k of['fill','line','face']){const im=new Image();im.onload=()=>{if(--headWait===0&&typeof buildFurs==='function')try{buildFurs();}catch(e){}};im.src=`img/cat-head-${k}.png`;HEAD[k]=im;}
// Every color uses the hand-drawn head. Each skin is built once: tinted fill, its pattern painted on,
// soft shading, then the line art and face (recolored light on dark fur so they stay visible).
const HEAD_SKIN={};
const lum=hex=>{const n=parseInt(hex.slice(1),16);return(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255;};
function headSkin(f){
  if(HEAD_SKIN[f.n])return HEAD_SKIN[f.n];const fill=headFill(f.b);if(!fill)return null;
  const N=fill.width,cv=document.createElement('canvas');cv.width=N;cv.height=fill.height;const x=cv.getContext('2d'),u=N*.353,cx=N/2,cy=N/2;
  x.drawImage(fill,0,0);x.globalCompositeOperation='source-atop';
  x.fillStyle=f.s;x.globalAlpha=.55;x.fillRect(0,0,N,cy-u*.82);x.globalAlpha=1; // darker ears
  if(f.fx==='calico'){for(const[a,b,q,c]of[[-.5,-.4,.5,'#e8873a'],[.55,.2,.42,'#2d2a30'],[-.2,.75,.3,'#e8873a'],[.62,-.85,.3,'#2d2a30']]){x.fillStyle=c;x.beginPath();x.arc(cx+a*u,cy+b*u,q*u,0,7);x.fill();}}
  if(f.fx==='cosmic'){x.globalAlpha=.55;x.fillStyle='#b04fd8';x.beginPath();x.arc(cx-.3*u,cy+.25*u,.55*u,0,7);x.fill();x.globalAlpha=.45;x.fillStyle='#3fa7d6';x.beginPath();x.arc(cx+.4*u,cy-.3*u,.45*u,0,7);x.fill();x.globalAlpha=1;
    x.fillStyle='#fff';for(const[a,b]of STARS){x.beginPath();x.arc(cx+a*u,cy+b*u,Math.max(1,u*.035),0,7);x.fill();}}
  if(f.st){x.strokeStyle=f.s;x.lineCap='round';x.lineWidth=u*.08;
    for(const k of[-1,0,1]){x.beginPath();x.moveTo(cx+k*u*.18,cy-u*.92);x.lineTo(cx+k*u*.12,cy-u*.62);x.stroke();}
    for(const s of[-1,1]){x.beginPath();x.moveTo(cx+s*u*.97,cy+u*.05);x.lineTo(cx+s*u*.72,cy+u*.08);x.moveTo(cx+s*u*.93,cy+u*.3);x.lineTo(cx+s*u*.7,cy+u*.28);x.stroke();}}
  const gr=x.createRadialGradient(cx-u*.35,cy-u*.4,u*.05,cx,cy,u*1.15);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(0,0,0,.22)');
  x.fillStyle=gr;x.fillRect(0,0,N,cv.height);
  if(f.fx==='gold'){x.fillStyle='#fff';const sx=cx-u*.5,sy=cy-u*.5,q=u*.16;x.beginPath();x.moveTo(sx,sy-q);x.lineTo(sx+q*.25,sy-q*.25);x.lineTo(sx+q,sy);x.lineTo(sx+q*.25,sy+q*.25);x.lineTo(sx,sy+q);x.lineTo(sx-q*.25,sy+q*.25);x.lineTo(sx-q,sy);x.lineTo(sx-q*.25,sy-q*.25);x.closePath();x.fill();}
  x.globalCompositeOperation='source-over';
  const dark=lum(f.b)<.33;
  for(const im of[HEAD.line,HEAD.face]){const t=document.createElement('canvas');t.width=N;t.height=cv.height;const tx=t.getContext('2d');tx.drawImage(im,0,0,N,cv.height);
    if(im===HEAD.face)tx.clearRect(N*105/256,N*143/256,N*58/256,N*45/256); // erase the doodle's nose and mouth: cats draw their own (see drawMouth)
    if(dark){tx.globalCompositeOperation='source-in';tx.fillStyle='#ece4d8';tx.fillRect(0,0,N,cv.height);}
    x.drawImage(t,0,0);}
  return HEAD_SKIN[f.n]=cv;}
function headFill(col){
  if(HEAD_TINT[col])return HEAD_TINT[col];const im=HEAD.fill;if(headWait>0||!im.naturalWidth)return null;
  const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const x=cv.getContext('2d');
  x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,cv.width,cv.height);return HEAD_TINT[col]=cv;}
let prog={games:0,cats:0,treats:0,best:99,wins:0,pick:0};
try{const s=JSON.parse(localStorage.getItem('catorb-prog')||'null');if(s)prog=Object.assign(prog,s);}catch(e){}
const saveProg=()=>{try{localStorage.setItem('catorb-prog',JSON.stringify(prog));}catch(e){}};
// ---------- settings ----------
// mv/sv: music and effects volume (0-100); cb: color vision; diff: rival difficulty; pu: power-ups on; weather; tod: time of day
const SET={mv:70,sv:80,cb:'std',diff:'normal',pu:true,weather:'random',tod:'cycle',lite:false};
try{Object.assign(SET,JSON.parse(localStorage.getItem('catorb-settings')||'{}'));}catch(e){}
const saveSet=()=>{try{localStorage.setItem('catorb-settings',JSON.stringify(SET));}catch(e){}};
// ---------- color vision palettes ----------
// edible / danger / target colors per setting. Shapes back them up everywhere: edible = dotted ring, danger = spiky ring.
const PALS={
  std:{edible:'#7fe0b4',danger:'#ff6f59',dangerLite:'#ffb3a6',gold:'#ffd166',w:1},
  rg:{edible:'#4aa8ff',danger:'#ffa31a',dangerLite:'#ffd08a',gold:'#f4f4f4',w:1.15},  // blue vs orange: clear for red-green color blindness
  by:{edible:'#36e0c8',danger:'#ff4f8b',dangerLite:'#ffb0cb',gold:'#ffffff',w:1.15},  // teal vs pink: avoids blue-yellow confusion
  hc:{edible:'#00f0ff',danger:'#ff2d55',dangerLite:'#ff9fb3',gold:'#ffe600',w:1.6}};
let PAL=PALS[SET.cb]||PALS.std;
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`;};
function applyPalette(){PAL=PALS[SET.cb]||PALS.std;const r=document.documentElement.style;r.setProperty('--edible',PAL.edible);r.setProperty('--danger',PAL.danger);r.setProperty('--gold',PAL.gold);}
applyPalette();
const isUnl=f=>{if(!f.req)return true;const[k,v]=f.req;return k==='top'?prog.best<=v:prog[k]>=v;};

const NAMES=['Mochi','Biscuit','Pumpkin','Miso','Tofu','Pepper','Ziggy','Luna','Noodle','Waffles','Oreo','Ginger','Smokey','Cleo','Pickles','Bean','Socks','Nacho','Mittens','Olive','Pudding','Taco','Juniper','Frodo','Basil','Cocoa','Marble','Sushi','Toast','Peanut','Figaro','Hazel','Bubbles','Clover','Dumpling','Kiwi','Maple','Nugget','Pixel','Rascal','Sprout','Truffle','Whiskers','Yuzu','Zorro'];

