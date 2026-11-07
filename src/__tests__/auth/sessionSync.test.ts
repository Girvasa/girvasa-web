import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  broadcastSessionEvent,
  registerSessionSync,
} from "@/lib/auth/sessionSync";

describe("Cross-Tab Session Synchronization Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
