self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '皮肤交易提醒';
  const options = {
    body: data.body || '今天有任务要完成哦！',
    icon: '/icon-192.png', // 可选：你可以上传一个图标
    badge: '/badge-72.png',
    data: { url: '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close   关闭();
  event.waitUntil(clients.openWindow(event.data.url || '/'));
});
