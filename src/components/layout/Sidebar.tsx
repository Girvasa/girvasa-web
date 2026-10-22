"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Home,
  Users,
  Receipt,
  CreditCard,
  MessageSquareWarning,
  UserCheck,
  CalendarCheck,
  Car,
  Bell,
  Calendar,
  Vote,
  FileText,
  UserCog,
  Briefcase,
  BarChart3,
  ShieldCheck,
  Settings,
  Activity,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermission } from "@/lib/rbac/usePermission";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  moduleKey: string;
}

interface NavGroup {
  category?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, moduleKey: "dashboard" },
    ],
  },
  {
    category: "Finance & Accounts",
    items: [
      { name: "Billing", href: "/billing", icon: Receipt, moduleKey: "billing" },
      { name: "Payments", href: "/payments", icon: CreditCard, moduleKey: "payments" },
      { name: "Financial Reports", href: "/reports", icon: BarChart3, moduleKey: "reports" },
    ],
  },
  {
    category: "Society Operations",
    items: [
      { name: "Buildings", href: "/buildings", icon: Building, moduleKey: "buildings" },
      { name: "Units", href: "/units", icon: Home, moduleKey: "units" },
      { name: "Residents", href: "/residents", icon: Users, moduleKey: "residents" },
      { name: "Complaints", href: "/complaints", icon: MessageSquareWarning, moduleKey: "complaints" },
      { name: "Visitors", href: "/visitors", icon: UserCheck, moduleKey: "visitors" },
      { name: "Amenities", href: "/amenities", icon: CalendarCheck, moduleKey: "amenities" },
      { name: "Parking", href: "/parking", icon: Car, moduleKey: "parking" },
      { name: "Notices", href: "/notices", icon: Bell, moduleKey: "notices" },
      { name: "Events", href: "/events", icon: Calendar, moduleKey: "events" },
      { name: "Polls", href: "/polls", icon: Vote, moduleKey: "polls" },
      { name: "Documents", href: "/documents", icon: FileText, moduleKey: "documents" },
      { name: "Staff", href: "/staff", icon: UserCog, moduleKey: "staff" },
      { name: "Vendors", href: "/vendors", icon: Briefcase, moduleKey: "vendors" },
      { name: "Society Settings", href: "/settings", icon: Settings, moduleKey: "settings" },
    ],
  },
  {
    category: "Platform & Developers",
    items: [
      { name: "Platform Watch", href: "/platform/watch", icon: Activity, moduleKey: "platform_watch" },
      { name: "Audit Trail", href: "/audit", icon: ShieldCheck, moduleKey: "audit" },
    ],
  },
];

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { canAccessModule, isPlatformSuperAdmin, isAccountant, isSocietyAdmin } = usePermission();

  const roleLabel = isPlatformSuperAdmin
    ? "Platform Super Admin"
    : isAccountant && !isSocietyAdmin
    ? "Accountant Workstation"
    : "Society Admin Console";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#107A48] text-white font-bold shadow-md shadow-[#107A48]/20">
              G
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base tracking-tight leading-none">GIRVASA</div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-[#107A48] mt-0.5">Society OS</div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navGroups.map((group, groupIdx) => {
            const accessibleItems = group.items.filter((item) => canAccessModule(item.moduleKey));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {group.category && (
                  <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.category}
                  </div>
                )}
                {accessibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-emerald-50 text-[#107A48] font-semibold border-r-2 border-[#107A48]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive ? "text-[#107A48]" : "text-slate-400 group-hover:text-slate-600"
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Role & build footer */}
        <div className="border-t border-slate-100 p-4 text-center">
          <div className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 mb-1">
            {roleLabel}
          </div>
          <div className="text-[10px] text-slate-400">
            Girvasa Web Admin v1.0
          </div>
        </div>
      </aside>
    </>
  );
};
