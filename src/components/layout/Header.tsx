"use client";

import React from "react";
import { Menu } from "lucide-react";
import { SocietySelector } from "./SocietySelector";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationDropdown } from "./NotificationDropdown";

export interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <SocietySelector />
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-200" />

        <UserProfileMenu />
      </div>
    </header>
  );
};
