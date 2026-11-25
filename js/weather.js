// Cat Orbs: Conquerors of Cat Earth - day/night and weather
// Time of day: "cycle" runs day -> dusk -> night over a match. Weather: clear, rain, snow or fog.
const WX={type:'clear',drops:[],flash:0,nextBolt:0,amb:null,ambG:null,fog:null,fogKey:''};
// glow sprites are drawn once and reused (much cheaper than building gradients every frame)
function glowSprite(col){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,2,64,64,64);
  gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return c;}
const LAMP_GLOW=glowSprite('rgba(255,214,140,.6)'),HEAD_GLOW=glowSprite('rgba(255,250,210,.4)');
function fogLayer(){const k=W+'x'+H;if(WX.fogKey===k)return WX.fog;const c=document.createElement('canvas'),s=.25;c.width=Math.ceil(W*s);c.height=Math.ceil(H*s);
  const g=c.getContext('2d'),gr=g.createRadialGradient(c.width/2,c.height/2,Math.min(c.width,c.height)*.22,c.width/2,c.height/2,Math.max(c.width,c.height)*.62);
  gr.addColorStop(0,'rgba(205,212,222,0)');gr.addColorStop(1,'rgba(205,212,222,.82)');g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);WX.fog=c;WX.fogKey=k;return c;}
function pickWeather(){const w=mode==='camp'?LV.wx:mode==='clean'?CL.wx:SET.weather;
  if(w!=='random')return w;const r=Math.random();return r<.45?'clear':r<.7?'rain':r<.85?'snow':'fog';}
function setupWeather(){WX.type=pickWeather();WX.flash=0;WX.nextBolt=8+Math.random()*12;
  WX.drops=Array.from({length:(WX.type==='rain'?150:WX.type==='snow'?130:0)*(SET.lite?.4:1)},()=>({x:Math.random(),y:Math.random(),s:.6+Math.random()*.8,p:Math.random()*7}));
  ambient(WX.type);}
// darkness 0 (noon) .. ~.62 (night); dusk adds a warm tint around the change
function darkness(){const m=mode==='camp'&&state!=='menu'?LV.tod:mode==='clean'?CL.tod:SET.tod;if(state==='menu')return 0;if(m==='day')return 0;if(m==='dusk')return .28;if(m==='night')return .62;
  const t=time;return t<50?0:t<110?(t-50)/60*.3:Math.min(.62,.3+(t-110)/60*.32);}
function duskTint(d){return d>.05&&d<.5?Math.sin(d/.5*Math.PI)*.16:0;}
// world-space layer, drawn over the ground and props but under treats and cats
function drawWorldWeather(z,vl,vt,vw,vh){const d=darkness();
  if(WX.type==='rain'){ctx.fillStyle='rgba(30,45,70,.18)';ctx.fillRect(vl,vt,vw,vh);}
  if(WX.type==='snow'){ctx.fillStyle='rgba(240,246,255,.22)';ctx.fillRect(vl,vt,vw,vh);}
  const dt=duskTint(d);if(dt>0){ctx.fillStyle=`rgba(255,130,60,${dt})`;ctx.fillRect(vl,vt,vw,vh);}
  if(d>0){ctx.fillStyle=`rgba(10,16,44,${d})`;ctx.fillRect(vl,vt,vw,vh);
    // street lights and headlights glow at night
    if(d>.15&&z*DPR>.2){ctx.save();ctx.globalCompositeOperation='lighter';const a=Math.min(1,(d-.15)/.3);
      eachProp(vl-120,vt-120,vl+vw+120,vt+vh+120,p=>{
        if(p.k==='lamp'){ctx.globalAlpha=a;ctx.drawImage(LAMP_GLOW,p.x-95,p.y-95,190,190);ctx.globalAlpha=1;}
        else if((p.k==='car'||p.k==='veh')&&!(p.k==='car'&&p.x%3<1)){const L=p.k==='car'?19*CAR_S:p.L,dir=p.vert?[0,1]:[1,0],hx=p.x+dir[0]*L,hy=p.y+dir[1]*L;
          ctx.globalAlpha=a;ctx.drawImage(HEAD_GLOW,hx+dir[0]*30-60,hy+dir[1]*30-60,120,120);ctx.globalAlpha=1;}
        else if(p.k==='bldg'&&p.ac){ctx.fillStyle=`rgba(255,220,150,${.22*a})`;for(let i=0;i<5;i++){const u=(p.x*7+i*37)%1;ctx.fillRect(p.bx+12+((i*53+p.y)%(p.w-30)),p.by+12+((i*29+p.x)%(p.h-30)),10,8);}}});
      ctx.restore();}}}
// screen-space layer: rain, snow, fog and lightning, drawn over everything in the world
function drawScreenWeather(dt){ctx.setTransform(DPR,0,0,DPR,0,0);
  if(WX.type==='rain'){ctx.strokeStyle='rgba(200,220,255,.38)';ctx.lineWidth=1.3;ctx.beginPath();
    for(const r of WX.drops){r.y+=dt*1.6*r.s;r.x+=dt*.25*r.s;if(r.y>1.05){r.y=-.05;r.x=Math.random();}if(r.x>1.05)r.x-=1.1;
      const x=r.x*W,y=r.y*H;ctx.moveTo(x,y);ctx.lineTo(x-4*r.s,y-16*r.s);}ctx.stroke();
    if(state==='play'){WX.nextBolt-=dt;if(WX.nextBolt<=0){WX.nextBolt=14+Math.random()*20;WX.flash=1;setTimeout(()=>snd.thunder(),300+Math.random()*700);}}}
  if(WX.type==='snow'){ctx.fillStyle='rgba(255,255,255,.85)';
    for(const f of WX.drops){f.y+=dt*.09*f.s;f.p+=dt*1.5;f.x+=Math.sin(f.p)*dt*.02;if(f.y>1.03){f.y=-.03;f.x=Math.random();}
      ctx.beginPath();ctx.arc(((f.x%1)+1)%1*W,f.y*H,1.3+f.s*1.4,0,7);ctx.fill();}}
  if(WX.type==='fog')ctx.drawImage(fogLayer(),0,0,W,H);
  if(WX.flash>0){ctx.fillStyle=`rgba(235,240,255,${WX.flash*.55})`;ctx.fillRect(0,0,W,H);WX.flash=Math.max(0,WX.flash-dt*2.5);}}
// gentle looping ambience for rain and snow (wind), at the effects volume
function ambient(type){const a=SFX.ctx;try{if(WX.amb){WX.ambG.gain.setTargetAtTime(0,a.currentTime,.3);const old=WX.amb;setTimeout(()=>{try{old.stop();}catch(e){}},1500);WX.amb=null;}}catch(e){}
  if(!a||!SFX.noise||(type!=='rain'&&type!=='snow'))return;
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=SFX.noise;s.loop=true;
  f.type=type==='rain'?'bandpass':'lowpass';f.frequency.value=type==='rain'?1400:380;f.Q.value=.6;g.gain.value=0;
  s.connect(f);f.connect(g);g.connect(SFX.out);s.start();g.gain.setTargetAtTime(type==='rain'?.22:.18,a.currentTime,1);WX.amb=s;WX.ambG=g;}
