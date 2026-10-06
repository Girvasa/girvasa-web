"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ShieldCheck, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTenant } from "@/lib/tenant/TenantContext";

export const UserProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentSociety } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const primaryRole = currentSociety?.roles?.[0] || "MEMBER";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 rounded-lg p-1.5 hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white shadow-sm">
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-semibold text-slate-800 leading-tight">
            {user?.fullName || user?.mobileNumber || "User"}
          </div>
          <div className="text-[10px] text-slate-500 font-medium tracking-wide">{primaryRole}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg z-50">
          <div className="px-3 py-2.5 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-900">{user?.fullName || "Authenticated User"}</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{user?.mobileNumber}</div>
            <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-600 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Session</span>
            </div>
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>My Profile</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Society Settings</span>
            </Link>
          </div>
          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
