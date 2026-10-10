// ==============================================================================
// Girvasa Web Portal - Web Push Notification & FCM Client Service
// ==============================================================================

import { api } from '@/lib/api/client';

export interface DeviceRegistrationPayload {
  installationId: string;
  pushToken: string;
  platform: 'WEB' | 'ANDROID' | 'IOS';
  appVersion?: string;
}

const INSTALLATION_ID_STORAGE_KEY = 'girvasa_web_installation_id';
const PUSH_TOKEN_STORAGE_KEY = 'girvasa_web_push_token';

/**
 * Returns or generates a persistent unique installation UUID for this web browser.
 */
export function getWebInstallationId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(INSTALLATION_ID_STORAGE_KEY);
  if (!id) {
    id = 'web-' + crypto.randomUUID();
    localStorage.setItem(INSTALLATION_ID_STORAGE_KEY, id);
  }
  return id;
}

/**
 * Checks if browser push notifications and service workers are supported.
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Registers the Firebase / Web Push Service Worker.
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    return registration;
  } catch (error) {
    console.warn('[WebPush] Service worker registration failed:', error);
    return null;
  }
}

/**
 * Requests browser notification permission and subscribes if granted.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) return 'denied';

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('[WebPush] Notification permission request error:', error);
    return 'denied';
  }
}

/**
 * Registers the web push token with Girvasa Backend.
 */
export async function registerWebDeviceToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const installationId = getWebInstallationId();
    await api.post('/notifications/devices', {
      installationId,
      pushToken: token,
      platform: 'WEB',
      appVersion: '1.0.0'
    });
    localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    return true;
  } catch (error) {
    console.warn('[WebPush] Device registration failed:', error);
    return false;
  }
}

/**
 * Unregisters the web push token upon logout.
 */
export async function unregisterWebDeviceToken(): Promise<boolean> {
  try {
    const installationId = getWebInstallationId();
    if (installationId) {
      await api.delete(`/notifications/devices/${installationId}`);
    }
    localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('[WebPush] Device unregistration failed:', error);
    return false;
  }
}
