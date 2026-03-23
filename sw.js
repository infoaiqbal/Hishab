const cacheName = 'asifio-aybay-v2.3'; // ভার্সন আপডেট করলাম (Rongdhonu ফন্টসহ)
const assets = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'https://cdn.jsdelivr.net/gh/infoaiqbal/kalpurush@latest/style.css',
  'https://cdn.jsdelivr.net/gh/infoaiqbal/Rongdhonu@latest/style.css', // নতুন ফন্ট যোগ করা হলো
  'https://cdn-icons-png.flaticon.com/512/2344/2344132.png'
];

// ১. ফাইলগুলো সেভ করা (Install)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Asifio App: Caching all assets...');
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
      // ক্যাশ থাকলে সেটি দাও, না থাকলে নেটওয়ার্ক থেকে আনো
      return res || fetch(e.request).then(fetchRes => {
        // নতুন ফাইল আসলে (যেমন ফায়ারবেস বা গুগল ফন্ট) সেগুলোও ক্যাশ করবে
        return caches.open(cacheName).then(cache => {
          // শুধুমাত্র GET রিকোয়েস্ট এবং নির্দিষ্ট স্কিম ক্যাশ করবে (এরর এড়াতে)
          if (e.request.method === 'GET' && e.request.url.startsWith('http')) {
             cache.put(e.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      }).catch(() => {
        // অফলাইনে থাকলে এবং ফাইল ক্যাশে না থাকলে index.html দেখাবে
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
