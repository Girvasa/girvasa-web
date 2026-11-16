import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  broadcastSessionEvent,
  registerSessionSync,
  claimPrimaryTab,
  releasePrimaryTab,
  isPrimaryTab,
  getTabId,
} from "@/lib/auth/sessionSync";

describe("Cross-Tab Session Synchronization Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should claim primary tab and update localStorage", () => {
    const tabId = getTabId();
    expect(tabId).toBeTruthy();

    claimPrimaryTab();
    expect(isPrimaryTab()).toBe(true);
    expect(localStorage.getItem("girvasa_primary_tab_id")).toBe(tabId);
  });

  it("should detect when another tab claims primary status", () => {
    claimPrimaryTab();
    expect(isPrimaryTab()).toBe(true);

    // Another tab claims primary in localStorage
    localStorage.setItem("girvasa_primary_tab_id", "tab_other_window_123");
    expect(isPrimaryTab()).toBe(false);
  });

  it("should trigger onTabSuperseded when storage event indicates another tab claimed primary", () => {
    const onTabSuperseded = vi.fn();
    const onTabRestored = vi.fn();
    const unbind = registerSessionSync({ onTabSuperseded, onTabRestored });

    const storageEvent = new StorageEvent("storage", {
      key: "girvasa_primary_tab_id",
      newValue: "tab_other_window_999",
      oldValue: getTabId(),
    });
    window.dispatchEvent(storageEvent);

    expect(onTabSuperseded).toHaveBeenCalledWith("tab_other_window_999");
    expect(onTabRestored).not.toHaveBeenCalled();

    unbind();
  });

  it("should release primary tab on unload", () => {
    claimPrimaryTab();
    expect(localStorage.getItem("girvasa_primary_tab_id")).toBe(getTabId());

    releasePrimaryTab();
    expect(localStorage.getItem("girvasa_primary_tab_id")).toBeNull();
  });

  it("should trigger onLogin when storage event signals an active access token in another tab", () => {
    const onLogin = vi.fn();
    const onLogout = vi.fn();
    const unbind = registerSessionSync({ onLogin, onLogout });

    // Simulate another browser tab logging in and writing to localStorage
    const storageEvent = new StorageEvent("storage", {
      key: "girvasa_access_token",
      newValue: "jwt-token-from-tab-a",
      oldValue: null,
    });
    window.dispatchEvent(storageEvent);

    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onLogout).not.toHaveBeenCalled();

    unbind();
  });

  it("should trigger onLogout when storage event signals access token was cleared in another tab", () => {
    const onLogin = vi.fn();
    const onLogout = vi.fn();
    const unbind = registerSessionSync({ onLogin, onLogout });

    // Simulate another browser tab logging out and clearing localStorage
    const storageEvent = new StorageEvent("storage", {
      key: "girvasa_access_token",
      newValue: null,
      oldValue: "jwt-token-from-tab-a",
    });
    window.dispatchEvent(storageEvent);

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(onLogin).not.toHaveBeenCalled();

    unbind();
  });

  it("should trigger onSocietySwitch when active society is switched in another tab", () => {
    const onSocietySwitch = vi.fn();
    const unbind = registerSessionSync({ onSocietySwitch });

    const storageEvent = new StorageEvent("storage", {
      key: "girvasa_active_society_id",
      newValue: "soc-999-switched",
      oldValue: "soc-111-original",
    });
    window.dispatchEvent(storageEvent);

    expect(onSocietySwitch).toHaveBeenCalledWith("soc-999-switched");

    unbind();
  });

  it("should trigger onSyncCheck on visibilitychange when returning to an inactive tab", () => {
    const onSyncCheck = vi.fn();
    const unbind = registerSessionSync({ onSyncCheck });

    // Simulate document becoming visible
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
      configurable: true,
    });

    document.dispatchEvent(new Event("visibilitychange"));
    expect(onSyncCheck).toHaveBeenCalledTimes(1);

    // Simulate window focus
    window.dispatchEvent(new Event("focus"));
    expect(onSyncCheck).toHaveBeenCalledTimes(2);

    unbind();
  });

  it("should remove all event listeners when unbind is called", () => {
    const onLogin = vi.fn();
    const unbind = registerSessionSync({ onLogin });
    unbind();

    const storageEvent = new StorageEvent("storage", {
      key: "girvasa_access_token",
      newValue: "jwt-token-after-unbind",
    });
    window.dispatchEvent(storageEvent);

    expect(onLogin).not.toHaveBeenCalled();
  });
});
