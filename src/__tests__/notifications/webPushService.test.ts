import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getWebInstallationId,
  isPushNotificationSupported,
  registerWebDeviceToken,
  unregisterWebDeviceToken,
} from '@/lib/notifications/webPushService';
import { api } from '@/lib/api/client';

describe('WebPushService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('generates and persists unique web installation ID in localStorage', () => {
    const id1 = getWebInstallationId();
    expect(id1).toBeTruthy();
    expect(id1.startsWith('web-')).toBe(true);

    const id2 = getWebInstallationId();
    expect(id2).toBe(id1);
  });

  it('detects push notification capability correctly', () => {
    const supported = isPushNotificationSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('registers device token with backend and stores token in localStorage', async () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ id: 'device-1' });

    const success = await registerWebDeviceToken('mock-fcm-web-token-123');
    expect(success).toBe(true);
    expect(postSpy).toHaveBeenCalledWith('/notifications/devices', expect.objectContaining({
      pushToken: 'mock-fcm-web-token-123',
      platform: 'WEB',
    }));
    expect(localStorage.getItem('girvasa_web_push_token')).toBe('mock-fcm-web-token-123');
  });

  it('unregisters device token upon logout and clears localStorage', async () => {
    localStorage.setItem('girvasa_web_push_token', 'mock-fcm-web-token-123');
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValueOnce({});

    const success = await unregisterWebDeviceToken();
    expect(success).toBe(true);
    expect(deleteSpy).toHaveBeenCalledWith(expect.stringContaining('/notifications/devices/web-'));
    expect(localStorage.getItem('girvasa_web_push_token')).toBeNull();
  });
});
