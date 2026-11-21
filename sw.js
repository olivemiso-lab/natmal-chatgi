// 앱 껍데기를 기기에 저장해 두어 네트워크가 느려도 읽기 화면이 뜨게 한다. 결과 저장은 store.js 가 담당.
var CACHE = 'munhae-v4';
var FILES = ['./', './index.html', './teacher.html', './css/style.css', './js/config.js', './js/units.js', './js/units/4-2-3.js', './js/mascots.js', './js/textparse.js', './js/store.js', './js/drill.js', './js/student.js', './js/teacher.js', './manifest.json', './icons/icon.svg'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request).then(function (r) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); return r; }).catch(function () { return caches.match(e.request); }));
});
