// Cat Orbs: Conquerors of Cat Earth - city generation, edible props, Cat Earth and background drawing
// ---------- city ----------
// The ground (roads, pavements, grass) is pre-drawn and cached. Everything standing on it
// (bins, hydrants, trees, cars, fountains, buildings) is a prop that cats can absorb.
const PROP_V=.3; // how much a building is worth, as a fraction of its size
const CELL=460,ROAD=80,BLK=CELL-ROAD;let BMIN=-6,BMAX=5; // city blocks -6..5 fill the square island exactly (±R0)
// the island can be cropped: k blocks out from the middle each way (6 = the full city; Clean-up Crew jobs use smaller islands)
function setIsland(k){BMIN=-k;BMAX=k-1;R0=k*CELL+40;}
const ROOF=['#b85c45','#6d7a8a','#c9b48f','#4f8a8b','#8c5e7a','#d18f52','#5d6b52','#a3a7ad','#7a4b3a','#5a6f9a'];
const CARS=['#e84a3c','#f2c14e','#3f7fd8','#f0f0f0','#2b2b2b','#3fae7a','#9b59b6'];
const WATER='#1f4e6b';
let CITY_SEED=0;
function brng(i,j){let s=(Math.imul(i,73856093)^Math.imul(j,19349663)^0x5bd1e995^Math.imul(CITY_SEED,83492791))>>>0;if(!s)s=1;
  return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();}
function circ(g,x,y,r,col){g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
const inCity=(i,j)=>i>=BMIN&&i<=BMAX&&j>=BMIN&&j<=BMAX;

// one block's layout: ground description + props. Deterministic per block, so ground and props always agree.
const blockCache=new Map();
function genBlock(i,j){const key=i*1000+j;if(blockCache.has(key))return blockCache.get(key);
  const r=brng(i,j),x=i*CELL+ROAD/2,y=j*CELL+ROAD/2,ix=x+14,iy=y+14,s=BLK-28,t=r(),B={i,j,x,y,ix,iy,s,props:[]};
  const P=B.props,pick=a=>a[Math.floor(r()*a.length)];
  const addTree=(tx,ty,rad)=>P.push({k:'tree',x:tx,y:ty,r:rad,v:rad*.5});
  const add=(k,px,py,rad,v,o)=>P.push(Object.assign({k,x:px,y:py,r:rad,v},o||{}));
  const addVeh=(cx,cy,vert,type)=>{const T=VEH[type];if(P.some(o=>(o.k==='car'||o.k==='veh')&&Math.hypot(o.x-cx,o.y-cy)<o.r+T.L+6))return;
    P.push({k:'veh',type,x:cx,y:cy,r:T.L,v:T.v,vert,L:T.L,Wd:T.W,col:pick(T.cols)});};
  const addCar=(cx,cy,vert)=>{const col=pick(TH.cars);if(P.some(o=>o.k==='car'&&Math.hypot(o.x-cx,o.y-cy)<19*CAR_S*2+6))return;P.push({k:'car',x:cx,y:cy,r:19*CAR_S,v:20,vert,col});};
  if(t<.55){B.type='bldg';const L=r(),gp=10,h2=(s-gp)/2;let lots;
    if(L<.22)lots=[[ix,iy,s,s]];
    else if(L<.47)lots=r()<.5?[[ix,iy,h2,s],[ix+h2+gp,iy,h2,s]]:[[ix,iy,s,h2],[ix,iy+h2+gp,s,h2]];
    else if(L<.75)lots=[[ix,iy,h2,h2],[ix+h2+gp,iy,h2,h2],[ix,iy+h2+gp,h2,h2],[ix+h2+gp,iy+h2+gp,h2,h2]];
    else lots=[[ix,iy,h2,s],[ix+h2+gp,iy,h2,h2],[ix+h2+gp,iy+h2+gp,h2,h2]];
    for(const[bx,by,w,h]of lots){const rad=Math.sqrt(w*h)/2*1.1,b={k:'bldg',x:bx+w/2,y:by+h/2,bx,by,w,h,r:rad,v:rad*PROP_V,hg:6+r()*18,col:pick(TH.roofs)};
      const d=r();
      if(d<.12&&w>140&&h>140)b.heli=1;
      else if(d<.25){b.garden=[];for(let k=0;k<4;k++)b.garden.push([bx+24+r()*(w-48),by+24+r()*(h-48),8+r()*8]);}
      else{b.ac=[];const n=1+Math.floor(r()*4);for(let k=0;k<n;k++)b.ac.push([bx+12+r()*(w-48),by+12+r()*(h-48)]);
        if(r()<.35&&w>70&&h>70)b.tower=[bx+24+r()*(w-48),by+24+r()*(h-48)];
        if(r()<.4&&w>80)b.sky=1;}
      P.push(b);}}
  else if(t<.72||t>=.95){B.type='park';
    B.path=[ix+6,iy+s*r(),ix+s*r(),iy+s*r(),ix+s-6,iy+s*r()];
    if(t>=.95||r()<.4)B.pond=[ix+s*(.3+r()*.4),iy+s*(.3+r()*.4),40+r()*50,30+r()*30];
    const n=7+Math.floor(r()*8);for(let k=0;k<n;k++)addTree(ix+20+r()*(s-40),iy+20+r()*(s-40),12+r()*14);
    const nb=3+Math.floor(r()*4);for(let k=0;k<nb;k++){const q=9+r()*5;add('bush',ix+16+r()*(s-32),iy+16+r()*(s-32),q,q*.6);}
    const p=B.path;for(let k=0;k<1+Math.floor(r()*3);k++){const u=.2+r()*.6,bx=(1-u)*(1-u)*p[0]+2*(1-u)*u*p[2]+u*u*p[4],by=(1-u)*(1-u)*p[1]+2*(1-u)*u*p[3]+u*u*p[5];add('bench',bx,by+16,10,9,{rot:0});}
    if(r()<.45)add('table',ix+30+r()*(s-60),iy+30+r()*(s-60),14,13);}
  else if(t<.8){B.type='plaza';if(r()<.35)add('statue',ix+s/2,iy+s/2,s*.12,28);else P.push({k:'fountain',x:ix+s/2,y:iy+s/2,r:s*.18,v:34});
    for(const[a,b]of[[.5,.12],[.5,.88],[.12,.5],[.88,.5]])if(r()<.7)add('bench',ix+s*a,iy+s*b,10,9,{rot:a===.5?0:Math.PI/2});
    if(r()<.55)add('cart',ix+s*(.25+r()*.5),iy+s*(.3+r()*.4),15,14,{col:pick(['#e84a3c','#3f7fd8','#f2c14e'])});
    for(const[a,b]of[[0,0],[1,0],[0,1],[1,1]])addTree(ix+30+a*(s-60),iy+30+b*(s-60),15);}
  else if(t<.9){B.type='parking';
    for(const row of[iy+8,iy+s/2+8])for(let k=ix+6;k<ix+s-26;k+=30)if(r()<.6)addCar(k+15,row+28,true);
    for(let k=0;k<Math.floor(r()*4);k++)add('cone',ix+20+r()*(s-40),iy+s/2-8+r()*16,5,4);}
  else{B.type='field';for(let k=0;k<2;k++)add('bench',ix+s*(.3+k*.4),iy+6,10,9,{rot:0});for(let k=0;k<2+Math.floor(r()*3);k++)add('cone',ix+30+r()*(s-60),iy+30+r()*(s-60),5,4);}
  // street furniture on the pavement, and traffic on the roads beside the block
  const nf=2+Math.floor(r()*3);for(let k=0;k<nf;k++){const e=Math.floor(r()*4),u=30+r()*(BLK-60);
    const fx=e===0?x+7:e===1?x+BLK-7:x+u,fy=e===2?y+7:e===3?y+BLK-7:y+u;
    const q=r();if(q<.3)add('hydrant',fx,fy,6,5);else if(q<.55)add('bin',fx,fy,7,6);else if(q<.7)add('mailbox',fx,fy,6,6);else if(q<.85)add('bike',fx,fy,10,8,{rot:e<2?Math.PI/2:0});else add('cone',fx,fy,5,4);}
  for(const[a,b]of[[x+7,y+7],[x+BLK-7,y+BLK-7]])add('lamp',a,b,6,5);
  if(r()<.3)for(let k=0,cx=x+40+r()*(BLK-80),cy=(j+1)*CELL+(r()<.5?-30:30);k<2+Math.floor(r()*2);k++)add('cone',cx+k*16,cy,5,4);
  const nc=Math.floor(r()*3);for(let k=0;k<nc;k++){
    if(r()<.5){if(i<BMAX||1)addCar((i+1)*CELL+(r()<.5?-21:21),y+30+r()*(BLK-60),true);}
    else addCar(x+30+r()*(BLK-60),(j+1)*CELL+(r()<.5?-21:21),false);}
  if(r()<.22){const tp=r()<.45?'bus':'van';if(r()<.5)addVeh((i+1)*CELL+(r()<.5?-21:21),y+60+r()*(BLK-120),true,tp);else addVeh(x+60+r()*(BLK-120),(j+1)*CELL+(r()<.5?-21:21),false,tp);}
  blockCache.set(key,B);return B;}

function drawGround(g,B){const{x,y,ix,iy,s}=B;
  g.fillStyle=TH.pave;rr(g,x,y,BLK,BLK,18);g.fill();g.strokeStyle=TH.paveEdge;g.lineWidth=3;g.stroke();
  if(B.type==='bldg'){g.fillStyle=TH.lot;g.fillRect(ix,iy,s,s);}
  else if(B.type==='park'){g.fillStyle=TH.grass;rr(g,ix,iy,s,s,12);g.fill();
    const p=B.path;g.strokeStyle=TH.path;g.lineWidth=12;g.lineCap='round';g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[2],p[3],p[4],p[5]);g.stroke();
    if(B.pond){const[px,py,rx,ry]=B.pond;g.fillStyle=TH.pond;g.beginPath();g.ellipse(px,py,rx,ry,0,0,7);g.fill();g.strokeStyle=TH.pondEdge;g.lineWidth=4;g.stroke();}}
  else if(B.type==='plaza'){g.fillStyle=TH.plaza;g.fillRect(ix,iy,s,s);g.strokeStyle=TH.plazaLine;g.lineWidth=2;g.beginPath();
    for(let k=28;k<s;k+=28){g.moveTo(ix+k,iy);g.lineTo(ix+k,iy+s);g.moveTo(ix,iy+k);g.lineTo(ix+s,iy+k);}g.stroke();
    for(const[a,b]of[[0,0],[1,0],[0,1],[1,1]])circ(g,ix+30+a*(s-60),iy+30+b*(s-60),20,TH.plazaPot);}
  else if(B.type==='parking'){g.fillStyle=TH.parking;g.fillRect(ix,iy,s,s);g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;
    for(const row of[iy+8,iy+s/2+8])for(let k=ix+6;k<ix+s-26;k+=30){g.beginPath();g.moveTo(k,row);g.lineTo(k,row+56);g.stroke();}}
  else{g.fillStyle=TH.field;g.fillRect(ix,iy,s,s);g.fillStyle=TH.field2;for(let k=0;k<s;k+=60)g.fillRect(ix+k,iy,30,s);
    g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=3;g.strokeRect(ix+16,iy+16,s-32,s-32);g.beginPath();g.moveTo(ix+16,iy+s/2);g.lineTo(ix+s-16,iy+s/2);g.stroke();
    g.beginPath();g.arc(ix+s/2,iy+s/2,40,0,7);g.stroke();g.strokeRect(ix+s/2-60,iy+16,120,50);g.strokeRect(ix+s/2-60,iy+s-66,120,50);}}
function drawCity(g,x0,y0,x1,y1){
  g.fillStyle=TH.water;g.fillRect(x0,y0,x1-x0,y1-y0);
  g.save();g.beginPath();g.rect(-R0,-R0,R0*2,R0*2);g.clip();
  g.fillStyle=TH.road;g.fillRect(-R0,-R0,R0*2,R0*2);
  const i0=Math.max(BMIN,Math.floor(x0/CELL)-1),i1=Math.min(BMAX+1,Math.floor(x1/CELL)+1),j0=Math.max(BMIN,Math.floor(y0/CELL)-1),j1=Math.min(BMAX+1,Math.floor(y1/CELL)+1);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const X=i*CELL,Y=j*CELL;
    g.fillStyle=TH.lane;
    if(j<=BMAX)for(let y=Y+ROAD/2+14;y<Y+CELL-ROAD/2-14;y+=46)g.fillRect(X-2,y,4,22);
    if(i<=BMAX)for(let x=X+ROAD/2+14;x<X+CELL-ROAD/2-14;x+=46)g.fillRect(x,Y-2,22,4);
    g.fillStyle=TH.zebra;
    for(let k=-34;k<34;k+=12){g.fillRect(X+k,Y-66,6,20);g.fillRect(X+k,Y+46,6,20);g.fillRect(X-66,Y+k,20,6);g.fillRect(X+46,Y+k,20,6);}}
  for(let i=i0;i<=Math.min(i1,BMAX);i++)for(let j=j0;j<=Math.min(j1,BMAX);j++)drawGround(g,genBlock(i,j));
  g.restore();
  g.strokeStyle=TH.wall;g.lineWidth=16;g.strokeRect(-R0-8,-R0-8,R0*2+16,R0*2+16); // sea wall
}

// props: live objects with a spatial grid so eating and AI only look nearby
let props=[],pgrid=new Map(),propEaten=[];
const gkey=(x,y)=>(Math.floor(x/CELL)+50)*1000+(Math.floor(y/CELL)+50);
let critters=[];
function spawnCritters(){critters=[];const R=brng(77,CITY_SEED&65535);
  for(let i=BMIN;i<=BMAX;i++)for(let j=BMIN;j<=BMAX;j++){const B=genBlock(i,j);
    if((B.type==='park'||B.type==='plaza')&&R()<.55){const cx=B.ix+B.s*(.2+R()*.6),cy=B.iy+B.s*(.2+R()*.6);
      for(let k=0;k<4+Math.floor(R()*4);k++)critters.push({k:'pigeon',x:cx+(R()-.5)*60,y:cy+(R()-.5)*60,hx:cx,hy:cy,r:5,v:5,a:R()*7,vx:0,vy:0,fly:0,t:R()*2,alive:true});}
    if(R()<.35)critters.push({k:'mouse',x:B.x+8,y:B.y+R()*BLK,r:4,v:6,a:0,vx:0,vy:0,fly:0,t:0,alive:true});}}
function updateCritters(dt){
  for(const m of critters){if(!m.alive)continue;let near=null,nd=1e9;
    for(const c of cats){if(!c.alive)continue;const ex=c.r+150;if(Math.abs(c.x-m.x)>ex||Math.abs(c.y-m.y)>ex)continue;const d=Math.hypot(c.x-m.x,c.y-m.y)-c.r;if(d<nd){nd=d;near=c;}}
    m.t-=dt;
    if(m.k==='pigeon'){
      if(near&&nd<110&&m.fly<=0){const d=Math.hypot(m.x-near.x,m.y-near.y)||1;m.vx=(m.x-near.x)/d*260+(Math.random()-.5)*80;m.vy=(m.y-near.y)/d*260+(Math.random()-.5)*80;m.fly=.9;}
      if(m.fly>0){m.fly-=dt;if(m.fly<=0){m.hx=m.x;m.hy=m.y;}}
      else{if(m.t<=0){m.t=.6+Math.random()*1.5;const a=Math.random()*7,s=Math.random()<.5?0:18;m.vx=Math.cos(a)*s+(m.hx-m.x)*.3;m.vy=Math.sin(a)*s+(m.hy-m.y)*.3;}}
    }else{
      if(near&&nd<90){const d=Math.hypot(m.x-near.x,m.y-near.y)||1;m.vx=(m.x-near.x)/d*170;m.vy=(m.y-near.y)/d*170;m.t=.4;}
      else if(m.t<=0){m.t=.8+Math.random()*1.5;const a=Math.random()*7,s=Math.random()<.3?0:55;m.vx=Math.cos(a)*s;m.vy=Math.sin(a)*s;}}
    m.x+=m.vx*dt;m.y+=m.vy*dt;const lim=R0-10;m.x=Math.max(-lim,Math.min(lim,m.x));m.y=Math.max(-lim,Math.min(lim,m.y));
    if(Math.hypot(m.vx,m.vy)>3)m.a=Math.atan2(m.vy,m.vx);}}
function buildProps(){props=[];pgrid=new Map();propEaten=[];spawnCritters();
  for(let i=BMIN;i<=BMAX;i++)for(let j=BMIN;j<=BMAX;j++)for(const p of genBlock(i,j).props){
    const q=Object.assign({},p,{alive:true});
    if(Math.abs(q.x)>R0-q.r*.3||Math.abs(q.y)>R0-q.r*.3)continue;
    if(q.k==='car'||q.k==='veh'){let clash=false;eachProp(q.x-100,q.y-100,q.x+100,q.y+100,o=>{if((o.k==='car'||o.k==='veh')&&Math.hypot(o.x-q.x,o.y-q.y)<o.r+q.r+4)clash=true;});if(clash)continue;}
    props.push(q);const k=gkey(q.x,q.y);if(!pgrid.has(k))pgrid.set(k,[]);pgrid.get(k).push(q);}}
function eachProp(x0,y0,x1,y1,fn){
  for(let gi=Math.max(BMIN-1,Math.floor(x0/CELL));gi<=Math.min(BMAX+1,Math.floor(x1/CELL));gi++)for(let gj=Math.max(BMIN-1,Math.floor(y0/CELL));gj<=Math.min(BMAX+1,Math.floor(y1/CELL));gj++){
    const a=pgrid.get((gi+50)*1000+(gj+50));if(a)for(const p of a)if(p.alive)fn(p);}}
function tree(g,x,y,r){for(const[dx,dy,k,col]of TH.tree)circ(g,x+dx*r,y+dy*r,r*k,col);}
const VEH={bus:{L:46,W:14,v:36,cols:['#f2c14e','#e84a3c','#3f9bd8']},van:{L:27,W:12,v:22,cols:['#f0f0f0','#3f7fd8','#e8873a','#5aa374']}};
function veh(g,p){g.save();g.translate(p.x,p.y);if(p.vert)g.rotate(Math.PI/2);const L=p.L,W=p.Wd;
  g.fillStyle='rgba(0,0,0,.35)';rr(g,-L+3,-W+3,L*2,W*2,6);g.fill();g.fillStyle=p.col;rr(g,-L,-W,L*2,W*2,6);g.fill();
  g.fillStyle='#1d2733';if(p.type==='bus'){for(let x=-L+8;x<L-14;x+=12)g.fillRect(x,-W+3,8,W*2-6);g.fillRect(L-10,-W+3,6,W*2-6);}
  else{g.fillRect(L-14,-W+3,8,W*2-6);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-L+4,-W+3,L*1.3,W*2-6);}
  g.restore();}
function critterDraw(g,c){g.save();g.translate(c.x,c.y);g.rotate(c.a);
  if(c.k==='pigeon'){const fl=c.fly>0,w=fl?Math.sin(clock*30)*6:0;
    if(fl){g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(8,10,6,3,0,0,7);g.fill();}
    g.fillStyle='#8d93a3';g.beginPath();g.ellipse(0,0,6,4,0,0,7);g.fill();
    if(fl){g.fillStyle='#a7acb9';g.beginPath();g.ellipse(-1,-5-w*.3,4,7+w*.2,.4,0,7);g.ellipse(-1,5+w*.3,4,7+w*.2,-.4,0,7);g.fill();}
    circ(g,5,0,2.6,'#5d6a7a');g.fillStyle='#e8b04a';g.fillRect(7,-.6,2,1.2);}
  else{g.fillStyle='#9b8f86';g.beginPath();g.ellipse(0,0,5,3.2,0,0,7);g.fill();circ(g,4,-2,1.6,'#e9b8b8');circ(g,4,2,1.6,'#e9b8b8');circ(g,6,0,.8,'#222');
    g.strokeStyle='#8a7f77';g.lineWidth=1;g.beginPath();g.moveTo(-5,0);g.quadraticCurveTo(-9,Math.sin(clock*12)*3,-12,0);g.stroke();}
  g.restore();}
function car(g,x,y,vert,col){g.save();g.translate(x,y);if(vert)g.rotate(Math.PI/2);g.scale(CAR_S,CAR_S);
  g.fillStyle='rgba(0,0,0,.35)';rr(g,-17,-7,38,19,5);g.fill();g.fillStyle=col;rr(g,-19,-9,38,18,5);g.fill();
  g.fillStyle='#1d2733';g.fillRect(4,-7,8,14);g.fillRect(-14,-6,5,12);g.restore();}
function drawProp(g,p,lo){
  if(p.k==='bldg'){const{bx,by,w,h,col}=p;
    g.fillStyle='rgba(0,0,0,.4)';g.fillRect(bx+p.hg,by+p.hg,w,h);g.fillStyle=col;g.fillRect(bx,by,w,h);
    if(lo)return;
    g.strokeStyle=shade(col,-32);g.lineWidth=6;g.strokeRect(bx+3,by+3,w-6,h-6);
    if(p.heli){const cx=bx+w/2,cy=by+h/2,R=Math.min(w,h)*.3;circ(g,cx,cy,R,'#3a3d44');g.strokeStyle='#f2c94c';g.lineWidth=4;g.beginPath();g.arc(cx,cy,R-8,0,7);g.stroke();
      g.fillStyle='#fff';g.font=`800 ${R}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('H',cx,cy+R*.05);return;}
    if(p.garden){g.fillStyle='#4f8f4f';g.fillRect(bx+14,by+14,w-28,h-28);for(const[a,b,q]of p.garden)tree(g,a,b,q);return;}
    for(const[ax,ay]of p.ac){g.fillStyle='#c9ccd2';g.fillRect(ax,ay,24,24);g.strokeStyle='#8e939b';g.lineWidth=2;g.strokeRect(ax,ay,24,24);circ(g,ax+12,ay+12,7,'#6b7079');}
    if(p.tower){const[tx,ty]=p.tower;circ(g,tx+6,ty+6,16,'rgba(0,0,0,.35)');circ(g,tx,ty,16,'#7a4f33');g.strokeStyle='#5a3a25';g.lineWidth=3;g.beginPath();g.arc(tx,ty,10,0,7);g.stroke();}
    if(p.sky){g.fillStyle='#9fc4d6';for(let a=0;a<3;a++)for(let b=0;b<2;b++)g.fillRect(bx+w-70+a*18,by+h-44+b*16,13,10);}
    return;}
  if(p.k==='tree'){if(lo)circ(g,p.x,p.y,p.r,TH.tree[1][3]);else tree(g,p.x,p.y,p.r);return;}
  if(p.k==='car'){if(lo){g.fillStyle=p.col;const L=19*CAR_S,Wd=9*CAR_S;if(p.vert)g.fillRect(p.x-Wd,p.y-L,Wd*2,L*2);else g.fillRect(p.x-L,p.y-Wd,L*2,Wd*2);}else car(g,p.x,p.y,p.vert,p.col);return;}
  if(p.k==='fountain'){circ(g,p.x,p.y,p.r,'#9a8f7e');circ(g,p.x,p.y,p.r*.8,'#5bb6d6');if(!lo){circ(g,p.x,p.y,p.r*.25,'#e9f6fb');
      g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;g.beginPath();g.arc(p.x,p.y,p.r*(.45+.15*Math.sin(clock*3)),0,7);g.stroke();}return;}
  if(lo)return;
  if(p.k==='hydrant'){circ(g,p.x+2,p.y+2,p.r,'rgba(0,0,0,.3)');circ(g,p.x,p.y,p.r,'#d9443a');circ(g,p.x,p.y,p.r*.45,'#f2f2f2');return;}
  if(p.k==='veh'){if(lo){g.fillStyle=p.col;if(p.vert)g.fillRect(p.x-p.Wd,p.y-p.L,p.Wd*2,p.L*2);else g.fillRect(p.x-p.L,p.y-p.Wd,p.L*2,p.Wd*2);}else veh(g,p);return;}
  if(p.k==='statue'){circ(g,p.x,p.y,p.r,'#9a8f7e');circ(g,p.x,p.y,p.r*.78,'#b9b1a2');if(!lo){g.fillStyle='#8c8475';const q=p.r*.5;g.beginPath();g.arc(p.x,p.y+q*.15,q,0,7);
      g.moveTo(p.x-q*.85,p.y-q*.1);g.lineTo(p.x-q*.62,p.y-q*1.1);g.lineTo(p.x-q*.1,p.y-q*.75);g.moveTo(p.x+q*.85,p.y-q*.1);g.lineTo(p.x+q*.62,p.y-q*1.1);g.lineTo(p.x+q*.1,p.y-q*.75);g.fill();}return;}
  if(lo)return;
  if(p.k==='bush'){for(const[dx,dy,k,col]of TH.bush)circ(g,p.x+dx*p.r,p.y+dy*p.r,p.r*k,col);return;}
  if(p.k==='bench'){g.save();g.translate(p.x,p.y);g.rotate(p.rot||0);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-10,-3,22,9);g.fillStyle='#8a5a3b';g.fillRect(-12,-5,24,8);g.fillStyle='#a8744f';g.fillRect(-12,-5,24,3);g.restore();return;}
  if(p.k==='table'){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(p.x-11,p.y-8,26,20);g.fillStyle='#9a6a45';g.fillRect(p.x-13,p.y-4,26,8);g.fillStyle='#7d5438';g.fillRect(p.x-13,p.y-11,26,4);g.fillRect(p.x-13,p.y+7,26,4);return;}
  if(p.k==='cart'){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(p.x-11,p.y-6,26,16);g.fillStyle='#d9d4cc';g.fillRect(p.x-13,p.y-8,26,16);
    for(let k=0;k<4;k++){g.fillStyle=k%2?'#fff':p.col;g.fillRect(p.x-13+k*6.5,p.y-12,6.5,7);}circ(g,p.x+7,p.y+2,3,'#c96a3a');return;}
  if(p.k==='lamp'){circ(g,p.x+3,p.y+3,4,'rgba(0,0,0,.3)');circ(g,p.x,p.y,4.5,'#3d4048');circ(g,p.x,p.y,2.6,'#fff2b0');return;}
  if(p.k==='mailbox'){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(p.x-4,p.y-4,11,11);g.fillStyle='#2f5fb3';rr(g,p.x-6,p.y-6,12,12,4);g.fill();g.fillStyle='#fff';g.fillRect(p.x-4,p.y-1,8,2);return;}
  if(p.k==='bike'){g.save();g.translate(p.x,p.y);g.rotate(p.rot||0);g.strokeStyle='#2b2b2b';g.lineWidth=1.6;g.beginPath();g.arc(-6,0,4,0,7);g.moveTo(10,0);g.arc(6,0,4,0,7);g.stroke();
    g.strokeStyle='#e84a3c';g.lineWidth=2;g.beginPath();g.moveTo(-6,0);g.lineTo(0,-1);g.lineTo(6,0);g.moveTo(0,-1);g.lineTo(-2,-4);g.stroke();g.restore();return;}
  if(p.k==='cone'){circ(g,p.x+1.5,p.y+1.5,p.r,'rgba(0,0,0,.3)');circ(g,p.x,p.y,p.r,'#ff7a1a');circ(g,p.x,p.y,p.r*.55,'#fff');circ(g,p.x,p.y,p.r*.3,'#ff7a1a');return;}
  if(p.k==='bin'){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(p.x-p.r+2,p.y-p.r+2,p.r*2,p.r*2);g.fillStyle='#3d7a52';g.fillRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2);g.fillStyle='#5aa374';g.fillRect(p.x-p.r,p.y-p.r,p.r*2,p.r*.6);}
}
function outlineProp(g,p,z){const m=3/z+1; // adds this prop's outline to the current path (stroked once for all)
  if(p.k==='bldg'){g.rect(p.bx-m,p.by-m,p.w+m*2,p.h+m*2);return;}
  if(p.k==='car'||p.k==='veh'){const L=(p.k==='car'?19*CAR_S:p.L)+m,Wd=(p.k==='car'?9*CAR_S:p.Wd)+m;if(p.vert)g.rect(p.x-Wd,p.y-L,Wd*2,L*2);else g.rect(p.x-L,p.y-Wd,L*2,Wd*2);return;}
  if(p.k==='bin'){g.rect(p.x-p.r-m,p.y-p.r-m,(p.r+m)*2,(p.r+m)*2);return;}
  g.moveTo(p.x+p.r+m,p.y);g.arc(p.x,p.y,p.r+m,0,Math.PI*2);}
// Eaten things fly into the eater's mouth: they swoop over, shrink to mouth size, then vanish inside.
// Drawn above the cats so the whole flight is visible. k runs 0..1; the item reaches the mouth at FLY_IN.
const FLY_IN=.8;
const mouthOf=c=>[c.x+c.r*mouthX(c),c.y+c.r*(.43+.07*(c.mo||0))];
function suck(e,fn){const o=e.p||e,ox=e.x!==undefined?e.x:o.x,oy=e.y!==undefined?e.y:o.y,[mx,my]=mouthOf(e.by),k=Math.max(0,e.k);
  const q=Math.min(1,k/FLY_IN),ea=q*q*(3-2*q)*.35+q*q*.65; // slow lift-off, then rushes in
  const dx=mx-ox,dy=my-oy,sw=Math.sin(Math.PI*q)*.18*(e.spin||1); // gentle curved swoop
  const R0=Math.max(4,e.r||o.r||8),endS=Math.min(1,Math.max(e.by.r*.1,3)/R0);
  let s=1+(endS-1)*Math.pow(q,.9),a=1;
  if(k>FLY_IN){const t=(k-FLY_IN)/(1-FLY_IN);s=endS*(1-t);a=1-t;} // swallowed
  if(s<=.005)return;
  ctx.save();ctx.globalAlpha=a;ctx.translate(ox+dx*ea-dy*sw,oy+dy*ea+dx*sw);ctx.rotate(q*1.6*(e.spin||1));ctx.scale(s,s);ctx.translate(-ox,-oy);fn();ctx.restore();}
function flyTick(list,dt,dur){for(const e of list){const was=e.k;e.k+=dt/dur;const b=e.by;
    if(e.k<FLY_IN){if(b&&!doneEating())b.gulp=Math.max(b.gulp||0,.12);} // mouth stays open until it arrives
    else if(was<FLY_IN&&b&&b.alive){if((e.r||e.p&&e.p.r||0)>=10&&!(b.pulse>0))b.pulse=.2;b.gulp=.05;}} // gulp!
  return list.filter(e=>e.k<1);}
// circle layers for batched props: [offset x, offset y (in radii), radius scale, color]
let BATCH={};
const BATCH_FIXED={  hydrant:[[.33,.33,1,'rgba(0,0,0,.3)'],[0,0,1,'#d9443a'],[0,0,.45,'#f2f2f2']],
  cone:[[.3,.3,1,'rgba(0,0,0,.3)'],[0,0,1,'#ff7a1a'],[0,0,.55,'#fff'],[0,0,.3,'#ff7a1a']],
  lamp:[[.5,.5,.67,'rgba(0,0,0,.3)'],[0,0,.75,'#3d4048'],[0,0,.43,'#fff2b0']]};
function mkBatch(){BATCH=Object.assign({tree:TH.tree,bush:TH.bush},BATCH_FIXED);}
mkBatch();
let lastProps=[],lastLo=false;
// edible outlines are drawn after the night/weather layer so they stay bright
function drawPropOutlines(z){const list=lastProps,lo=lastLo;
  if(player&&player.alive&&state!=='menu'){const a=.75+.25*Math.sin(clock*5);
    ctx.save();ctx.lineJoin='round';
    const eds=list.filter(p=>!(lo&&p.r<10)&&!p.out&&player.r>p.r*EAT);ctx.setLineDash([]);
    ctx.beginPath();for(const p of eds)outlineProp(ctx,p,z);
    ctx.strokeStyle=rgba(PAL.edible,a);ctx.lineWidth=Math.max(2.5,3/z)*PAL.w;ctx.setLineDash([9/z+2,5/z+1]);ctx.lineDashOffset=-clock*12/z;ctx.stroke();ctx.setLineDash([]);
    ctx.restore();}}
function drawProps(z,vl,vt,vw,vh){const lo=z*DPR<.32,m=60;
  const list=[];eachProp(vl-m,vt-m,vl+vw+m,vt+vh+m,p=>list.push(p));
  // small things first so buildings' shadows don't cover cars beside them oddly
  list.sort((a,b)=>(a.k==='bldg')-(b.k==='bldg'));
  // round props are drawn in batched layers (all shadows, then all bodies...), far fewer draw calls
  const lay=new Map(),add=(col,x,y,r)=>{let q=lay.get(col);if(!q)lay.set(col,q=[]);q.push(x,y,r);};
  for(const p of list){if(lo&&p.r<10)continue;const B=BATCH[p.k];
    if(B&&!(lo&&p.k!=='tree')){for(const[dx,dy,rk,col]of B)add(col,p.x+dx*p.r,p.y+dy*p.r,p.r*rk);}else if(p.k!=='bldg')drawProp(ctx,p,lo);}
  for(const[col,q]of lay){ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<q.length;i+=3){ctx.moveTo(q[i]+q[i+2],q[i+1]);ctx.arc(q[i],q[i+1],q[i+2],0,Math.PI*2);}ctx.fill();}
  for(const p of list)if(p.k==='bldg')drawProp(ctx,p,lo);
  lastProps=list;lastLo=lo;
  for(const m of critters)if(m.alive&&m.x>vl-20&&m.x<vl+vw+20&&m.y>vt-20&&m.y<vt+vh+20&&!lo)critterDraw(ctx,m);
}

// ground is cached: a low-detail whole map, plus detailed chunks near the camera
const LEXT=3100,LOW=.15,lowCv=document.createElement('canvas');
lowCv.width=lowCv.height=Math.ceil(LEXT*2*LOW);
function drawLow(){const g=lowCv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.scale(LOW,LOW);g.translate(LEXT,LEXT);drawCity(g,-LEXT,-LEXT,LEXT,LEXT);}
drawLow();
const CH=512,chunks=new Map();let chunkPx=0,chunkFail=false;
let CITY_TH='';
let CITY_R0=0;
function setCity(seed){if((seed>>>0)===CITY_SEED&&blockCache.size&&CITY_TH===TH_NAME&&CITY_R0===R0)return;CITY_SEED=seed>>>0;CITY_TH=TH_NAME;CITY_R0=R0;blockCache.clear();
  for(const c of chunks.values())c.width=c.height=0;chunks.clear();chunkPx=0;drawLow();}
function getChunk(t,cx,cy,make){const key=t+':'+cx+':'+cy;let c=chunks.get(key);
  if(c){chunks.delete(key);chunks.set(key,c);return c;}if(!make)return null;
  c=document.createElement('canvas');const px=Math.ceil((CH+2)*t);c.width=c.height=px;const g=c.getContext('2d');
  if(!g){c.width=c.height=0;chunkFail=true;return null;}
  g.scale(t,t);g.translate(-cx*CH,-cy*CH);drawCity(g,cx*CH,cy*CH,cx*CH+CH+2,cy*CH+CH+2);
  chunks.set(key,c);chunkPx+=px*px;
  while(chunkPx>(phone?(chunkFail?3e6:7e6):28e6)&&chunks.size>1){const[k0,c0]=chunks.entries().next().value;chunks.delete(k0);chunkPx-=c0.width*c0.height;c0.width=c0.height=0;}
  return c;}
// Cat Earth: the island city is a speck on a planet, revealed when the winner keeps growing
const PLANET_R=42000,STARS_BG=Array.from({length:140},()=>[Math.random(),Math.random(),Math.random()*1.6+.4,Math.random()]);
const LAND='#5d9e55',BEACH='#d8c48e';
function land(g,draw){g.fillStyle=BEACH;draw(1.06);g.fill();g.fillStyle=LAND;draw(1);g.fill();}
// the planet's continents (also drawn small on the campaign map)
function earthLand(g,clouds){
  g.save();g.beginPath();g.arc(0,0,PLANET_R,0,7);g.clip();
  // a continent shaped like a cat's head, with lakes for eyes
  const hx=-17000,hy=-9000,hr=8000;
  land(g,k=>{g.beginPath();g.arc(hx,hy,hr*k,0,7);g.moveTo(hx-hr*.85*k,hy-hr*.35);g.lineTo(hx-hr*.62,hy-hr*1.45*k);g.lineTo(hx-hr*.1*k,hy-hr*.9);
    g.moveTo(hx+hr*.85*k,hy-hr*.35);g.lineTo(hx+hr*.62,hy-hr*1.45*k);g.lineTo(hx+hr*.1*k,hy-hr*.9);});
  for(const sx of[-1,1]){g.fillStyle='#3c8fb8';g.beginPath();g.ellipse(hx+sx*hr*.35,hy-hr*.05,hr*.14,hr*.2,0,0,7);g.fill();}
  g.fillStyle='#8a6a4a';g.beginPath();g.moveTo(hx-hr*.08,hy+hr*.2);g.lineTo(hx+hr*.08,hy+hr*.2);g.lineTo(hx,hy+hr*.32);g.closePath();g.fill();
  // a paw-print archipelago
  const px=16000,py=13000;land(g,k=>{g.beginPath();g.ellipse(px,py,3800*k,3100*k,0,0,7);for(const[a,b]of[[-3900,-3600],[-1350,-5200],[1350,-5200],[3900,-3600]]){g.moveTo(px+a+1500*k,py+b);g.arc(px+a,py+b,1500*k,0,7);}});
  // a fish-shaped continent
  const fx=15500,fy=-15500;land(g,k=>{g.beginPath();g.ellipse(fx,fy,7200*k,3300*k,-.4,0,7);g.moveTo(fx+5200,fy-3300);g.lineTo(fx+10200*k,fy-7600*k);g.lineTo(fx+8200*k,fy+400*k);g.closePath();});
  // a yarn-ball island
  const yx=-13000,yy=19000;land(g,k=>{g.beginPath();g.arc(yx,yy,4300*k,0,7);});
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=260;for(const q of[.3,.6,.9]){g.beginPath();g.ellipse(yx,yy,3800,3800*q,.6,0,7);g.stroke();}
  // ice caps and drifting clouds
  g.fillStyle='rgba(240,248,255,.9)';g.beginPath();g.ellipse(0,-PLANET_R,PLANET_R*.55,PLANET_R*.12,0,0,7);g.fill();g.beginPath();g.ellipse(0,PLANET_R,PLANET_R*.5,PLANET_R*.1,0,0,7);g.fill();
  if(clouds){g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<7;i++){const a=i*.9+clock*.02,d=PLANET_R*(.35+.08*(i%4));g.beginPath();g.ellipse(Math.cos(a)*d,Math.sin(a)*d,PLANET_R*.12,PLANET_R*.04,a,0,7);g.fill();}}
  g.restore();
}
function drawEarth(z,vl,vt,vw,vh){
  if(vw<PLANET_R*.15)return; // only matters once the camera has pulled far back
  const g=ctx;
  // stars, in screen space
  g.save();g.setTransform(DPR,0,0,DPR,0,0);for(const[x,y,r,t]of STARS_BG){g.globalAlpha=.4+.5*Math.abs(Math.sin(clock*1.3+t*9));circ(g,x*W,y*H,r,'#fff');}g.restore();g.globalAlpha=1;
  const atm=g.createRadialGradient(0,0,PLANET_R*.97,0,0,PLANET_R*1.08);atm.addColorStop(0,'rgba(120,200,255,.55)');atm.addColorStop(1,'rgba(120,200,255,0)');
  g.fillStyle=atm;g.beginPath();g.arc(0,0,PLANET_R*1.08,0,7);g.fill();
  const oc=g.createRadialGradient(-PLANET_R*.35,-PLANET_R*.35,PLANET_R*.1,0,0,PLANET_R);oc.addColorStop(0,'#2f7fae');oc.addColorStop(1,'#163c5a');
  g.fillStyle=oc;g.beginPath();g.arc(0,0,PLANET_R,0,7);g.fill();
  earthLand(g,true);
  // the planet's name
  const fs=PLANET_R*.075;g.font=`800 ${fs}px "Baloo 2",sans-serif`;g.textAlign='center';g.textBaseline='middle';
  g.lineWidth=fs*.12;g.strokeStyle='rgba(10,12,16,.8)';g.strokeText('CAT EARTH',0,-PLANET_R*1.16);g.fillStyle='#fff4e0';g.fillText('CAT EARTH',0,-PLANET_R*1.16);
}
function drawBackground(z,vl,vt,vw,vh){
  if(vw>=PLANET_R*.15){ctx.fillStyle='#070a14';ctx.fillRect(vl,vt,vw,vh);drawEarth(z,vl,vt,vw,vh);}
  else{ctx.fillStyle=TH.water;ctx.fillRect(vl,vt,vw,vh);}
  ctx.drawImage(lowCv,-LEXT,-LEXT,LEXT*2,LEXT*2);
  const k=z*DPR,t=phone?(k>.9?1:k>.45?.6:k>.24?.36:0):(k>1.05?1.5:k>.5?.75:k>.24?.36:0);
  if(t){let budget=phone?2:4;
    for(let cy=Math.floor(vt/CH);cy<=Math.floor((vt+vh)/CH);cy++)for(let cx=Math.floor(vl/CH);cx<=Math.floor((vl+vw)/CH);cx++){
      const had=chunks.has(t+':'+cx+':'+cy);const c=getChunk(t,cx,cy,budget>0);if(!had&&c)budget--;
      if(c)ctx.drawImage(c,cx*CH,cy*CH,CH+2,CH+2);}}
  drawProps(z,vl,vt,vw,vh);
}

