/**
 * Society OS (Girvasa) Cross-Tab Session Management Service
 * 
 * Implements industry-standard multi-tab / multi-window session synchronization:
 * 1. BroadcastChannel API for real-time inter-tab messaging on the same origin.
 * 2. Window 'storage' event listener for immediate cross-tab localStorage sync.
 * 3. Document 'visibilitychange' and 'focus' handlers for inactive/background tab recovery.
 */

export type SessionSyncEventType =
  | "SESSION_LOGIN"
  | "SESSION_LOGOUT"
  | "SESSION_TOKEN_REFRESH"
  | "SESSION_SOCIETY_SWITCH";

export interface SessionSyncMessage {
  type: SessionSyncEventType;
  payload?: any;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "girvasa_session_sync";

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      return new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
}

// Global broadcast channel instance
let channelInstance: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (!channelInstance) {
    channelInstance = getBroadcastChannel();
  }
  return channelInstance;
}

/**
 * Broadcast an authentication event to all other open tabs/windows
 */
export function broadcastSessionEvent(type: SessionSyncEventType, payload?: any): void {
  const channel = getChannel();
  const message: SessionSyncMessage = {
    type,
    payload,
    timestamp: Date.now(),
  };

  if (channel) {
    try {
      channel.postMessage(message);
    } catch (err) {
      console.warn("[SessionSync] BroadcastChannel postMessage failed:", err);
    }
  }
}

export interface SessionSyncListeners {
  onLogin?: () => void;
  onLogout?: () => void;
  onSocietySwitch?: (societyId: string) => void;
  onSyncCheck?: () => void;
}

/**
 * Register cross-tab session synchronization listeners
 * Returns an unbind cleanup function for React useEffect
 */
export function registerSessionSync(listeners: SessionSyncListeners): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const channel = getChannel();

  // 1. Handle BroadcastChannel messages from other tabs
  const handleBroadcastMessage = (event: MessageEvent<SessionSyncMessage>) => {
    const data = event.data;
    if (!data || !data.type) return;

    switch (data.type) {
      case "SESSION_LOGIN":
        listeners.onLogin?.();
        break;
      case "SESSION_LOGOUT":
        listeners.onLogout?.();
        break;
      case "SESSION_SOCIETY_SWITCH":
        if (data.payload?.societyId) {
          listeners.onSocietySwitch?.(data.payload.societyId);
        }
        break;
      case "SESSION_TOKEN_REFRESH":
        listeners.onSyncCheck?.();
        break;
      default:
        break;
    }
  };

  // 2. Handle storage events (native cross-tab localStorage notification)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "girvasa_access_token") {
      if (e.newValue) {
        listeners.onLogin?.();
      } else {
        listeners.onLogout?.();
      }
    } else if (e.key === "girvasa_active_society_id") {
      if (e.newValue) {
        listeners.onSocietySwitch?.(e.newValue);
      }
    }
  };

  // 3. Handle tab visibility change / focus (when user switches back to this tab)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      listeners.onSyncCheck?.();
    }
  };

  const handleWindowFocus = () => {
    listeners.onSyncCheck?.();
  };

  channel?.addEventListener("message", handleBroadcastMessage);
  window.addEventListener("storage", handleStorageChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleWindowFocus);

  return () => {
    channel?.removeEventListener("message", handleBroadcastMessage);
    window.removeEventListener("storage", handleStorageChange);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", handleWindowFocus);
  };
}
