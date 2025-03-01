// 缓存名称，更改此值将创建新的缓存
const CACHE_NAME = 'airport-stock-request-v1';

// 需要缓存的资源列表
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // 添加其他需要缓存的资源
];

// 安装service worker
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  
  // 强制新的service worker立即激活，不等待旧的service worker终止
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活service worker
self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  
  // 清理旧缓存
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker activated, claiming clients');
      return self.clients.claim();
    })
  );
});

// 处理fetch请求
self.addEventListener('fetch', event => {
  // 对manifest.json的请求不使用缓存，始终从网络获取最新版本
  if (event.request.url.includes('manifest.json')) {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('Failed to fetch manifest:', error);
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 对HTML文件使用网络优先策略，确保获取最新版本
  if (event.request.url.includes('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 克隆响应，因为响应流只能使用一次
          const responseToCache = response.clone();
          
          // 更新缓存
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(error => {
          console.log('Fetch failed; returning cached page instead.', error);
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 对其他资源使用缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存的响应，则返回缓存
        if (response) {
          return response;
        }
        
        // 否则从网络获取
        return fetch(event.request)
          .then(response => {
            // 检查是否收到有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应
            const responseToCache = response.clone();
            
            // 将响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});

// 监听消息，用于手动触发更新
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
}); 