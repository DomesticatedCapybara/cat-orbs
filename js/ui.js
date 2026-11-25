// Cat Orbs: Conquerors of Cat Earth - menus, buttons, input and start-up
// ---------- color picker ----------
function buildFurs(){
  const box=$('furs');box.innerHTML='';let n=0;
  if(!isUnl(FUR[prog.pick]||FUR[0]))prog.pick=0;
  FUR.forEach((f,i)=>{const u=isUnl(f);if(u)n++;
    const b=document.createElement('button');b.type='button';b.className='fur'+(i===prog.pick?' on':'')+(u?'':' locked');
    b.style.setProperty('--c',f.b);
    b.setAttribute('aria-label',u?f.n:`${f.n}, locked: ${f.req[2]}`);b.setAttribute('aria-pressed',i===prog.pick?'true':'false');
    try{const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');if(g){drawCat(g,{fur:f,look:{x:0,y:.2},blink:1},48,56,30);b.appendChild(c);}}catch(e){}
    if(!b.firstChild){const t=document.createElement('span');t.textContent=f.n;t.style.cssText='position:absolute;left:0;right:0;top:4px;font-size:11px;font-weight:700';b.appendChild(t);}
    b.addEventListener('click',()=>{if(!u){$('furNote').textContent=`${f.n}: ${f.req[2]} to unlock.`;return;}
      prog.pick=i;saveProg();buildFurs();$('furNote').textContent=`${f.n} selected.`;});
    box.appendChild(b);});
  $('unlCount').textContent=`(${n} of ${FUR.length} unlocked)`;
}

// ---------- settings screen ----------
function radios(name,val,fn){for(const r of document.querySelectorAll(`input[name=${name}]`)){r.checked=r.value===String(val);r.onchange=()=>{fn(r.value);saveSet();if(typeof applyPalette==='function')applyPalette();syncSettings();};}}
function syncSettings(){$('mvol').value=SET.mv;$('svol').value=SET.sv;$('mvolV').textContent=SET.mv;$('svolV').textContent=SET.sv;
  radios('cb',SET.cb,v=>SET.cb=v);radios('diff',SET.diff,v=>SET.diff=v);radios('pu',SET.pu?1:0,v=>SET.pu=v==='1');
  radios('weather',SET.weather,v=>SET.weather=v);radios('lite',SET.lite?1:0,v=>{SET.lite=v==='1';resize();});radios('tod',SET.tod,v=>SET.tod=v);
  if(typeof PAL!=='undefined')$('cbDemo').innerHTML=`<span><i style="background:${PAL.edible}"></i>Can eat</span><span><i style="background:${PAL.danger}"></i>Danger</span><span><i style="background:${PAL.gold}"></i>Target</span>`;}
function openSettings(){syncSettings();$('setOv').hidden=false;$('progNote').textContent='';}
for(const[id,key]of[['mvol','mv'],['svol','sv']])$(id).addEventListener('input',e=>{SET[key]=+e.target.value;$(id+'V').textContent=SET[key];saveSet();audioUnlock();applyVolumes();if(key==='sv')snd.pick(12);});
$('tipsReset').addEventListener('click',()=>{resetTips();$('progNote').textContent='Tips will show again in your next match.';});
// offline play: save the game on the device (only on a real web address, e.g. GitHub Pages)
if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost')&&!/claude\.ai|claudeusercontent/.test(location.host))navigator.serviceWorker.register('sw.js').catch(()=>{});
$('setMenu').addEventListener('click',openSettings);$('setPause').addEventListener('click',openSettings);
$('setDone').addEventListener('click',()=>{$('setOv').hidden=true;setMode(mode);});
// progress export/import: a code that holds everything saved in this browser
const SAVE_KEYS=()=>{const k=[];try{for(let i=0;i<localStorage.length;i++){const n=localStorage.key(i);if(n&&n.startsWith('catorb-'))k.push(n);}}catch(e){}return k;};
function exportCode(){const o={};for(const k of SAVE_KEYS())try{o[k]=localStorage.getItem(k);}catch(e){}
  return'CATORB1:'+btoa(unescape(encodeURIComponent(JSON.stringify(o))));}
$('expBtn').addEventListener('click',async()=>{const c=exportCode();let ok=false;try{await navigator.clipboard.writeText(c);ok=true;}catch(e){}
  if(ok)$('progNote').textContent='Progress code copied. Paste it into Import on the other device.';
  else{$('impBox').hidden=false;$('impText').value=c;$('impText').select();$('progNote').textContent='Copy the code shown above.';}});
$('impShow').addEventListener('click',()=>{$('impBox').hidden=false;$('impText').value='';$('impText').focus();});
$('impBtn').addEventListener('click',()=>{const t=$('impText').value.trim();
  try{if(!t.startsWith('CATORB1:'))throw 0;const o=JSON.parse(decodeURIComponent(escape(atob(t.slice(8)))));let n=0;
    for(const[k,v]of Object.entries(o))if(k.startsWith('catorb-')&&typeof v==='string'){localStorage.setItem(k,v);n++;}
    $('progNote').textContent=`Imported ${n} saved items. Reloading…`;setTimeout(()=>location.reload(),900);}
  catch(e){$('progNote').textContent="That doesn't look like a Cat Orbs progress code. Check it was copied in full.";}});

// ---------- input ----------
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;mouse.x=e.clientX-FX;mouse.y=e.clientY-FY;mouse.active=true;});
cv.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){mouse.x=e.clientX-FX;mouse.y=e.clientY-FY;mouse.active=true;}});
cv.addEventListener('touchstart',e=>{e.preventDefault();
  if(phone){if(joy.id===null){const t=e.changedTouches[0];joy.id=t.identifier;joy.ox=joy.x=t.clientX-FX;joy.oy=joy.y=t.clientY-FY;joy.moved=false;joy.t0=performance.now();}return;}
  const t=e.touches[0];mouse.x=t.clientX-FX;mouse.y=t.clientY-FY;mouse.active=true;},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();
  if(phone){for(const t of e.changedTouches)if(t.identifier===joy.id){joy.x=t.clientX-FX;joy.y=t.clientY-FY;
      const jx=joy.x-joy.ox,jy=joy.y-joy.oy,l=Math.hypot(jx,jy);if(l>90){joy.ox=joy.x-jx/l*90;joy.oy=joy.y-jy/l*90;}}return;}
  const t=e.touches[0];mouse.x=t.clientX-FX;mouse.y=t.clientY-FY;mouse.active=true;},{passive:false});
const endJoy=e=>{for(const t of e.changedTouches)if(t.identifier===joy.id){joy.id=null;
    if(!joy.moved&&performance.now()-joy.t0<250&&player&&player.alive&&state!=='menu')player.stopped=true;}}; // quick tap = stop
cv.addEventListener('touchend',endJoy);cv.addEventListener('touchcancel',endJoy);
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault());
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(document.activeElement===$('nameIn')){if(k==='enter'){document.activeElement.blur();safeStart();}return;}
  if((k==='p'||k==='escape')&&state!=='menu'&&$('end').hidden){setPause(!paused);return;}
  keys[k]=true;if(k===' '){e.preventDefault();if(state==='play'&&!paused)tryDash(player);}});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
addEventListener('blur',()=>{keys={};joy.id=null;});
$('dash').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();if(state==='play'||(state==='finale'&&king===player))tryDash(player);});
setInterval(()=>{if(player)$('dash').classList.toggle('cool',player.cd>0);},100);
let lastStart=0;
function safeStart(e){audioUnlock();if(e&&e.cancelable)e.preventDefault();const n=Date.now();if(n-lastStart<600)return;lastStart=n;
  try{start();}catch(err){showErr('start: '+(err&&err.message)+'\n'+((err&&err.stack)||'').split('\n').slice(0,3).join('\n'));}}
for(const id of['playBtn','againBtn']){$(id).addEventListener('click',safeStart);$(id).addEventListener('touchend',safeStart);}
$('copyBtn').addEventListener('click',e=>copyResult(e.currentTarget));
$('watchBtn').addEventListener('click',()=>{$('end').hidden=true;toast('Spectating the biggest cat');});
$('menuBtn').addEventListener('click',toMenu);
$('pauseBtn').addEventListener('click',e=>{e.stopPropagation();e.currentTarget.blur();setPause(true);});
$('resumeBtn').addEventListener('click',()=>setPause(false));
$('restartBtn').addEventListener('click',e=>{setPause(false);safeStart(e);});
$('quitBtn').addEventListener('click',toMenu);
// auto-pause when the app is hidden (a call, switching apps, locking the phone)
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state!=='menu'&&!paused&&$('end').hidden)setPause(true);});
addEventListener('pagehide',()=>{if(state!=='menu'&&!paused&&$('end').hidden)setPause(true);});
for(const r of document.querySelectorAll('input[name=mode]'))r.addEventListener('change',e=>setMode(e.target.value));
setMode(mode);
for(const r of document.querySelectorAll('input[name=dev]'))r.addEventListener('change',e=>setDev(e.target.value));
{let saved=null;try{saved=localStorage.getItem('catorb-dev');}catch(e){}setDev(saved&&(DEVN[saved]||saved==='auto')?saved:'duo');}
for(const id of['sndBtn','sndMenu'])$(id).addEventListener('click',e=>{e.stopPropagation();setSound(!SFX.on,true);if(e.currentTarget.id==='sndBtn')e.currentTarget.blur();});
for(const id of['musBtn','musMenu'])$(id).addEventListener('click',e=>{e.stopPropagation();setMusic(!MUS.on,true);if(e.currentTarget.id==='musBtn')e.currentTarget.blur();});
addEventListener('pointerdown',audioUnlock,{passive:true});
addEventListener('keydown',audioUnlock);
setSound(SFX.on);setMusic(MUS.on);
buildFurs();
buildProps();
requestAnimationFrame(loop);
window.__catOk=true;
