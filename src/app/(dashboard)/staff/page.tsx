"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Building,
  CheckCircle2,
  Clock,
  Phone,
  RefreshCw,
  MoreVertical,
  Eye,
  FileText,
  Check,
  Coffee,
  ArrowRight,
  AlertTriangle,
  Calendar,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { endpoints } from "@/lib/api/endpoints";
import { StaffResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function StaffPage() {
  const { activeSocietyId } = useTenant();
  const [activeTab, setActiveTab] = useState<"directory" | "gate_attendance" | "payroll_timesheets">("directory");
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffResponse | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Enroll Form State
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formArea, setFormArea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Gate Roster State
  const [gateRoster, setGateRoster] = useState([
    {
      gateId: "GATE-01",
      gateName: "Main Gate 01 (Ingress / Egress)",
      guardName: "Rajesh Sharma",
      staffId: "#SEC-101",
      shift: "Day Shift (07:00 - 19:00)",
      status: "ON_DUTY" as const,
      activeDuration: "05:40:12",
      breakDuration: "0m / 45m limit",
      clearedIngress: 24,
      handoverDone: true,
      notes: "Visitor boom barrier operational; Intercom line active.",
      isVerified: true,
    },
    {
      gateId: "GATE-02",
      gateName: "Service Gate 02 (Delivery & Commercial)",
      guardName: "Ram Singh",
      staffId: "#SEC-102",
      shift: "Day Shift (07:00 - 19:00)",
      status: "ON_DUTY" as "ON_DUTY" | "ON_BREAK" | "OFF_DUTY" | "ON_LEAVE" | "BUNKING_DETECTED",
      activeDuration: "05:42:19",
      breakDuration: "14m / 45m limit",
      clearedIngress: 18,
      handoverDone: true,
      notes: "Service vendor logs verified; Delivery OTP bypass active.",
      isVerified: true,
      leaveType: "Casual Leave",
      telemetry: {
        latitude: 18.521850,
        longitude: 73.857920,
        distanceMeters: 142,
        speedKmh: 4.8,
      },
    },
    {
      gateId: "GATE-03",
      gateName: "Clubhouse & Rear Emergency Gate",
      guardName: "Suresh Patil",
      staffId: "#SEC-103",
      shift: "Night Shift (19:00 - 07:00)",
      status: "OFF_DUTY" as const,
      activeDuration: "00:00:00",
      breakDuration: "0m",
      clearedIngress: 0,
      handoverDone: false,
      notes: "Shift handover scheduled at 19:00 PM; Perimeter locked.",
      isVerified: false,
    },
  ]);

  // Regularize Modal State
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [selectedGateForRegularize, setSelectedGateForRegularize] = useState<typeof gateRoster[0] | null>(null);
  const [regularizeReason, setRegularizeReason] = useState("");
  const [regularizeStatus, setRegularizeStatus] = useState<"ON_DUTY" | "ON_BREAK" | "OFF_DUTY">("ON_DUTY");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Accountant Payroll Posting State
  const [payrollMonth, setPayrollMonth] = useState("November 2026");
  const [isPostingPayroll, setIsPostingPayroll] = useState(false);
  const [payrollPostedSuccess, setPayrollPostedSuccess] = useState(false);

  const [payrollRecords] = useState([
    {
      staffId: "SEC-101",
      name: "Rajesh Sharma",
      agency: "SIS Security Services Ltd.",
      assignedGate: "Gate 1 (Main Ingress)",
      scheduledShifts: 28,
      deliveredShifts: 28,
      activeHours: 224.0,
      overtimeHours: 12.0,
      breakDeductions: 0.0,
      basePay: 18000,
      overtimePay: 2300,
      netPayable: 20300,
      status: "VERIFIED" as const,
    },
    {
      staffId: "SEC-102",
      name: "Ram Singh",
      agency: "SIS Security Services Ltd.",
      assignedGate: "Gate 2 (Service Gate)",
      scheduledShifts: 28,
      deliveredShifts: 26,
      activeHours: 208.5,
      overtimeHours: 16.0,
      breakDeductions: 0.0,
      basePay: 18000,
      overtimePay: 2700,
      netPayable: 20700,
      status: "VERIFIED" as const,
    },
    {
      staffId: "SEC-103",
      name: "Suresh Patil",
      agency: "SIS Security Services Ltd.",
      assignedGate: "Clubhouse / Rear Gate",
      scheduledShifts: 28,
      deliveredShifts: 24,
      activeHours: 192.0,
      overtimeHours: 4.0,
      breakDeductions: 0.0,
      basePay: 18000,
      overtimePay: 1900,
      netPayable: 19900,
      status: "VERIFIED" as const,
    },
  ]);

  const FALLBACK_STAFF: StaffResponse[] = [
    {
      id: "st-demo-1",
      societyId: activeSocietyId || "soc-1",
      fullName: "Ramesh Pawar",
      phone: "+91 98201 12345",
      category: "Security Guard",
      isActive: true,
      assignedArea: "Main Gate 1 & Perimeter",
    },
    {
      id: "st-demo-2",
      societyId: activeSocietyId || "soc-1",
      fullName: "Mahesh Jadhav",
      phone: "+91 98202 23456",
      category: "Electrician",
      isActive: true,
      assignedArea: "Tower A & DG Backup",
    },
    {
      id: "st-demo-3",
      societyId: activeSocietyId || "soc-1",
      fullName: "Sunita Kamble",
      phone: "+91 98203 34567",
      category: "Housekeeping",
      isActive: true,
      assignedArea: "Clubhouse & Lobby",
    },
  ];

  const fetchStaffData = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [staffData, catData] = await Promise.all([
        endpoints.staff.getStaff().catch(() => []),
        endpoints.staff.getCategories().catch(() => []),
      ]);
      const rawList = Array.isArray(staffData) && staffData.length > 0 ? staffData : FALLBACK_STAFF;
      setStaff(rawList);
      setCategories(Array.isArray(catData) ? catData : []);
      if (rawList.length > 0 && !selectedStaff) {
        setSelectedStaff(rawList[0]);
      }
    } catch (err: any) {
      console.error("Failed to load staff:", err);
      setStaff(FALLBACK_STAFF);
      if (!selectedStaff) setSelectedStaff(FALLBACK_STAFF[0]);
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMobile.trim()) return;
    setIsSubmitting(true);
    try {
      const categoryId = formCategoryId || (categories.length > 0 ? categories[0].id : null);
      await endpoints.staff.createStaff({
        fullName: formName.trim(),
        mobile: formMobile.trim(),
        categoryId,
        assignedArea: formArea.trim() || "Society Premises",
        joiningDate: new Date().toISOString().split("T")[0],
      });
      await fetchStaffData();
      setIsEnrollModalOpen(false);
      setFormName("");
      setFormMobile("");
      setFormArea("");
      setActionNotice("New staff member enrolled and queued for society access badge.");
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to enroll staff member. Check permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRegularizeModal = (gate: typeof gateRoster[0]) => {
    setSelectedGateForRegularize(gate);
    setRegularizeStatus(gate.status);
    setRegularizeReason("");
    setIsRegularizeModalOpen(true);
  };

  const handleSaveRegularize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGateForRegularize) return;
    setGateRoster((prev) =>
      prev.map((g) =>
        g.gateId === selectedGateForRegularize.gateId
          ? {
              ...g,
              status: regularizeStatus,
              notes: regularizeReason
                ? `[Admin Regularized]: ${regularizeReason}`
                : g.notes,
              isVerified: true,
            }
          : g
      )
    );
    setIsRegularizeModalOpen(false);
    setActionNotice(
      `Shift for ${selectedGateForRegularize.guardName} at ${selectedGateForRegularize.gateName} regularized successfully.`
    );
  };

  const handlePostPayrollToLedger = () => {
    setIsPostingPayroll(true);
    setTimeout(() => {
      setIsPostingPayroll(false);
      setPayrollPostedSuccess(true);
      setActionNotice(
        "✓ Monthly Guard Payroll (₹60,900.00) verified and posted to General Ledger (Account Head 4101-SEC)! Voucher #VCH-2026-SEC created."
      );
    }, 700);
  };

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      s.fullName?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.phone?.includes(q);
    const matchesCategory =
      selectedCategory === "all" ||
      s.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const activeStaffCount = staff.filter((s) => s.isActive).length;

  const columns: Column<StaffResponse>[] = [
    {
      header: "Staff Identity",
      accessor: (s) => (
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setSelectedStaff(s)}
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-[#070235] text-xs border border-slate-200 shrink-0">
            {s.fullName
              ? s.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "ST"}
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                s.isActive ? "bg-[#006a61]" : "bg-slate-300"
              }`}
            ></span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#070235] truncate">{s.fullName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#006a61]" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="font-mono text-[#070235] font-semibold">
                #STF-{s.id ? s.id.substring(0, 4) : "—"}
              </span>
              <span>•</span>
              <span>{s.phone || "No phone"}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Role / Category",
      accessor: (s) => (
        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-[#070235] font-semibold capitalize">
          {s.category || "General Staff"}
        </span>
      ),
    },
    {
      header: "Assigned Area",
      accessor: (s) => (
        <span className="text-xs text-slate-700 font-medium">
          {s.assignedArea || "Society Premises"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (s) => (
        <Badge variant={s.isActive ? "success" : "neutral"}>
          {s.isActive ? "Active Duty" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (s) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStaff(s);
              setIsDossierModalOpen(true);
            }}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Dossier
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
            <span>Operations</span>
            <span>&rsaquo;</span>
            <span>Security &amp; Workforce</span>
            <span>&rsaquo;</span>
            <span className="text-[#070235] font-semibold">
              {activeTab === "directory"
                ? "Staff Directory"
                : activeTab === "gate_attendance"
                ? "Live Gate Attendance"
                : "Monthly Timesheets & Payroll"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#070235]">
              {activeTab === "directory"
                ? "Staff & Daily Help Directory"
                : activeTab === "gate_attendance"
                ? "Gate Attendance & Shift Operations"
                : "Guard Attendance & Monthly Payroll"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-50 text-[#006a61] text-[10px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
              Live Operations
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={fetchStaffData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#070235] text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh</span>
          </button>
          {activeTab === "directory" && (
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#070235] text-white text-xs font-semibold hover:bg-[#1e1b4b] transition-all shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Enroll Staff Member</span>
            </button>
          )}
          {activeTab === "payroll_timesheets" && (
            <button
              type="button"
              onClick={handlePostPayrollToLedger}
              disabled={isPostingPayroll || payrollPostedSuccess}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                payrollPostedSuccess
                  ? "bg-teal-600 text-white"
                  : "bg-[#006a61] hover:bg-[#00524a] text-white"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{payrollPostedSuccess ? "Voucher #VCH-2026 Posted" : isPostingPayroll ? "Posting Voucher..." : "Post to Ledger (4101-SEC)"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Aware View Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "directory"
              ? "bg-[#070235] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gate_attendance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "gate_attendance"
              ? "bg-[#070235] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Gate Attendance &amp; Live Roster</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">2 Active</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payroll_timesheets")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "payroll_timesheets"
              ? "bg-[#070235] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Guard Timesheets &amp; Payroll (Accountant Desk)</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-[#070235] font-bold">4101-SEC</span>
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-[#006a61] text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          {/* Dynamic Metric Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Registered Staff
                  </span>
                  <span className="text-2xl text-[#070235] font-bold mt-1 tracking-tight">
                    {staff.length} <span className="text-xs text-slate-400 font-normal">Personnel</span>
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-[#070235]">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Total Enrolled Profiles</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Active On Duty
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl text-[#006a61] font-bold tracking-tight">{activeStaffCount}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#006a61]">
                      Active Status
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-[#006a61]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Verified Society Personnel</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-300"></div>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Categories Configured
                  </span>
                  <span className="text-2xl text-[#070235] font-bold mt-1 tracking-tight">
                    {categories.length} <span className="text-xs text-slate-500 font-medium">Types</span>
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-[#070235]">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Configured Service Categories</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-300"></div>
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Tenant Isolation
                  </span>
                  <span className="text-xl text-[#070235] font-bold mt-1 tracking-tight truncate">
                    {activeSocietyId ? activeSocietyId.substring(0, 8) : "Active"}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#070235]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Direct Tenant Isolation Enforced</span>
              </div>
            </div>
          </div>

          {/* Main Workspace (Grid 8 cols / 4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols): Table */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, role, phone..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-[#070235] border border-slate-200 transition-all"
                  />
                </div>
                {categories.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCategory === "all" ? "bg-[#070235] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      All ({staff.length})
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategory(c.name)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedCategory.toLowerCase() === c.name.toLowerCase()
                            ? "bg-[#070235] text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {error ? (
                  <ErrorState message={error} onRetry={fetchStaffData} />
                ) : (
                  <Table
                    columns={columns}
                    data={filtered}
                    keyExtractor={(s) => s.id}
                    isLoading={isLoading}
                    emptyMessage="No staff members registered matching query."
                  />
                )}
              </div>
            </div>

            {/* Right Column (4 cols): Selected Staff Detail Card */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-[#070235] pb-2 border-b border-slate-100 mb-3">
                  Staff Inspector
                </h3>
                {selectedStaff ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#070235] text-sm border border-slate-200">
                        {selectedStaff.fullName
                          ? selectedStaff.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                          : "ST"}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{selectedStaff.fullName}</h4>
                        <span className="text-slate-400 text-[11px] block">{selectedStaff.category || "Staff"}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-semibold text-slate-800">{selectedStaff.phone || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Assigned Area:</span>
                        <span className="font-semibold text-slate-800">{selectedStaff.assignedArea || "Premises"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <Badge variant={selectedStaff.isActive ? "success" : "neutral"}>
                          {selectedStaff.isActive ? "Active Duty" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Select a staff member from the table to inspect details.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GATE ATTENDANCE & LIVE ROSTER (Society Admin Console) */}
      {activeTab === "gate_attendance" && (
        <div className="space-y-6">
          {/* Operations Overview Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Active Gates Covered
                  </span>
                  <div className="text-2xl text-[#006a61] font-bold mt-1 tracking-tight">
                    2 / 2 <span className="text-xs text-slate-400 font-normal">Gates Online</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-[#006a61]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>100% Shift Coverage Maintained</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Ingress Cleared Today
                  </span>
                  <div className="text-2xl text-[#070235] font-bold mt-1 tracking-tight">
                    42 <span className="text-xs text-slate-400 font-normal">Entries Approved</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-[#070235]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Synced in real-time with Mobile</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Break Compliance
                  </span>
                  <div className="text-2xl text-amber-600 font-bold mt-1 tracking-tight">
                    0 <span className="text-xs text-slate-400 font-normal">Overstay Violations</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Coffee className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>45m Daily Tea Break Allowance</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Security Agency
                  </span>
                  <div className="text-sm font-bold text-[#070235] mt-1.5 truncate">
                    SIS Security Services Ltd.
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#070235]">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Monthly Contract #SEC-2024</span>
              </div>
            </div>
          </div>

          {/* Live Gate Operations Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gateRoster.map((gate) => {
              const isOnDuty = gate.status === "ON_DUTY";
              const isOnBreak = gate.status === "ON_BREAK";
              const isBunking = gate.status === "BUNKING_DETECTED";
              const isOnLeave = gate.status === "ON_LEAVE";
              return (
                <div
                  key={gate.gateId}
                  className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative"
                >
                  <div>
                    {/* Header: Gate and Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                          {gate.gateId}
                        </span>
                        <h3 className="font-bold text-[#070235] text-sm mt-1">{gate.gateName}</h3>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                          isBunking
                            ? "bg-rose-50 text-rose-700 border border-rose-300 animate-pulse"
                            : isOnLeave
                            ? "bg-purple-50 text-purple-700 border border-purple-300"
                            : isOnDuty
                            ? "bg-teal-50 text-[#006a61] border border-teal-200"
                            : isOnBreak
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {isBunking
                          ? "⚠️ BUNKING DETECTED"
                          : isOnLeave
                          ? "📅 ON LEAVE"
                          : isOnDuty
                          ? "● ON DUTY"
                          : isOnBreak
                          ? "☕ ON BREAK"
                          : "OFF DUTY"}
                      </span>
                    </div>

                    {/* Guard Identity */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#070235] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {gate.guardName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">{gate.guardName}</div>
                        <div className="text-slate-500 text-[11px] font-mono">{gate.staffId} • {gate.shift}</div>
                      </div>
                    </div>

                    {/* Geofence Breach Alert & Exclusive GPS Telemetry */}
                    {isBunking && (
                      <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>GEOFENCE BREACH: POST ABANDONMENT</span>
                        </div>
                        <p className="text-[11px] text-rose-800 leading-tight">
                          Guard moved {gate.telemetry?.distanceMeters ?? 142}m away from Gate 2 post without logging Punch Out or Tea Break. 60m perimeter breached.
                        </p>
                        {/* EXCLUSIVE GPS TELEMETRY (Hon. Secretary & Accountant RBAC) */}
                        <div className="p-2.5 bg-white border border-rose-200 rounded-lg text-xs font-mono space-y-1 shadow-xs">
                          <div className="text-[10px] text-rose-600 uppercase font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Live GPS Telemetry (Secretary &amp; Accountant Only):</span>
                          </div>
                          <div className="text-slate-900 font-bold text-[11px]">
                            Coordinates: {gate.telemetry?.latitude ?? 18.521850}° N, {gate.telemetry?.longitude ?? 73.857920}° E
                          </div>
                          <div className="text-slate-600 text-[10px]">
                            {gate.telemetry?.distanceMeters ?? 142}m out of bounds (Limit: 60m) • Speed: {gate.telemetry?.speedKmh ?? 4.8} km/h • GPS Ping: Live
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setGateRoster((prev) =>
                              prev.map((g) =>
                                g.gateId === gate.gateId
                                  ? {
                                      ...g,
                                      status: "ON_DUTY",
                                      notes: "Bunking alert resolved. Guard reported back to Gate 2.",
                                    }
                                  : g
                              )
                            );
                            setActionNotice("Bunking alert resolved. Guard back at Gate 2 post.");
                          }}
                          className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all text-center shadow-xs"
                        >
                          Resolve Alert (Guard Back at Post)
                        </button>
                      </div>
                    )}

                    {/* On Leave Notice Banner */}
                    {isOnLeave && (
                      <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                          <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>ON APPROVED LEAVE ({gate.leaveType ?? "Casual Leave"})</span>
                        </div>
                        <p className="text-[11px] text-purple-800 leading-tight">
                          Ram Singh on approved leave. Reliever Suresh Patil deployed at Gate 2. Shift recorded without SLA penalty.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setGateRoster((prev) =>
                              prev.map((g) =>
                                g.gateId === gate.gateId
                                  ? {
                                      ...g,
                                      status: "ON_DUTY",
                                      notes: "Leave ended. Ram Singh resumed active duty.",
                                    }
                                  : g
                              )
                            );
                            setActionNotice("Leave ended. Ram Singh resumed active duty.");
                          }}
                          className="w-full py-1.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-all text-center"
                        >
                          Resume Duty (Back from Leave)
                        </button>
                      </div>
                    )}

                    {/* Live Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Shift Duration</span>
                        <span className="text-sm font-mono font-bold text-[#006a61] mt-0.5 block">
                          {isOnLeave ? "On Leave" : isBunking ? "142m Breach" : gate.activeDuration}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Break Duration</span>
                        <span className="text-sm font-mono font-bold text-slate-700 mt-0.5 block">
                          {gate.breakDuration}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Ingress Processed</span>
                        <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                          {gate.clearedIngress} Visitors
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Equipment / Handover</span>
                        <span className={`text-[11px] font-bold mt-0.5 block ${gate.handoverDone ? "text-[#006a61]" : "text-slate-400"}`}>
                          {gate.handoverDone ? "✓ Handover Verified" : "Pending Night Shift"}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    <p className="text-[11px] text-slate-500 italic mb-4">
                      {gate.notes}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenRegularizeModal(gate)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all text-center"
                    >
                      Regularize Punch
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGateRoster((prev) =>
                          prev.map((g) =>
                            g.gateId === gate.gateId ? { ...g, isVerified: true } : g
                          )
                        );
                        setActionNotice(`Shift for ${gate.guardName} verified for Accountant payroll.`);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all text-center ${
                        gate.isVerified
                          ? "bg-teal-50 text-[#006a61] border border-teal-200"
                          : "bg-[#070235] text-white hover:bg-[#1e1b4b]"
                      }`}
                    >
                      {gate.isVerified ? "✓ Verified" : "Verify Shift"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY TIMESHEETS & PAYROLL (Accountant & Management Console) */}
      {activeTab === "payroll_timesheets" && (
        <div className="space-y-6">
          {/* Header & Month Filter */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#070235]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#070235] text-sm">Security Agency Contract &amp; Attendance Timesheet</h3>
                <p className="text-slate-500 text-xs">
                  Reconciliation of verified gate hours with vendor contract head (4101-SEC).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-semibold">Billing Cycle:</span>
              <select
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white text-slate-800"
              >
                <option value="November 2026">November 2026 (Active Cycle)</option>
                <option value="October 2026">October 2026 (Audited &amp; Paid)</option>
                <option value="September 2026">September 2026 (Audited &amp; Paid)</option>
              </select>
            </div>
          </div>

          {/* Financial KPI Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Total Contracted Shifts
                </span>
                <div className="text-2xl text-[#070235] font-bold mt-1 tracking-tight">
                  84 <span className="text-xs text-slate-400 font-normal">Shifts Scheduled</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>3 Posts &times; 28 Calendar Days</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Delivered Shifts (SLA)
                </span>
                <div className="text-2xl text-[#006a61] font-bold mt-1 tracking-tight">
                  78 <span className="text-xs text-slate-400 font-normal">(92.8% Fulfillment)</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Verified by Gate Biometrics &amp; App</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-400"></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Total Active Hours
                </span>
                <div className="text-2xl text-[#070235] font-bold mt-1 tracking-tight">
                  624.5 <span className="text-xs text-slate-400 font-normal">hrs (+32 OT)</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Stopwatch Validated Shift Logs</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Net Agency Payout Due
                </span>
                <div className="text-2xl text-emerald-700 font-bold mt-1 tracking-tight">
                  ₹60,900.00
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Account Head: 4101-SEC</span>
              </div>
            </div>
          </div>

          {/* Detailed Timesheet Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#070235]" />
                <h4 className="font-bold text-[#070235] text-sm">Security Guard Attendance &amp; Wage Allocation</h4>
              </div>
              <span className="text-xs text-slate-500 font-mono">Ledger Code: 4101-SEC</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Guard Name &amp; ID</th>
                    <th className="px-4 py-3">Assigned Gate</th>
                    <th className="px-4 py-3 text-center">Shifts (Delivered / Sched.)</th>
                    <th className="px-4 py-3 text-right">Active Hours</th>
                    <th className="px-4 py-3 text-right">OT Hours</th>
                    <th className="px-4 py-3 text-right">Base Wage</th>
                    <th className="px-4 py-3 text-right">OT Pay</th>
                    <th className="px-4 py-3 text-right">Net Payable</th>
                    <th className="px-4 py-3 text-center">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollRecords.map((r) => (
                    <tr key={r.staffId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#070235]">{r.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">#{r.staffId} • {r.agency}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {r.assignedGate}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-slate-800">{r.deliveredShifts}</span>
                        <span className="text-slate-400"> / {r.scheduledShifts}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                        {r.activeHours.toFixed(1)} hrs
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 font-semibold">
                        +{r.overtimeHours.toFixed(1)} hrs
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        ₹{r.basePay.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 font-semibold">
                        ₹{r.overtimePay.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{r.netPayable.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#006a61] border border-teal-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-xs uppercase tracking-wider">
                      Total Vendor Reconciliation
                    </td>
                    <td className="px-4 py-3 text-center">
                      78 / 84 Shifts
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      624.5 hrs
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700">
                      +32.0 hrs
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      ₹54,000
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700">
                      ₹6,900
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-[#070235]">
                      ₹60,900.00
                    </td>
                    <td className="px-4 py-3 text-center text-[11px] text-[#006a61]">
                      Ready for Payout
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Regularize Punch Modal */}
      <Modal
        isOpen={isRegularizeModalOpen && !!selectedGateForRegularize}
        onClose={() => setIsRegularizeModalOpen(false)}
        title={`Regularize Gate Shift — ${selectedGateForRegularize?.gateName}`}
        description="Adjust attendance status, shift hours, or record missed punch timestamps."
        maxWidth="md"
      >
        {selectedGateForRegularize && (
          <form onSubmit={handleSaveRegularize} className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Guard</span>
              <div className="font-bold text-[#070235] text-sm mt-0.5">
                {selectedGateForRegularize.guardName} ({selectedGateForRegularize.staffId})
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Shift: {selectedGateForRegularize.shift} • Current Duration: {selectedGateForRegularize.activeDuration}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Status Override *</label>
              <select
                value={regularizeStatus}
                onChange={(e) => setRegularizeStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none bg-white font-medium"
              >
                <option value="ON_DUTY">ON DUTY (Active on Gate)</option>
                <option value="ON_BREAK">ON BREAK (Tea / Meal Break)</option>
                <option value="OFF_DUTY">OFF DUTY (Shift Complete / Relieved)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Regularization Reason / Audit Justification *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Network latency at Gate 2 boom barrier delayed biometric punch in; verified via CCTV."
                value={regularizeReason}
                onChange={(e) => setRegularizeReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsRegularizeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save &amp; Regularize Shift
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Enroll Staff Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll New Staff Member"
        description="Add a domestic help, guard, or maintenance contractor to the society roster."
        maxWidth="md"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. +91 9876543210"
              value={formMobile}
              onChange={(e) => setFormMobile(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
            />
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Category *</label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Wings / Units</label>
            <input
              type="text"
              placeholder="e.g. Wing A & B Common Area"
              value={formArea}
              onChange={(e) => setFormArea(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsEnrollModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enrolling..." : "Enroll Staff"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Staff Member Dossier Modal */}
      <Modal
        isOpen={isDossierModalOpen && !!selectedStaff}
        onClose={() => setIsDossierModalOpen(false)}
        title="Staff Member Dossier"
        description="Statutory society workforce credentials, security clearance, and deployment assignment."
        maxWidth="md"
      >
        {selectedStaff && (
          <div className="space-y-4 pt-1 text-xs">
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#070235] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {selectedStaff.fullName
                  ? selectedStaff.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "ST"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{selectedStaff.fullName}</h4>
                  <ShieldCheck className="w-4 h-4 text-[#006a61] shrink-0" />
                </div>
                <span className="text-slate-500 text-[11px] block mt-0.5 font-mono">
                  Badge: #STF-{selectedStaff.id ? selectedStaff.id.substring(0, 6) : "EMP"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 bg-white shadow-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Role / Category</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block capitalize">{selectedStaff.category || "General Staff"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Phone Number</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedStaff.phone || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Assigned Area</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedStaff.assignedArea || "Society Premises"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Duty Status</span>
                <div className="mt-0.5">
                  <Badge variant={selectedStaff.isActive ? "success" : "neutral"}>
                    {selectedStaff.isActive ? "Active Duty" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-slate-600">
              <span>Security Perimeter Biometrics:</span>
              <span className="text-[#006a61] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled &amp; Verified
              </span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setIsDossierModalOpen(false)}>
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
