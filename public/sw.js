// public/sw.js
self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
});

self.addEventListener('fetch', function(event) {
  // This empty fetch listener is required for Chrome to recognize it as a PWA
});