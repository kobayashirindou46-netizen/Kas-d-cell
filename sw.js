/* Service worker Buku Kas D'Cell: aplikasi tetap bisa dibuka tanpa internet */
var CACHE='kas-dcell-v29';
var SHELL=['./','index.html','firebase-config.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','favicon-64.png'];
self.addEventListener('install',function(e){
  /* satu per satu: kalau satu file belum terunggah, pemasangan service worker tidak ikut gagal */
  e.waitUntil(caches.open(CACHE).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==CACHE}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;
  var u=new URL(r.url);
  if(r.mode==='navigate'){
    /* halaman: coba jaringan dulu supaya pembaruan cepat terpakai, cadangan dari cache */
    e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(CACHE).then(function(c){c.put('index.html',cp)});return res}).catch(function(){return caches.match('index.html')}));
    return;
  }
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com|cdnjs\.cloudflare\.com/.test(u.host)){
    e.respondWith(caches.match(r).then(function(hit){
      var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res}).catch(function(){return hit});
      return hit||net;
    }));
  }
});
