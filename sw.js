const cacheName = 'asifio-aybay-v2.1'; // ভার্সন আরও একটু বাড়িয়ে দিলাম আপডেট নিশ্চিত করতে
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/gh/infoaiqbal/kalpurush@latest/style.css', // ফন্ট স্টাইলশিট
  'https://cdn-icons-png.flaticon.com/512/2344/2344132.png'
];

// ১. ফাইলগুলো সেভ করা (Install)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching all assets...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); // নতুন সার্ভিস ওয়ার্কারকে সাথে সাথে একটিভ হতে বাধ্য করবে
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
});

// ৩. অফলাইনে ফাইলগুলো চালানো (Fetch)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      // যদি ক্যাশে থাকে তবে ওটাই দেখাবে, না থাকলে ইন্টারনেট থেকে আনবে
      return res || fetch(e.request).catch(() => {
        // যদি ইন্টারনেট না থাকে এবং ফাইল ক্যাশেও না থাকে (যেমন নতুন কোনো পেজ)
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
