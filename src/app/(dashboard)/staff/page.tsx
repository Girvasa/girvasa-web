"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  Phone,
  RefreshCw,
  MoreVertical,
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
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffResponse | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Enroll Form State
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formArea, setFormArea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaffData = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [staffData, catData] = await Promise.all([
        endpoints.staff.getStaff(),
        endpoints.staff.getCategories().catch(() => []),
      ]);
      const staffList = Array.isArray(staffData) ? staffData : [];
      setStaff(staffList);
      setCategories(Array.isArray(catData) ? catData : []);
      if (staffList.length > 0 && !selectedStaff) {
        setSelectedStaff(staffList[0]);
      }
    } catch (err: any) {
      setError(err?.detail || err?.message || "Unable to load staff directory from server.");
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
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to enroll staff member. Check permissions.");
    } finally {
      setIsSubmitting(false);
    }
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
      className: "text-center",
      accessor: (s) => (
        <div className="flex justify-center">
          <Badge variant={s.isActive ? "success" : "neutral"}>
            {s.isActive ? "Active Duty" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-center",
      accessor: (s) => (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setSelectedStaff(s)}
            className="p-1 rounded text-slate-400 hover:text-[#070235] hover:bg-slate-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
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
            <span>Staff &amp; Daily Help</span>
            <span>&rsaquo;</span>
            <span className="text-[#070235] font-semibold">Staff Directory</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#070235]">
              Staff &amp; Daily Help Directory
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-50 text-[#006a61] text-[10px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
              Live Directory
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
          <button
            type="button"
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#070235] text-white text-xs font-semibold hover:bg-[#1e1b4b] transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll Staff Member</span>
          </button>
        </div>
      </div>

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
    </div>
  );
}
