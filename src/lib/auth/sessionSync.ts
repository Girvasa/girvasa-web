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
  | "SESSION_SOCIETY_SWITCH"
  | "TAB_CLAIM_PRIMARY"
  | "TAB_RELEASE_PRIMARY";

export interface SessionSyncMessage {
  type: SessionSyncEventType;
  payload?: any;
  tabId?: string;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "girvasa_session_sync";
const PRIMARY_TAB_STORAGE_KEY = "girvasa_primary_tab_id";

/**
 * Unique identifier for this specific browser tab/window.
 * Persistent within the tab (survives reloads) but isolated between tabs.
 */
export function getTabId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = sessionStorage.getItem("girvasa_tab_id");
    if (!id) {
      id = "tab_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
      sessionStorage.setItem("girvasa_tab_id", id);
    }
    return id;
  } catch {
    return "tab_default";
  }
}

/**
 * Claims primary/active status for this tab.
 * Notifies all other open tabs on this origin that this tab is now primary.
 */
export function claimPrimaryTab(): void {
  if (typeof window === "undefined") return;
  const tabId = getTabId();
  try {
    localStorage.setItem(PRIMARY_TAB_STORAGE_KEY, tabId);
  } catch {
    // Ignore storage quota or access issues
  }
  broadcastSessionEvent("TAB_CLAIM_PRIMARY", { tabId });
}

/**
 * Releases primary status when this tab is closed or navigated away.
 */
export function releasePrimaryTab(): void {
  if (typeof window === "undefined") return;
  const tabId = getTabId();
  try {
    if (localStorage.getItem(PRIMARY_TAB_STORAGE_KEY) === tabId) {
      localStorage.removeItem(PRIMARY_TAB_STORAGE_KEY);
    }
  } catch {
    // Ignore storage issues
  }
  broadcastSessionEvent("TAB_RELEASE_PRIMARY", { tabId });
}

/**
 * Returns true if this tab is the designated primary tab, or if no tab has claimed it yet.
 */
export function isPrimaryTab(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const currentPrimary = localStorage.getItem(PRIMARY_TAB_STORAGE_KEY);
    return !currentPrimary || currentPrimary === getTabId();
  } catch {
    return true;
  }
}

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
    tabId: getTabId(),
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
  onTabSuperseded?: (claimedByTabId: string) => void;
  onTabRestored?: () => void;
}

/**
 * Register cross-tab session synchronization listeners
 * Returns an unbind cleanup function for React useEffect
 */
export function registerSessionSync(listeners: SessionSyncListeners): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const currentTabId = getTabId();
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
      case "TAB_CLAIM_PRIMARY":
        if (data.tabId && data.tabId !== currentTabId) {
          listeners.onTabSuperseded?.(data.tabId);
        }
        break;
      case "TAB_RELEASE_PRIMARY":
        if (data.tabId && data.tabId !== currentTabId) {
          // If the primary tab was released, this tab can auto-restore or check
          listeners.onTabRestored?.();
        }
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
    } else if (e.key === PRIMARY_TAB_STORAGE_KEY) {
      if (e.newValue && e.newValue !== currentTabId) {
        listeners.onTabSuperseded?.(e.newValue);
      } else if (!e.newValue) {
        listeners.onTabRestored?.();
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

  const handleBeforeUnload = () => {
    releasePrimaryTab();
  };

  channel?.addEventListener("message", handleBroadcastMessage);
  window.addEventListener("storage", handleStorageChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleWindowFocus);
  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    channel?.removeEventListener("message", handleBroadcastMessage);
    window.removeEventListener("storage", handleStorageChange);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", handleWindowFocus);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}
