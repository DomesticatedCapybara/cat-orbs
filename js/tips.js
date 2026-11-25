// Cat Orbs: Conquerors of Cat Earth - first-run tips
// Each tip shows once, the first time its moment comes up. "Show tips again" in Settings resets them.
let TIPS_DONE={};try{TIPS_DONE=JSON.parse(localStorage.getItem('catorb-tips')||'{}');}catch(e){}
const tipQ=[];let tipT=0,tipCool=0,dashed=false;
function tip(id,text){if(TIPS_DONE[id]||tipQ.some(t=>t[0]===id))return;tipQ.push([id,text]);}
function tipsTick(dt){
  if(state!=='play'||!player||!player.alive){return;}
  if(tipT>0){tipT-=dt;if(tipT<=0)$('tip').classList.remove('on');return;}
  if(tipCool>0){tipCool-=dt;return;}
  // the moments that trigger each tip
  if(time>.5)tip('steer',phone?'Drag anywhere to steer. Lift your thumb and you keep cruising.':'Move the mouse to steer. Press Space to dash.');
  if(time>5&&lastProps.some(p=>player.r>p.r*EAT))tip('outline','Things with a glowing dotted outline are small enough to eat. Go gobble!');
  if(mode==='koth'&&time>GRACE&&cats.some(c=>c.alive&&!c.player&&canEat(c,player)&&Math.abs(c.x-player.x)<W/2/cam.z&&Math.abs(c.y-player.y)<H/2/cam.z))tip('danger','A spiky ring means that cat can eat you. Run, or dash away!');
  if(combo>=3)tip('combo','Combo! Keep eating quickly for bonus growth.');
  if(time>22&&!dashed)tip('dash',phone?'Tap Dash for a burst of speed. It works while cruising too.':'Press Space to dash for a burst of speed.');
  if(powerups.some(u=>u.alive&&Math.abs(u.x-player.x)<W/2/cam.z&&Math.abs(u.y-player.y)<H/2/cam.z))tip('pu','Power-up! Catnip = speed, shield = can\'t be eaten, magnet = pulls food in.');
  if(time>12&&mode==='koth')tip('arrows','Arrows at the edge point to cats off-screen. "!" means danger.');
  if(tipQ.length){const[id,text]=tipQ.shift();TIPS_DONE[id]=1;try{localStorage.setItem('catorb-tips',JSON.stringify(TIPS_DONE));}catch(e){}
    $('tip').textContent=text;$('tip').classList.add('on');tipT=5;tipCool=2.5;}}
function resetTips(){TIPS_DONE={};try{localStorage.removeItem('catorb-tips');}catch(e){}}
