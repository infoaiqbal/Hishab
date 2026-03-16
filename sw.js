const cacheName = 'asifio-aybay-v2'; // ভার্সন বাড়িয়ে v2 করলাম যেন ব্রাউজার নতুন আপডেট পায়
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/2344/2344132.png' // আইকন লিঙ্কটি যোগ করলাম
];

// ফাইলগুলো সেভ করা (Install)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching assets...');
      return cache.addAll(assets);
    })
  );
});

// অফলাইনে ফাইলগুলো চালানো (Fetch)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
