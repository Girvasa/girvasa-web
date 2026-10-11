"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, ExternalLink, ShieldAlert, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api/client";
import { requestNotificationPermission, isPushNotificationSupported } from "@/lib/notifications/webPushService";
import { useRouter } from "next/navigation";
import { useTenant } from "@/lib/tenant/TenantContext";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  notificationType: string;
  priority: string;
  status: string;
  referenceType?: string;
  referenceId?: string;
  readAt?: string;
  createdAt: string;
}

export const NotificationDropdown: React.FC = () => {
  const { activeSocietyId } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>("default");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!activeSocietyId) return;
    try {
      const res = await api.get<{ unreadCount?: number; count?: number }>("/notifications/unread-count");
      const count = res?.unreadCount ?? res?.count ?? 0;
      setUnreadCount(count);
    } catch {
      // Graceful fallback if unauthenticated or network error
    }
  }, [activeSocietyId]);

  useEffect(() => {
    if (!activeSocietyId) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [activeSocietyId, fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ content: NotificationItem[] }>("/notifications?page=0&size=5");
      if (res && Array.isArray(res.content)) {
        setNotifications(res.content);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all", {});
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "READ", readAt: new Date().toISOString() }))
      );
    } catch {
      // Graceful fallback
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    try {
      if (!item.readAt) {
        await api.post(`/notifications/${item.id}/read`, {});
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // Non-blocking
    }

    setIsOpen(false);

    // Deep link routing
    const refType = item.referenceType?.toUpperCase() || "";
    if (refType.includes("BILL") || refType.includes("INVOICE")) {
      router.push("/billing");
    } else if (refType.includes("NOTICE")) {
      router.push("/notices");
    } else if (refType.includes("COMPLAINT") || refType.includes("TICKET")) {
      router.push("/complaints");
    } else if (refType.includes("VISITOR")) {
      router.push("/visitors");
    } else {
      router.push("/dashboard");
    }
  };

  const handleEnablePush = async () => {
    const permission = await requestNotificationPermission();
    setPushStatus(permission);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-slate-100"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Web Push Prompt Banner */}
          {isPushNotificationSupported() && pushStatus === "default" && (
            <div className="border-b border-blue-100 bg-blue-50/60 p-3 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-blue-900 font-medium">Enable Web Push Notifications</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Receive instant alerts for notices, billing, and visitors on your desktop.
                </p>
                <button
                  onClick={handleEnablePush}
                  className="mt-2 text-xs font-medium bg-blue-600 text-white px-2.5 py-1 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                No notifications right now
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors relative ${
                    !item.readAt ? "bg-blue-50/20" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      {item.priority === "CRITICAL" ? (
                        <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      ) : null}
                      <p
                        className={`text-xs ${
                          !item.readAt ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                    {!item.readAt && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.body}</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60 text-[10px] text-slate-400">
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="inline-flex items-center space-x-0.5 text-blue-600 hover:underline">
                      <span>View</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
