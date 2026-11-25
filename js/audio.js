// Cat Orbs: Conquerors of Cat Earth - sound effects and music (all synthesized)
// ---------- sound (all synthesized with Web Audio, so the game stays one offline file) ----------
const SFX={ctx:null,out:null,noise:null,on:true,last:0};
try{SFX.on=localStorage.getItem('catorb-sound')!=='0';}catch(e){}
function audioUnlock(){ // must run inside a tap/click for iPhone Safari
  try{if(!SFX.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      const a=new AC(),o=a.createGain();o.gain.value=.55*SET.sv/100;o.connect(a.destination);SFX.ctx=a;SFX.out=o;
      const b=a.createBuffer(1,a.sampleRate,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SFX.noise=b;
      const s=a.createBufferSource();s.buffer=a.createBuffer(1,1,a.sampleRate);s.connect(a.destination);s.start(0);}
    if(SFX.ctx.state==='suspended')SFX.ctx.resume();}catch(e){}}
function tone(f,dur,type,vol,f2,delay){const a=SFX.ctx;if(!a||!SFX.on)return;const t=a.currentTime+(delay||0);
  const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  o.connect(g);g.connect(SFX.out);o.start(t);o.stop(t+dur+.02);}
function hiss(dur,vol,f1,f2,kind,delay){const a=SFX.ctx;if(!a||!SFX.on)return;const t=a.currentTime+(delay||0);
  const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=SFX.noise;fl.type=kind||'lowpass';
  fl.frequency.setValueAtTime(f1,t);fl.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  s.connect(fl);fl.connect(g);g.connect(SFX.out);s.start(t,Math.random()*.5);s.stop(t+dur+.02);}
const snd={
  pick(r){const n=performance.now();if(n-SFX.last<45)return;SFX.last=n;const f=Math.max(320,980-r*14)*(1+Math.random()*.08)*(1+Math.min(combo,24)*.025);tone(f,.08,'triangle',.13,f*1.6);},
  crunch(r){const k=Math.min(1,r/150);hiss(.12+k*.35,.22+k*.15,2200-k*1400,220,'lowpass');tone(140-k*70,.14+k*.3,'sine',.3,45);},
  meow(near){const v=near?.07:.22;tone(560,.09,'triangle',v,880);tone(880,.2,'triangle',v,400,.08);},
  dash(){hiss(.28,.16,350,2600,'bandpass');},
  slurp(r){const k=Math.min(1,r/60);hiss(.14+k*.12,.13,1600,260,'bandpass');tone(480-k*200,.15+k*.1,'triangle',.11,150);},
  thunder(){hiss(1.6,.32,420,50,'lowpass');tone(55,1.2,'sine',.25,32,.05);},
  squeak(){tone(1500,.07,'triangle',.08,2100);tone(1900,.06,'triangle',.06,1500,.07);},
  level(){[523,659,784,1046].forEach((f,i)=>tone(f,.16,'triangle',.14,0,i*.08));},
  warn(){tone(330,.28,'square',.07,0,0);tone(247,.4,'square',.07,0,.3);},
  lose(){tone(392,.25,'sawtooth',.09,370,0);tone(349,.25,'sawtooth',.09,330,.27);tone(294,.7,'sawtooth',.09,150,.54);},
  win(){[523,659,784].forEach((f,i)=>tone(f,.18,'triangle',.16,0,i*.12));[523,659,784,1046].forEach(f=>tone(f,1.1,'triangle',.09,0,.4));}};

// ---------- music (composed in code: menu meow tune + battle track that intensifies) ----------
const MUS_VOL=1,MENU_BOOST=1.5; // overall music level, and extra lift for the gentler menu tune
const MUS={on:true,out:null,menu:null,battle:null,track:null,step:0,next:0,int:0,cycle:0};
try{MUS.on=localStorage.getItem('catorb-music')!=='0';}catch(e){}
const mf=m=>440*Math.pow(2,(m-69)/12); // MIDI note number -> frequency
function musInit(){const a=SFX.ctx;if(!a||MUS.out)return;
  MUS.out=a.createGain();MUS.out.gain.value=MUS.on?MUS_VOL*SET.mv/100:0;MUS.out.connect(a.destination);
  MUS.menu=a.createGain();MUS.menu.gain.value=0;MUS.menu.connect(MUS.out);
  MUS.battle=a.createGain();MUS.battle.gain.value=0;MUS.battle.connect(MUS.out);}
function env(g,t,a,peak,dur){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0006,t+dur);}
function mOsc(dest,type,f,t,dur,vol,att,filt){const a=SFX.ctx,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  let n=o;if(filt){const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=filt;o.connect(fl);n=fl;}
  n.connect(g);g.connect(dest);env(g,t,att||.005,vol,dur);o.start(t);o.stop(t+dur+.05);return o;}
function mNoise(dest,t,dur,vol,type,freq){const a=SFX.ctx,s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();
  s.buffer=SFX.noise;fl.type=type;fl.frequency.value=freq;s.connect(fl);fl.connect(g);g.connect(dest);env(g,t,.002,vol,dur);s.start(t,Math.random()*.8);s.stop(t+dur+.05);}
// a synthesized "meow": the pitch rises then falls while a vowel-like filter opens and closes (m-e-o-w)
function meow(dest,f,t,dur,vol){const a=SFX.ctx,o=a.createOscillator(),o2=a.createOscillator(),bp=a.createBiquadFilter(),lp=a.createBiquadFilter(),g=a.createGain();
  o.type='sawtooth';o2.type='triangle';
  for(const[osc,k]of[[o,1],[o2,2]]){osc.frequency.setValueAtTime(f*.82*k,t);osc.frequency.linearRampToValueAtTime(f*1.12*k,t+dur*.3);osc.frequency.linearRampToValueAtTime(f*.9*k,t+dur);}
  bp.type='bandpass';bp.Q.value=3;bp.frequency.setValueAtTime(700,t);bp.frequency.linearRampToValueAtTime(1900,t+dur*.35);bp.frequency.linearRampToValueAtTime(800,t+dur);
  lp.type='lowpass';lp.frequency.value=3200;o.connect(bp);o2.connect(bp);bp.connect(lp);lp.connect(g);g.connect(dest);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.04);g.gain.setValueAtTime(vol*.85,t+dur*.6);g.gain.exponentialRampToValueAtTime(.0006,t+dur+.08);
  o.start(t);o2.start(t);o.stop(t+dur+.12);o2.stop(t+dur+.12);}
const drumKick=(d,t,v)=>{const a=SFX.ctx,o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);o.connect(g);g.connect(d);env(g,t,.002,v,.22);o.start(t);o.stop(t+.25);};
const snare=(d,t,v)=>{mNoise(d,t,.14,v,'bandpass',1800);mOsc(d,'triangle',190,t,.08,v*.5);};
const hat=(d,t,v)=>mNoise(d,t,.035,v,'highpass',7000);

// Menu: C major, C-Am-F-G, 96 bpm. Meows sing the tune; every other loop a marimba takes it and the cats answer
const M_PROG=[[48,52,55],[45,48,52],[41,45,48],[43,47,50]];
const M_TUNE=[[0,76,3],[4,79,3],[8,76,6],[16,72,3],[22,74,2],[24,76,6],[32,77,3],[36,81,3],[40,79,6],[48,76,3],[52,74,3],[56,72,6],[62,84,1]];
function menuStep(s,t,sp){const d=MUS.menu,bar=Math.floor(s/16)%4,b=s%16,ch=M_PROG[bar];
  if(b===0)for(const m of ch)mOsc(d,'triangle',mf(m+12),t,sp*15,.035,.25,1400);
  if(b===0||b===6||b===8)mOsc(d,'triangle',mf(ch[0]-12),t,sp*3,.16,.005,600);
  if(b%4===2)mNoise(d,t,.06,.03,'bandpass',5200);
  for(const[st,m,len]of M_TUNE)if(st===s%64){
    if(MUS.cycle%2===0||st===62)meow(d,mf(m-12),t,Math.min(.55,sp*len*.9),.13);
    else mOsc(d,'sine',mf(m),t,sp*len*1.4,.12,.004);}}

// Battle: A minor, Am-F-C-G. Layers join as intensity (0..1) rises, and the tempo climbs 124 -> 152 bpm
const B_PROG=[[45,48,52],[41,45,48],[48,52,55],[43,47,50]];
function battleStep(s,t,sp){const d=MUS.battle,I=MUS.int,bar=Math.floor(s/16)%4,b=s%16,ch=B_PROG[bar];
  if(b===0||b===8||(I>.5&&(b===4||b===12))||(I>.85&&b===14))drumKick(d,t,.5);
  if(I>.25&&(b===4||b===12))snare(d,t,.16+.08*I);
  if(I>.7?true:(I>.12&&b%2===0))hat(d,t,b%4===2?.06:.035);
  if(b%2===0)mOsc(d,'sawtooth',mf(ch[0]-12+(I>.6&&b%4===2?12:0)),t,sp*1.7,.13,.004,320+900*I);
  if(I>.42)mOsc(d,'square',mf(ch[s%3]+24),t,sp*.9,.045,.003,1200+2600*I);
  if(I>.72&&(b===0||b===3||b===6||b===10))mOsc(d,'square',mf(ch[(b/3|0)%3]+36),t,sp*1.6,.04,.004,3000);
  if(I>.58&&s%32===24)meow(d,mf(ch[2]+12),t,.32,.12);   // a hissy battle meow every couple of bars
  if(I>.9&&s%64===56)meow(d,mf(ch[0]+24),t,.22,.1);}

function battleTarget(){if(state==='count')return .08;if(state==='finale')return 1;if(!player)return 0;
  if(mode==='solo')return Math.min(1,.15+.75*player.r/SOLO_GOAL+.1*Math.min(1,time/120));
  let v=Math.pow(1-(aliveN-1)/AI_COUNT,.8);if(finalOn)v=Math.max(v,.86);
  if(player.alive){const near=cats.some(c=>c.alive&&!c.player&&canEat(c,player)&&Math.hypot(c.x-player.x,c.y-player.y)<c.r+600);if(near)v+=.18;}
  return Math.max(.1,Math.min(1,v));}
function setMusic(on,user){MUS.on=on;try{localStorage.setItem('catorb-music',on?'1':'0');}catch(e){}
  for(const id of['musBtn','musMenu'])if($(id))$(id).textContent=on?'Music: on':'Music: off';
  if(user)audioUnlock();if(MUS.out)MUS.out.gain.setTargetAtTime(on?MUS_VOL*SET.mv/100:0,SFX.ctx.currentTime,.1);}
function applyVolumes(){if(SFX.out)SFX.out.gain.setTargetAtTime(.55*SET.sv/100,SFX.ctx.currentTime,.05);if(MUS.out)MUS.out.gain.setTargetAtTime(MUS.on?MUS_VOL*SET.mv/100:0,SFX.ctx.currentTime,.05);}
function musicTick(dt){const a=SFX.ctx;if(!a||a.state!=='running')return;musInit();
  const want=(state==='menu'||(!$('end').hidden&&state!=='dead'))?'menu':'battle';
  if(want!==MUS.track){MUS.track=want;MUS.step=0;MUS.cycle=0;MUS.next=a.currentTime+.08;
    MUS.menu.gain.setTargetAtTime(want==='menu'?MENU_BOOST:0,a.currentTime,.35);MUS.battle.gain.setTargetAtTime(want==='battle'?1:0,a.currentTime,.35);}
  MUS.battle.gain.setTargetAtTime(want==='battle'?(paused?.3:1):0,a.currentTime,.2);
  MUS.int+=(battleTarget()-MUS.int)*Math.min(1,dt*.6);
  if(!MUS.on){MUS.next=a.currentTime+.05;return;}
  if(MUS.next<a.currentTime-.3)MUS.next=a.currentTime+.05; // catch up after a hiccup
  while(MUS.next<a.currentTime+.15){
    const bpm=MUS.track==='menu'?96:124+28*MUS.int,sp=60/bpm/4;
    if(MUS.track==='menu')menuStep(MUS.step,MUS.next,sp);else battleStep(MUS.step,MUS.next,sp);
    MUS.next+=sp;MUS.step++;if(MUS.step%64===0)MUS.cycle++;}}

function setSound(on,user){SFX.on=on;try{localStorage.setItem('catorb-sound',on?'1':'0');}catch(e){}
  for(const id of['sndBtn','sndMenu'])if($(id))$(id).textContent=on?'Sound: on':'Sound: off';if(on&&user){audioUnlock();snd.pick(10);}}

