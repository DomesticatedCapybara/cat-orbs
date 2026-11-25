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
  crunch(r){const n=performance.now();if(n-(SFX.lc||0)<80)return;SFX.lc=n;const k=Math.min(1,r/150);hiss(.12+k*.35,.22+k*.15,2200-k*1400,220,'lowpass');tone(140-k*70,.14+k*.3,'sine',.3,45);},
  meow(near){const v=near?.07:.22;tone(560,.09,'triangle',v,880);tone(880,.2,'triangle',v,400,.08);},
  dash(){hiss(.28,.16,350,2600,'bandpass');},
  slurp(r){const n=performance.now();if(n-(SFX.ls||0)<80)return;SFX.ls=n;const k=Math.min(1,r/60);hiss(.14+k*.12,.13,1600,260,'bandpass');tone(480-k*200,.15+k*.1,'triangle',.11,150);},
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

// ---------- continent soundtracks (Campaign): each map gets its own piece; layers still join as intensity rises ----------
// extra instruments
function steel(d,f,t,vol){for(const[k,v,dur]of[[1,1,.45],[2,.35,.3],[3.01,.18,.18]])mOsc(d,'sine',f*k,t,dur,vol*v,.003);}            // steel drum
function bell(d,f,t,vol,dur){mOsc(d,'sine',f,t,dur||.9,vol,.002);mOsc(d,'sine',f*2.76,t,(dur||.9)*.35,vol*.35,.002);}           // celesta / glockenspiel
function pluck(d,f,t,dur,vol,filt){mOsc(d,'sawtooth',f,t,dur,vol,.002,filt||1600);}                                                    // oud, ukulele, pizzicato
const jingle=(d,t,v)=>{mNoise(d,t,.05,v,'highpass',8500);mNoise(d,t+.012,.04,v*.7,'bandpass',6200);};                            // sleigh bells
const shaker=(d,t,v)=>mNoise(d,t,.05,v,'highpass',5200);
const conga=(d,t,f,v)=>{const a=SFX.ctx,o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(f*1.25,t);o.frequency.exponentialRampToValueAtTime(f,t+.05);o.connect(g);g.connect(d);env(g,t,.002,v,.2);o.start(t);o.stop(t+.25);};
const dum=(d,t,v)=>{conga(d,t,78,v);mNoise(d,t,.05,v*.25,'lowpass',400);};
const tek=(d,t,v)=>mNoise(d,t,.05,v,'bandpass',3200);
function accordion(d,f,t,dur,vol){for(const k of[.997,1.003])mOsc(d,'square',f*k,t,dur,vol*.5,.03,1700);}
function reed(d,f,t,dur,vol){const a=SFX.ctx,o=a.createOscillator(),lf=a.createOscillator(),lg=a.createGain(),bp=a.createBiquadFilter(),g=a.createGain();
  o.type='square';o.frequency.setValueAtTime(f,t);lf.frequency.value=6;lg.gain.value=f*.012;lf.connect(lg);lg.connect(o.frequency);
  bp.type='bandpass';bp.frequency.value=f*3;bp.Q.value=1.2;o.connect(bp);bp.connect(g);g.connect(d);env(g,t,.04,vol,dur);o.start(t);lf.start(t);o.stop(t+dur+.05);lf.stop(t+dur+.05);}
function theremin(d,f,t,dur,vol,from){const a=SFX.ctx,o=a.createOscillator(),lf=a.createOscillator(),lg=a.createGain(),g=a.createGain();
  o.type='sine';o.frequency.setValueAtTime(from||f,t);o.frequency.exponentialRampToValueAtTime(f,t+.12);lf.frequency.value=5.5;lg.gain.value=f*.018;lf.connect(lg);lg.connect(o.frequency);
  o.connect(g);g.connect(d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.08);g.gain.setValueAtTime(vol,t+dur*.8);g.gain.exponentialRampToValueAtTime(.0006,t+dur+.15);
  o.start(t);lf.start(t);o.stop(t+dur+.2);lf.stop(t+dur+.2);}
const playTune=(T,s,fn)=>{for(const[st,m,len]of T)if(st===s%64)fn(m,len);};
const THEME_MUS={
  // Whisker Bay: a jaunty harbor shanty in D (D-A-Bm-G), oom-pah bass, accordion, the odd seagull
  bay:{bpm:[112,138],prog:[[50,54,57],[45,49,52],[47,50,54],[43,47,50]],
    tune:[[0,69,4],[4,74,4],[8,74,2],[10,73,2],[12,71,4],[16,69,6],[22,66,2],[24,69,8],[32,71,4],[36,74,4],[40,76,4],[44,74,4],[48,73,4],[52,71,2],[54,73,2],[56,74,8]],
    step(d,s,t,sp,I,ch,b){if(b%8===0)mOsc(d,'triangle',mf(ch[0]-12),t,sp*3,.18,.004,700);if(b%8===4)mOsc(d,'triangle',mf(ch[2]-24),t,sp*3,.15,.004,700);
      if(b%8===4)for(const m of ch)accordion(d,mf(m),t,sp*1.6,.03);
      if(I>.3&&b%8===0)drumKick(d,t,.38);if(I>.45&&b%8===4)snare(d,t,.1);if(I>.65&&b%2===0)hat(d,t,.03);
      playTune(this.tune,s,(m,len)=>I>.35?accordion(d,mf(m),t,sp*len*.95,.09):mOsc(d,'sine',mf(m+12),t,sp*len*1.1,.08,.01));
      if(I<.6&&s%128===100){tone(1900,.18,'triangle',.03,1300);tone(1700,.22,'triangle',.025,1200,.2);}}},
  // Paw Print Isles: calypso in F (F-Bb-C-F) with steel drum, ukulele offbeats, shaker and congas
  beach:{bpm:[104,128],prog:[[53,57,60],[58,62,65],[60,64,67],[53,57,60]],
    tune:[[0,72,2],[2,74,2],[4,77,4],[8,76,2],[10,74,2],[12,72,4],[16,74,2],[18,77,2],[20,81,4],[24,79,4],[28,77,4],[32,79,2],[34,81,2],[36,84,4],[40,81,2],[42,79,2],[44,77,4],[48,76,2],[50,77,2],[52,79,4],[56,77,6],[62,72,2]],
    step(d,s,t,sp,I,ch,b){if(b===0||b===6)mOsc(d,'sine',mf(ch[0]-12),t,sp*2.5,.22,.004);if(b===8||b===14)mOsc(d,'sine',mf(ch[2]-24),t,sp*2,.18,.004);
      if(b%8===4||b%8===6&&I>.5)ch.forEach((m,i)=>pluck(d,mf(m+12),t+i*.012,sp*1.2,.035,2400));
      if(b%2===0)shaker(d,t,b%4===2?.05:.03);if(I>.3&&(b===3||b===7||b===11))conga(d,t,b===7?150:200,.16);if(I>.45&&b%8===0)drumKick(d,t,.3);
      playTune(this.tune,s,(m)=>steel(d,mf(m),t,.07+.03*I));}},
  // Fishbone Dunes: an exotic E scale over a drone, darbuka rhythm, oud plucks and a snake-charmer reed
  desert:{bpm:[96,124],prog:[[40,47,52],[40,47,52],[38,45,50],[41,48,53]],
    tune:[[0,64,4],[4,65,2],[6,68,2],[8,69,6],[16,68,2],[18,69,2],[20,71,4],[24,72,4],[28,71,2],[30,69,2],[32,68,6],[40,65,2],[42,64,2],[44,65,4],[48,68,4],[52,65,4],[56,64,8]],
    arp:[52,56,57,59,60,59,57,56],
    step(d,s,t,sp,I,ch,b){if(b===0)for(const m of[ch[0],ch[1]])mOsc(d,'sawtooth',mf(m),t,sp*15,.05,.3,500);
      if(b===0||b===8)dum(d,t,.32);if(b===4||b===6||b===12)tek(d,t,.07);if(I>.55&&(b===2||b===10||b===14))tek(d,t,.045);if(I>.7&&b===11)dum(d,t,.2);
      if(I>.3&&b%2===0)pluck(d,mf(this.arp[(s/2|0)%8]),t,sp*1.4,.05,1300+800*I);
      if(I>.15)playTune(this.tune,s,(m,len)=>reed(d,mf(m),t,sp*len*.95,.05+.03*I));}},
  // Yarnball Island: neon synthwave in F minor (Fm-Db-Ab-Eb), pumping bass, arpeggios, four on the floor
  neon:{bpm:[112,136],prog:[[53,56,60],[49,53,56],[56,60,63],[51,55,58]],
    tune:[[0,72,6],[6,75,2],[8,77,8],[16,73,6],[22,72,2],[24,68,8],[32,72,6],[38,75,2],[40,80,8],[48,79,6],[54,77,2],[56,75,8]],
    step(d,s,t,sp,I,ch,b){if(b%4===0)drumKick(d,t,.28+.22*I);if(I>.25&&(b===4||b===12)){snare(d,t,.14);mNoise(d,t,.3,.04,'highpass',2500);}if(b%4===2)hat(d,t,.045);
      if(b%2===0)mOsc(d,'sawtooth',mf(ch[0]-12+(b%4===2?12:0)),t,sp*1.6,.12,.004,400+800*I);
      if(b===0)for(const m of ch)mOsc(d,'sawtooth',mf(m+12),t,sp*15,.018,.4,1100);
      if(I>.4)mOsc(d,'square',mf(ch[s%3]+24),t,sp*.8,.035,.002,1800+2000*I);
      if(I>.6)playTune(this.tune,s,(m,len)=>mOsc(d,'sawtooth',mf(m),t,sp*len*.9,.06,.02,2600));}},
  // Frostwhisker Pole: a wintry tune in G (G-Em-C-D) with sleigh bells, celesta and pizzicato bass
  snow:{bpm:[104,130],prog:[[55,59,62],[52,55,59],[48,52,55],[50,54,57]],
    tune:[[0,79,2],[2,78,2],[4,76,4],[8,74,4],[12,71,4],[16,72,2],[18,74,2],[20,76,4],[24,74,8],[32,76,2],[34,78,2],[36,79,4],[40,81,4],[44,79,4],[48,78,2],[50,76,2],[52,74,4],[56,79,8]],
    step(d,s,t,sp,I,ch,b){if(I>.15||b%2===0)jingle(d,t,b%4===0?.06:.035);
      if(b%8===0)pluck(d,mf(ch[0]-12),t,sp*1.6,.12,900);if(b%8===4)pluck(d,mf(ch[2]-12),t,sp*1.6,.1,900);
      if(b===0)for(const m of ch)mOsc(d,'sine',mf(m+12),t,sp*15,.025,.5);
      if(I>.4&&b%8===0)drumKick(d,t,.25);if(I>.55&&b===8)mNoise(d,t,.18,.06,'bandpass',2500);
      playTune(this.tune,s,(m)=>bell(d,mf(m+12),t,.06+.02*I));if(I>.6&&b%4===2)bell(d,mf(ch[(s/4|0)%3]+24),t,.025,.4);}},
  // The Alien Arena: eerie sci-fi with a theremin lead, bleeping arpeggios, pulsing bass and laser zaps
  arena:{bpm:[118,150],prog:[[48,51,55],[54,57,61],[51,54,58],[47,50,54]],
    tune:[[0,72,8],[8,75,4],[12,78,4],[16,77,12],[28,72,4],[32,79,8],[40,78,4],[44,75,4],[48,72,16]],
    step(d,s,t,sp,I,ch,b){if(b===0||b===3||b===6||b===8||b===11||b===14)mOsc(d,'square',mf(ch[0]-24),t,sp*1.5,.1,.004,300+500*I);
      if(b===0||b===8||I>.5&&b===12)drumKick(d,t,.4);if(I>.3&&(b===4||b===12))snare(d,t,.12);if(I>.6&&b%2===1)hat(d,t,.03);
      if(I>.35){const k=(s*5)%7;mOsc(d,'sine',mf(ch[k%3]+24+(k>4?12:0)),t,sp*.7,.04,.002);}
      let prev=0;playTune(this.tune,s,(m,len)=>{theremin(d,mf(m),t,sp*len*.95,.07,prev?mf(prev):mf(m-5));prev=m;});
      if(I>.6&&s%32===28)tone(1600,.25,'square',.025,180);}}};
const THEME_VOL={bay:1.15,beach:1.1,desert:1.55,neon:.85,snow:1.45,arena:.8}; // evens out how loud each piece is
function themeBus(n){MUS.th=MUS.th||{};if(!MUS.th[n]){const g=SFX.ctx.createGain();g.gain.value=THEME_VOL[n]||1;g.connect(MUS.battle);MUS.th[n]=g;}return MUS.th[n];}
function themeStep(s,t,sp){const M=THEME_MUS[TH_NAME]||THEME_MUS.bay,d=themeBus(THEME_MUS[TH_NAME]?TH_NAME:'bay'),b=s%16,ch=M.prog[Math.floor(s/16)%4];M.step(d,s,t,sp,MUS.int,ch,b);}
const campMus=()=>state!=='menu'&&THEME_MUS[TH_NAME];
function battleTarget(){if(state==='count')return .08;if(state==='finale')return 1;if(!player)return 0;
  if(mode==='solo')return Math.min(1,.15+.75*player.r/SOLO_GOAL+.1*Math.min(1,time/120));
  const tot=mode==='camp'?LV.rivals:AI_COUNT;let v=Math.pow(1-(aliveN-1)/tot,.8);if(finalOn)v=Math.max(v,.86);
  if(mode==='camp'&&LV.goal.type!=='win')v=Math.max(v,.9*(LV.goal.type==='size'?player.r/LV.goal.n:myCats/LV.goal.n));
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
    const TM=MUS.track==='battle'&&campMus(),bpm=MUS.track==='menu'?96:TM?TM.bpm[0]+(TM.bpm[1]-TM.bpm[0])*MUS.int:124+28*MUS.int,sp=60/bpm/4;
    if(MUS.track==='menu')menuStep(MUS.step,MUS.next,sp);else if(TM)themeStep(MUS.step,MUS.next,sp);else battleStep(MUS.step,MUS.next,sp);
    MUS.next+=sp;MUS.step++;if(MUS.step%64===0)MUS.cycle++;}}

function setSound(on,user){SFX.on=on;try{localStorage.setItem('catorb-sound',on?'1':'0');}catch(e){}
  for(const id of['sndBtn','sndMenu'])if($(id))$(id).textContent=on?'Sound: on':'Sound: off';if(on&&user){audioUnlock();snd.pick(10);}}

