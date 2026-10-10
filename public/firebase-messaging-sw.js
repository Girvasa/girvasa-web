// ==============================================================================
// Girvasa Web Portal - Firebase Cloud Messaging Service Worker
// Handles background push notifications, system banners, and click deep linking.
// ==============================================================================

/* eslint-disable no-undef */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming background push message
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      notification: {
        title: 'Girvasa Notification',
        body: event.data.text()
      }
    };
  }

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Girvasa Society Update';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new update in your society.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.id || 'girvasa-notification',
    data: {
      url: payload.data?.deepLink || (payload.data?.id ? `/notifications` : '/dashboard'),
      ...payload.data
    },
    requireInteraction: payload.data?.priority === 'CRITICAL' || payload.data?.priority === 'HIGH'
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Handle user clicking the system notification banner
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus and navigate it
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new browser window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
