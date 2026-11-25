// Cat Orbs offline support. The first visit saves the game on the device; after that it opens with no signal.
// Bump VERSION with each release so phones fetch the new files (they switch over on the next launch).
const VERSION='catorb-v2.3.0';
const FILES=['./','index.html','css/game.css','js/core.js','js/world.js','js/campaign.js','js/cleanup.js','js/city.js','js/cats.js','js/audio.js','js/game.js','js/weather.js','js/tips.js','js/render.js','js/ui.js',
  'img/cat-head-fill.png','img/cat-head-line.png','img/cat-head-face.png','icon-180.png','icon-192.png','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  // the rounded font: use the saved copy, refresh it in the background when online
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.host)){e.respondWith(caches.open(VERSION+'-fonts').then(async c=>{const hit=await c.match(req);
      const net=fetch(req).then(r=>{c.put(req,r.clone());return r;}).catch(()=>hit);return hit||net;}));return;}
  if(url.origin!==location.origin)return;
  // game files: saved copy first (instant, works offline), network as a fallback
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(VERSION).then(c=>c.put(req,cp));}return r;})));});
