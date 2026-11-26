/* NUMEROSUTRAS offline cache. The build script writes the version number; change it for every new upload. */
var CACHE = 'nsr-v1';
var FILES = ['./', 'index.html', 'style.css', 'engine.js', 'library.js', 'course.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'instructor.jpg'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k.indexOf('nsr-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
/* Cache first, from this version's own cache only, so files of two versions are never mixed. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) { return c.match(e.request, { ignoreSearch: true }).then(function (hit) { return hit || fetch(e.request); }); }));
});
