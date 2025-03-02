const CACHE_NAME = 'airport-stock-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/s2.png'
  // 添加您的其他资源，如CSS，JS，图片等
];

// 安装Service Worker并缓存核心资源
self.addEventListener('install', event => {
  console.log('安装新版本Service Worker: ' + CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(ASSETS);
      })
      .then(() => {
        console.log('资源缓存完成，跳过等待阶段');
        return self.skipWaiting();
      })
  );
});

// 当Service Worker被激活时，清理旧缓存
self.addEventListener('activate', event => {
  console.log('激活新版本Service Worker: ' + CACHE_NAME);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('现在使用新缓存，立即接管所有客户端');
      return self.clients.claim();
    })
  );
});

// 拦截网络请求，实现缓存优先策略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到响应，则返回缓存
        if (response) {
          return response;
        }
        // 否则，从网络获取
        return fetch(event.request)
          .then(networkResponse => {
            // 如果获取成功，将响应复制到缓存中
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('Fetch 失败:', error);
            // 这里可以返回一个离线页面或默认响应
            // return caches.match('/offline.html');
          });
      })
  );
});

// 监听消息，处理更新通知
self.addEventListener('message', event => {
  console.log('Service Worker 收到消息:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('收到跳过等待的请求，开始激活');
    self.skipWaiting();
  }
}); 