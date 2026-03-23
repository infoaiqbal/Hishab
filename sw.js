const cacheName = 'asifio-aybay-v2.5'; // ভার্সন আপডেট করা হলো (Manifest Sync-এর জন্য)
const assets = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'logo.png',
  'https://cdn.jsdelivr.net/gh/infoaiqbal/kalpurush@latest/style.css',
  'https://cdn.jsdelivr.net/gh/infoaiqbal/Rongdhonu@latest/style.css'
];

// ১. ফাইলগুলো সেভ করা (Install)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Asifio App: Caching latest assets...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); 
});

// ২. পুরনো ক্যাশ মুছে ফেলা (Activate)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); 
});

// ৩. অফলাইনে ফাইলগুলো চালানো (Fetch)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).then(fetchRes => {
        return caches.open(cacheName).then(cache => {
          // রিকোয়েস্ট সফল হলে এবং সেটি GET হলে ক্যাশ করবে
          if (e.request.method === 'GET' && e.request.url.startsWith('http')) {
             cache.put(e.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
