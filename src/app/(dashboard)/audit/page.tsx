"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  Download,
  Calendar,
  RefreshCw,
  Clock,
  UserCheck,
  Eye,
  X,
  Copy,
  Check,
  Filter,
  Receipt,
  Users,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { ErrorState } from "@/components/common/ErrorState";
import { AccessDenied } from "@/components/common/AccessDenied";
import { endpoints } from "@/lib/api/endpoints";
import { AuditLogResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";
import { usePermission } from "@/lib/rbac/usePermission";
import { formatDateTime } from "@/lib/utils";

// Domain categories for society operations
const DOMAIN_CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "FINANCE", label: "Billing & Finance" },
  { id: "RESIDENTS", label: "Residents & Units" },
  { id: "SECURITY", label: "Gate & Security" },
  { id: "HELPDESK", label: "Complaints & Requests" },
  { id: "COMMUNITY", label: "Amenities & Events" },
  { id: "GOVERNANCE", label: "Governance & Settings" },
];

const ACTION_FILTERS = [
  { id: "ALL", label: "All Actions" },
  { id: "CREATE", label: "Create / Add" },
  { id: "UPDATE", label: "Update / Edit" },
  { id: "DELETE", label: "Delete / Remove" },
  { id: "APPROVE", label: "Approval" },
  { id: "PAYMENT", label: "Payment" },
];

const DATE_PRESETS = [
  { id: "ALL", label: "All Time" },
  { id: "TODAY", label: "Today" },
  { id: "7D", label: "Last 7 Days" },
  { id: "30D", label: "Last 30 Days" },
];

// Helper to map raw event types into human-readable titles
function formatEventTitle(eventType: string): string {
  if (!eventType) return "Society Activity";
  switch (eventType.toUpperCase()) {
    case "SOCIETY_CONTEXT_SELECTED":
      return "Session Login";
    case "BILL_CREATED":
      return "Maintenance Bill Generated";
    case "BILL_APPROVED":
      return "Maintenance Bill Approved";
    case "BILL_PUBLISHED":
      return "Maintenance Bill Published";
    case "BILL_CANCELLED":
      return "Maintenance Bill Cancelled";
    case "PAYMENT_CONFIRMED":
      return "Payment Recorded";
    case "PAYMENT_REVERSED":
      return "Payment Reversed";
    case "PAYMENT_INITIATED":
      return "Payment Initiated";
    case "MEMBERSHIP_CREATED":
      return "Member Onboarded";
    case "MEMBERSHIP_STATUS_CHANGED":
      return "Member Status Updated";
    case "MEMBERSHIP_REMOVED":
      return "Member Removed";
    case "UNIT_CREATED":
      return "Unit Added";
    case "UNIT_UPDATED":
      return "Unit Updated";
    case "BUILDING_CREATED":
      return "Building Added";
    case "BUILDING_UPDATED":
      return "Building Updated";
    case "COMPLAINT_CREATED":
      return "Complaint Logged";
    case "COMPLAINT_STATUS_CHANGED":
      return "Complaint Status Updated";
    case "COMPLAINT_RESOLVED":
      return "Complaint Resolved";
    case "VISITOR_CHECKED_IN":
      return "Visitor Checked In";
    case "VISITOR_CHECKED_OUT":
      return "Visitor Checked Out";
    case "AMENITY_BOOKING_CREATED":
      return "Amenity Booked";
    case "AMENITY_CREATED":
      return "New Facility Added";
    case "AMENITY_UPDATED":
      return "Facility Details Updated";
    case "NOTICE_PUBLISHED":
      return "Society Notice Published";
    case "ROLE_ASSIGNED":
      return "Role Assigned";
    case "ROLE_REVOKED":
      return "Role Revoked";
    case "SOCIETY_CONFIGURATION_UPDATED":
      return "Society Settings Updated";
    default:
      return eventType
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

// Clean badge styles by domain
function getDomainBadge(eventType: string) {
  const type = (eventType || "").toUpperCase();
  if (type.includes("BILL") || type.includes("PAYMENT") || type.includes("ACCOUNTING") || type.includes("VOUCHER")) {
    return {
      domain: "FINANCE",
      label: "Finance",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    };
  }
  if (type.includes("VISITOR") || type.includes("GATE") || type.includes("SECURITY") || type.includes("EMERGENCY")) {
    return {
      domain: "SECURITY",
      label: "Security",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    };
  }
  if (type.includes("COMPLAINT") || type.includes("GRIEVANCE")) {
    return {
      domain: "HELPDESK",
      label: "Helpdesk",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    };
  }
  if (type.includes("UNIT") || type.includes("MEMBER") || type.includes("OCCUPANCY") || type.includes("BUILDING")) {
    return {
      domain: "RESIDENTS",
      label: "Residents",
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    };
  }
  if (type.includes("AMENITY") || type.includes("EVENT") || type.includes("POLL") || type.includes("NOTICE")) {
    return {
      domain: "COMMUNITY",
      label: "Community",
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
    };
  }
  return {
    domain: "GOVERNANCE",
    label: "Governance",
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-500",
  };
}

export default function AuditPage() {
  const { activeSocietyId } = useTenant();
  const { canAccessModule } = usePermission();
  const canAccessAudit = canAccessModule("audit");

  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");

  // Routine login suppressor (prevents screen flooding by SOCIETY_CONTEXT_SELECTED)
  const [hideRoutineLogins, setHideRoutineLogins] = useState(true);

  // Clipboard feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getDateRangeParams = useCallback(() => {
    const now = new Date();
    if (dateRange === "TODAY") {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      return { dateFrom: todayStart, dateTo: now.toISOString() };
    }
    if (dateRange === "7D") {
      const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      return { dateFrom: d7, dateTo: now.toISOString() };
    }
    if (dateRange === "30D") {
      const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      return { dateFrom: d30, dateTo: now.toISOString() };
    }
    return {};
  }, [dateRange]);

  const fetchAuditLogs = useCallback(async () => {
    if (!activeSocietyId || !canAccessAudit) return;
    setIsLoading(true);
    setError(null);

    let attempt = 0;
    while (attempt < 2) {
      try {
        const dateParams = getDateRangeParams();
        const params: any = {
          page,
          size: pageSize,
          ...dateParams,
        };

        if (selectedAction !== "ALL") {
          params.action = selectedAction;
        }

        const res = await endpoints.audit.getLogs(params);
        const items: AuditLogResponse[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.content)
          ? res.content
          : [];

        const total =
          typeof res?.totalElements === "number"
            ? res.totalElements
            : typeof (res as any)?.meta?.totalElements === "number"
            ? (res as any).meta.totalElements
            : items.length;

        const pages =
          typeof res?.totalPages === "number"
            ? res.totalPages
            : typeof (res as any)?.meta?.totalPages === "number"
            ? (res as any).meta.totalPages
            : Math.ceil(total / pageSize) || 1;

        setLogs(items);
        setTotalElements(total);
        setTotalPages(pages);
        setError(null);
        break;
      } catch (err: any) {
        attempt++;
        if (attempt >= 2) {
          setError(err?.detail || err?.message || "Unable to load society audit events.");
          setLogs([]);
        } else {
          await new Promise((r) => setTimeout(r, 600));
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [activeSocietyId, canAccessAudit, page, pageSize, selectedAction, getDateRangeParams]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Client-side filtering on current dataset
  const filteredLogs = useMemo(() => {
    return logs.filter((l: any) => {
      const eventType = (l.eventType || "").toUpperCase();
      const action = (l.action || "").toUpperCase();

      // 1. Exclude routine logins if toggle is active
      if (hideRoutineLogins) {
        if (eventType === "SOCIETY_CONTEXT_SELECTED" || eventType === "MEMBERSHIP_VIEWED" || action === "SELECT_CONTEXT") {
          return false;
        }
      }

      // 2. Keyword search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesSearch =
          l.eventType?.toLowerCase().includes(q) ||
          formatEventTitle(l.eventType).toLowerCase().includes(q) ||
          (l.userName || l.actorName)?.toLowerCase().includes(q) ||
          (l.metadata || l.description || l.action)?.toLowerCase().includes(q) ||
          l.resource?.toLowerCase().includes(q) ||
          l.id?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 3. Category group filter
      if (selectedCategory !== "ALL") {
        const badge = getDomainBadge(eventType);
        if (badge.domain !== selectedCategory) return false;
      }

      return true;
    });
  }, [logs, search, selectedCategory, hideRoutineLogins]);

  const routineLoginsCount = useMemo(() => {
    return logs.filter((l: any) => {
      const type = (l.eventType || "").toUpperCase();
      const action = (l.action || "").toUpperCase();
      return type === "SOCIETY_CONTEXT_SELECTED" || type === "MEMBERSHIP_VIEWED" || action === "SELECT_CONTEXT";
    }).length;
  }, [logs]);

  // Metrics counts
  const financialCount = useMemo(() => {
    return logs.filter((l: any) => {
      const t = (l.eventType || "").toUpperCase();
      return t.includes("BILL") || t.includes("PAYMENT") || t.includes("ACCOUNTING");
    }).length;
  }, [logs]);

  const residentCount = useMemo(() => {
    return logs.filter((l: any) => {
      const t = (l.eventType || "").toUpperCase();
      return t.includes("MEMBER") || t.includes("UNIT") || t.includes("OCCUPANCY");
    }).length;
  }, [logs]);

  const securityCount = useMemo(() => {
    return logs.filter((l: any) => {
      const t = (l.eventType || "").toUpperCase();
      return t.includes("VISITOR") || t.includes("GATE") || t.includes("SECURITY");
    }).length;
  }, [logs]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const dateParams = getDateRangeParams();
      const exportFilters: any = { ...dateParams };
      if (selectedAction !== "ALL") exportFilters.action = selectedAction;

      const blob = await endpoints.audit.exportLogs(exportFilters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `society_audit_log_${activeSocietyId || "society"}_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Clean fallback export using active table items
      if (filteredLogs.length > 0) {
        const header = "Date & Time,Activity,Category,Actor,Resource,Action,Description,IP Address\n";
        const rows = filteredLogs
          .map((l: any) =>
            `"${formatDateTime(l.createdAt || l.timestamp)}","${formatEventTitle(l.eventType)}","${getDomainBadge(l.eventType).label}","${l.userName || l.actorName || "Admin"}","${l.resource || "—"}","${l.action || "—"}","${(l.metadata || l.description || "").replace(/"/g, '""')}","${l.ipAddress || "—"}"`
          )
          .join("\n");
        const fallbackBlob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(fallbackBlob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `society_audit_log_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
    setSelectedAction("ALL");
    setDateRange("ALL");
    setHideRoutineLogins(true);
    setPage(0);
  };

  const hasActiveFilters = search || selectedCategory !== "ALL" || selectedAction !== "ALL" || dateRange !== "ALL" || !hideRoutineLogins;

  if (!canAccessAudit) {
    return (
      <AccessDenied
        message="Only authorized Society Administrators and Compliance Officers may review statutory society activity logs."
      />
    );
  }

  const columns: Column<AuditLogResponse>[] = [
    {
      header: "Date & Time",
      accessor: (l: any) => (
        <div className="flex flex-col whitespace-nowrap">
          <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {formatDateTime(l.createdAt || l.timestamp)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Ref: {l.id?.substring(0, 8)}
          </span>
        </div>
      ),
    },
    {
      header: "Activity & Details",
      accessor: (l: any) => {
        const badge = getDomainBadge(l.eventType);
        return (
          <div className="flex flex-col max-w-md py-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1 ${badge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                {badge.label}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {formatEventTitle(l.eventType)}
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-1">
              {l.metadata || l.description || "Administrative event processed"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Performed By",
      accessor: (l: any) => {
        const actorName = l.userName || l.actorName || "Society Admin";
        const initials = actorName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase() || "SA";

        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {actorName}
              </span>
              <span className="text-[10px] text-slate-400">
                {l.ipAddress || "Web Portal"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Resource",
      accessor: (l: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-800 capitalize">
            {l.resource || "Society"}
          </span>
          {l.resourceId && l.resourceId !== activeSocietyId && (
            <span className="text-[10px] text-slate-400 font-mono">
              #{l.resourceId.substring(0, 8)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Action",
      accessor: (l: any) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold uppercase tracking-wider">
          {l.action || "EVENT"}
        </span>
      ),
    },
    {
      header: "",
      accessor: (l: any) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(l);
            setIsDetailModalOpen(true);
          }}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#006a61] hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-colors flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Society Activity &amp; Audit Log
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified &amp; Immutable
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Official record of administrative actions, billing updates, resident changes, and security events.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs transition-colors"
            title="Refresh Log"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting || logs.length === 0}
            className="px-3.5 py-2 rounded-xl bg-[#070235] hover:bg-[#150d4d] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "Exporting..." : "Export Log (CSV)"}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Activities</span>
            <FileText className="w-4 h-4 text-[#006a61]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalElements > 0 ? totalElements.toLocaleString() : logs.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Society Journal Entries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Finance &amp; Bills</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {financialCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Bills &amp; Payment Records</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Residents &amp; Units</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {residentCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Member &amp; Flat Changes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Security &amp; Gate</span>
            <Shield className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {securityCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Visitor &amp; Access Events</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by activity, member name, flat, or action..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006a61]/20 focus:border-[#006a61]"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-[#006a61]"
          >
            {DOMAIN_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Action Dropdown */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-[#006a61]"
          >
            {ACTION_FILTERS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>

          {/* Time Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDateRange(p.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  dateRange === p.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 shrink-0 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Noise Suppression & Visibility Toggle */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
            <input
              type="checkbox"
              checked={hideRoutineLogins}
              onChange={(e) => setHideRoutineLogins(e.target.checked)}
              className="w-4 h-4 rounded text-[#006a61] border-slate-300 focus:ring-[#006a61]"
            />
            <span className="font-medium">
              Hide routine session logins ({routineLoginsCount} entries hidden)
            </span>
          </label>

          <span className="text-[11px] text-slate-400">
            Showing {filteredLogs.length} matching events
          </span>
        </div>
      </div>

      {/* Routine Logins Filter Notice */}
      {hideRoutineLogins && routineLoginsCount > 0 && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Showing operational activities only. {routineLoginsCount} routine session logins are hidden from this view.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHideRoutineLogins(false)}
            className="text-xs font-semibold text-[#006a61] hover:underline shrink-0"
          >
            Show All Logins
          </button>
        </div>
      )}

      {error ? (
        <ErrorState
          title="Audit Log Service Interruption"
          message={error}
          onRetry={fetchAuditLogs}
        />
      ) : (
        /* Full-Width Activity Table */
        <div className="space-y-4">
          <Table
            columns={columns}
            data={filteredLogs}
            keyExtractor={(l) => l.id}
            isLoading={isLoading}
            emptyMessage={
              hasActiveFilters
                ? "No audit records match the selected filters."
                : "No society activity has been recorded yet."
            }
            onRowClick={(l) => {
              setSelectedLog(l);
              setIsDetailModalOpen(true);
            }}
          />

          {/* Pagination Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {totalElements === 0 ? 0 : page * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-900">
                {Math.min((page + 1) * pageSize, totalElements || logs.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">
                {(totalElements || logs.length).toLocaleString()}
              </span>{" "}
              recorded events
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-500">
                <span>Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 0 || isLoading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <span className="px-2 font-semibold text-slate-800">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>

                <button
                  type="button"
                  disabled={page + 1 >= totalPages || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Activity Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Society Activity Details"
          description={`Recorded on ${formatDateTime(selectedLog.createdAt || selectedLog.timestamp)}`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-1">
            {/* Event Header Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Activity
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {formatEventTitle(selectedLog.eventType)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getDomainBadge(selectedLog.eventType).bg}`}>
                  {getDomainBadge(selectedLog.eventType).label}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                  {selectedLog.action || "EVENT"}
                </span>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200/70 bg-white">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                  Performed By
                </span>
                <span className="font-bold text-slate-900 block">
                  {selectedLog.userName || selectedLog.actorName || "Society Admin"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  IP: {selectedLog.ipAddress || "Web Portal"}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200/70 bg-white">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                  Target Resource
                </span>
                <span className="font-bold text-slate-900 block capitalize">
                  {selectedLog.resource || "Society"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate block">
                  {selectedLog.resourceId || "Society Workspace"}
                </span>
              </div>
            </div>

            {/* Description / Summary */}
            <div className="p-3 rounded-lg border border-slate-200/70 bg-white space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Activity Summary
              </span>
              <p className="text-xs text-slate-800 leading-relaxed">
                {selectedLog.metadata || selectedLog.description || "State transition recorded and verified."}
              </p>
            </div>

            {/* Technical Metadata (Collapsible) */}
            <details className="group border border-slate-200 rounded-lg p-3 text-xs bg-slate-50/50">
              <summary className="font-semibold text-slate-600 cursor-pointer flex items-center justify-between select-none">
                <span>Technical Metadata &amp; JSON Payload</span>
                <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2), "payload")}
                    className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1"
                  >
                    {copiedKey === "payload" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === "payload" ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </Modal>
      )}
    </div>
  );
}
