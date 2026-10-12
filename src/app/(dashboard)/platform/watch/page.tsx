"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Building2,
  Users,
  Smartphone,
  Monitor,
  Cpu,
  Database,
  RefreshCw,
  Clock,
  Sparkles,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { PlatformWatchMetricsResponse, SocietyWatchItem } from "@/types/platform";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function PlatformWatchPage() {
  const [metrics, setMetrics] = useState<PlatformWatchMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const fetchMetrics = useCallback(async (showRefreshingState = false) => {
    if (showRefreshingState) setIsRefreshing(true);
    setError(null);
    try {
      const data = await endpoints.platform.getWatchMetrics();
      setMetrics(data);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.error("Failed to load platform watch metrics:", err);
      setError(err?.message || "Failed to load platform live metrics");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh interval (10 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMetrics(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMetrics]);

  const filteredSocieties = (metrics?.societies || []).filter((s: SocietyWatchItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.societyName.toLowerCase().includes(q) ||
      s.societyCode.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q) ||
      s.planName.toLowerCase().includes(q)
    );
  });

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const getRoleCount = (role: string) => {
    const dist = users?.roleDistribution as Record<string, number> | undefined;
    return dist?.[role] || 0;
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Connecting to Platform Telemetry & Multi-Tenant Watch Stream...
        </p>
      </div>
    );
  }

  const { business, users, health } = metrics || {
    business: {
      totalSocieties: 0,
      activeSocieties: 0,
      trialingSocieties: 0,
      paidSocieties: 0,
      totalUnitsManaged: 0,
      totalBuildingsManaged: 0,
      estimatedMonthlyRevenuePaise: 0,
      currency: "INR",
    },
    users: {
      totalRegisteredUsers: 0,
      totalWebUsers: 0,
      totalAppUsers: 0,
      activePast24Hours: 0,
      roleDistribution: {},
    },
    health: {
      status: "UNKNOWN",
      uptimeSeconds: 0,
      jvmMemoryUsedMb: 0,
      jvmMemoryMaxMb: 0,
      cpuCores: 0,
      activeThreads: 0,
      dbPoolActiveConnections: 0,
      dbPoolMaxConnections: 0,
      virtualThreadsEnabled: false,
      timestamp: new Date().toISOString(),
    },
  };

  const memPercentage = health.jvmMemoryMaxMb > 0 
    ? Math.round((health.jvmMemoryUsedMb / health.jvmMemoryMaxMb) * 100) 
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Live Telemetry Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Platform Live Watch
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tenant adoption, Web vs App user concurrency & infrastructure telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>Auto-Refresh (10s)</span>
          </label>

          <button
            onClick={() => fetchMetrics(true)}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Now"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Layer 3: Technical & Infrastructure Telemetry Strip */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-950 text-slate-100 p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-white">System Engine Status</span>
                <span className="rounded bg-emerald-950 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 px-2 py-0.5 uppercase tracking-wide">
                  {health.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Spring Boot 3.3 • Java 21 Virtual Threads ({health.virtualThreadsEnabled ? "Active" : "Standard"})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Uptime</div>
              <div className="font-mono font-semibold text-white text-sm mt-0.5">
                {formatUptime(health.uptimeSeconds)}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">JVM Memory</div>
              <div className="font-mono font-semibold text-white text-sm mt-0.5">
                {health.jvmMemoryUsedMb} MB <span className="text-slate-500 text-xs">/ {health.jvmMemoryMaxMb} MB</span>
              </div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${memPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">DB Connection Pool</div>
              <div className="font-mono font-semibold text-emerald-400 text-sm mt-0.5 flex items-center space-x-1">
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span>{health.dbPoolActiveConnections}</span>
                <span className="text-slate-500">/ {health.dbPoolMaxConnections} max</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Hardware Cores</div>
              <div className="font-mono font-semibold text-white text-sm mt-0.5">
                {health.cpuCores} CPU Cores
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 1: Business Watch Grid (Societies Bought, Flats, Revenue) */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Building2 className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            1. Client Societies & SaaS Adoption
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Societies */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/50 p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Societies Onboarded</span>
              <div className="rounded-xl bg-blue-100/80 p-2 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {business.totalSocieties}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {business.activeSocieties} Active
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
              <span>Trialing: <strong>{business.trialingSocieties}</strong></span>
              <span>Paid: <strong>{business.paidSocieties}</strong></span>
            </div>
          </div>

          {/* Card: Total Flats Managed */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Flats Under Mgmt</span>
              <div className="rounded-xl bg-indigo-100/80 p-2 text-indigo-600">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {business.totalUnitsManaged.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-slate-500">
                units
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
              <span>Across <strong>{business.totalBuildingsManaged}</strong> towers / wings</span>
            </div>
          </div>

          {/* Card: Monthly Recurring Revenue */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Estimated Monthly MRR</span>
              <div className="rounded-xl bg-emerald-100/80 p-2 text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tracking-tight text-emerald-700">
                {formatCurrency(business.estimatedMonthlyRevenuePaise / 100)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
              <span>Annual Run Rate: <strong>{formatCurrency((business.estimatedMonthlyRevenuePaise / 100) * 12)}</strong></span>
            </div>
          </div>

          {/* Card: Total Registered Users */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/50 p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total User Identities</span>
              <div className="rounded-xl bg-purple-100/80 p-2 text-purple-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {users.totalRegisteredUsers}
              </span>
              <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                All roles
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
              <span>Active in 24h: <strong>{users.activePast24Hours}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 2: User Activity Watch (Web Admins vs Mobile App Users) */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Users className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            2. User Concurrency Breakdown (Web vs Mobile App)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Web Users Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Monitor className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Web Portal Users</h3>
                  <p className="text-xs text-slate-500">
                    Desktop access: Society Admins, Accountants, Facility Managers, Committee
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-blue-600">
                  {users.totalWebUsers}
                </span>
                <div className="text-[10px] uppercase font-bold text-slate-400">Accounts</div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="text-xs font-semibold text-slate-700 mb-2">Web Administrative Roles</div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                  Society Admin: <strong>{getRoleCount("SOCIETY_ADMIN")}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
                  Committee: <strong>{getRoleCount("COMMITTEE_MEMBER")}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                  Accountant: <strong>{getRoleCount("ACCOUNTANT")}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                  Facility Mgr: <strong>{getRoleCount("FACILITY_MANAGER")}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Mobile App Users Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Mobile App Users</h3>
                  <p className="text-xs text-slate-500">
                    Smartphones: Residents, Flat Owners, Tenants, Gate Security Guards
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {users.totalAppUsers}
                </span>
                <div className="text-[10px] uppercase font-bold text-slate-400">Accounts</div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="text-xs font-semibold text-slate-700 mb-2">Mobile Operational Roles</div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                  Residents: <strong>{getRoleCount("RESIDENT")}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 border border-orange-200">
                  Security Guards: <strong>{getRoleCount("SECURITY_GUARD")}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 border border-cyan-200">
                  Owners: <strong>{getRoleCount("OWNER")}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 border border-purple-200">
                  Staff: <strong>{getRoleCount("MAINTENANCE_STAFF")}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 1 Table: Client Societies Roster */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200/80 p-5 sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Client Societies Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live roster of housing societies that bought or are trialing Girvasa
            </p>
          </div>

          <div className="mt-3 sm:mt-0 relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search society, city, plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Society Code & Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">SaaS Plan</th>
                <th className="px-4 py-3">Sub Status</th>
                <th className="px-4 py-3 text-center">Flats / Units</th>
                <th className="px-4 py-3 text-center">Members</th>
                <th className="px-4 py-3">Reg ID</th>
                <th className="px-5 py-3 text-right">Onboarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSocieties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No societies found matching your search.
                  </td>
                </tr>
              ) : (
                filteredSocieties.map((s) => (
                  <tr key={s.societyId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          {s.societyCode}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{s.societyName}</div>
                          <div className="text-[10px] text-slate-400">{s.societyId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {s.city}, {s.state}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
                        <Sparkles className="h-3 w-3" />
                        {s.planName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        s.subscriptionStatus === "ACTIVE" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : s.subscriptionStatus === "TRIALING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {s.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                      {s.totalUnits}
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                      {s.totalMembers}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                      {s.adminMobile}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 text-[11px]">
                      {formatDate(s.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredSocieties.length}</strong> of <strong>{business.totalSocieties}</strong> societies
          </span>
          <span className="text-[11px] text-slate-400">
            Last sync: {lastRefreshedAt.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
