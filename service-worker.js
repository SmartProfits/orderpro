// 缓存版本号 - 每次更新HTML时需要更改此版本号
const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `smart-profits-cache-${CACHE_VERSION}`;

// 获取基础路径
const BASE_PATH = location.hostname === 'localhost' || location.hostname === '127.0.0.1' 
  ? '' 
  : '/orderpro';

// 需要缓存的资源列表
const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/s2.png`
];

// 安装service worker
self.addEventListener('install', event => {
  console.log('Service Worker 正在安装...');
  
  // 强制新的service worker立即激活，不等待旧的service worker终止
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活service worker
self.addEventListener('activate', event => {
  console.log('Service Worker 已激活');
  
  // 清理旧版本缓存
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 删除旧缓存 ', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // 立即控制所有页面
  return self.clients.claim();
});

// 处理网络请求
self.addEventListener('fetch', event => {
  event.respondWith(
    // 尝试从缓存中获取资源
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存的响应，则返回缓存
        if (response) {
          return response;
        }
        
        // 否则发起网络请求
        return fetch(event.request)
          .then(response => {
            // 检查是否收到有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应，因为响应是流，只能使用一次
            const responseToCache = response.clone();
            
            // 将新响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(() => {
        // 如果网络和缓存都失败，可以返回一个离线页面
        // 这里简单返回一个离线消息
        if (event.request.mode === 'navigate') {
          return new Response('您当前处于离线状态，请检查网络连接。', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
      })
  );
});

// 监听消息，用于接收更新通知
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
}); 