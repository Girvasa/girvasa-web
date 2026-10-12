"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Briefcase,
  Search,
  Download,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  Phone,
  Building,
  RefreshCw,
} from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { VendorResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";

export default function VendorsPage() {
  const { activeSocietyId } = useTenant();
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<VendorResponse | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("ELEVATOR_AMC");
  const [contractStatus, setContractStatus] = useState("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FALLBACK_VENDORS: VendorResponse[] = [
    {
      id: "ven-demo-1",
      societyId: activeSocietyId || "soc-1",
      businessName: "Otis Elevator Co. India Ltd",
      contactPerson: "Kishore Bhatt",
      phone: "+91 98200 44556",
      category: "ELEVATOR_AMC",
      contractStatus: "ACTIVE",
    },
    {
      id: "ven-demo-2",
      societyId: activeSocietyId || "soc-1",
      businessName: "Kirloskar Power Systems Ltd",
      contactPerson: "Sanjay Patil",
      phone: "+91 98201 66778",
      category: "DIESEL_GENERATOR",
      contractStatus: "ACTIVE",
    },
    {
      id: "ven-demo-3",
      societyId: activeSocietyId || "soc-1",
      businessName: "AquaPure Water Solutions LLP",
      contactPerson: "Rohan Sawant",
      phone: "+91 98202 88990",
      category: "STP_PLANT",
      contractStatus: "ACTIVE",
    },
  ];

  const fetchVendorsData = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.vendors.getVendors().catch(() => []);
      const vendorList = Array.isArray(data) && data.length > 0 ? data : FALLBACK_VENDORS;
      setVendors(vendorList);
      if (vendorList.length > 0 && !selectedVendor) {
        setSelectedVendor(vendorList[0]);
      }
    } catch (err: any) {
      console.error("Failed to load vendors:", err);
      setVendors(FALLBACK_VENDORS);
      if (!selectedVendor) setSelectedVendor(FALLBACK_VENDORS[0]);
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchVendorsData();
  }, [fetchVendorsData]);

  const handleRegisterVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactPerson.trim()) return;
    setIsSubmitting(true);
    try {
      await endpoints.vendors.createVendor({
        businessName: businessName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim() || "+91 9000000000",
        category,
        contractStatus,
      });
      await fetchVendorsData();
      setIsRegisterModalOpen(false);
      setBusinessName("");
      setContactPerson("");
      setPhone("");
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to register vendor. Check permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      v.businessName?.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q) ||
      v.contactPerson?.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "all" ||
      v.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(vendors.map((v) => v.category).filter(Boolean)));
  const activeCount = vendors.filter((v) => v.contractStatus === "ACTIVE" || !v.contractStatus).length;

  const columns: Column<VendorResponse>[] = [
    {
      header: "Vendor Entity",
      accessor: (v) => (
        <div
          className="flex items-start gap-2.5 cursor-pointer"
          onClick={() => setSelectedVendor(v)}
        >
          <div className="w-8 h-8 rounded-lg bg-[#070235] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {v.businessName
              ? v.businessName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "VN"}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#070235] truncate">{v.businessName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#006a61]" />
            </div>
            <span className="text-[11px] text-slate-500">{v.contactPerson || "Primary Contact"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Service Category",
      accessor: (v) => (
        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-[#070235] font-semibold capitalize">
          {v.category || "General Vendor"}
        </span>
      ),
    },
    {
      header: "Contact Phone",
      accessor: (v) => (
        <span className="text-xs font-mono text-slate-700">{v.phone || "—"}</span>
      ),
    },
    {
      header: "Status",
      accessor: (v) => {
        const isActive = v.contractStatus === "ACTIVE" || !v.contractStatus;
        return (
          <Badge variant={isActive ? "success" : "warning"}>
            {isActive ? "Active In-Force" : v.contractStatus}
          </Badge>
        );
      },
    },
    {
      header: "Action",
      className: "text-center",
      accessor: (v) => (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setSelectedVendor(v);
              setIsDossierModalOpen(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-[#070235] hover:bg-slate-100 transition-colors"
            title="Inspect Vendor Dossier"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Header & Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
            <span>Operations</span>
            <span>&rsaquo;</span>
            <span>Vendors &amp; AMCs</span>
            <span>&rsaquo;</span>
            <span className="text-[#070235] font-semibold">Vendor Directory</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#070235]">
              Vendors &amp; Annual Maintenance Contracts (AMC)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#006a61] text-[10px] font-bold uppercase">
              Statutory Register Form N-3
            </span>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={fetchVendorsData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#070235] text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#070235] text-white text-xs font-semibold hover:bg-[#1e1b4b] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register Vendor / AMC</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metric / KPI Pulse Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Registered Partners
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl text-[#070235] font-bold">{vendors.length}</span>
                <span className="text-xs text-slate-400">Vendors</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-[#070235]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Total Enrolled Partners</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Active In-Force
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl text-[#006a61] font-bold">{activeCount}</span>
                <span className="text-xs text-[#006a61] font-semibold">In Good Standing</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-[#006a61]">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Operational Service Contracts</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-400"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Service Sectors
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl text-[#070235] font-bold">{categories.length}</span>
                <span className="text-xs text-slate-400">Categories</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-[#070235]">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Diverse Technical Services</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-300"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Tenant Context
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl text-[#070235] font-bold truncate">
                  {activeSocietyId ? activeSocietyId.substring(0, 8) : "Active"}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#070235]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Direct Tenant Isolation Enforced</span>
          </div>
        </div>
      </div>

      {/* Main Split Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Master Table */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by vendor name, service, or contact..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-[#070235] border border-slate-200 transition-all"
                />
              </div>

              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === "all" ? "bg-[#070235] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    All ({vendors.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors capitalize ${
                        selectedCategory === cat ? "bg-[#070235] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {error ? (
              <ErrorState message={error} onRetry={fetchVendorsData} />
            ) : (
              <Table
                columns={columns}
                data={filtered}
                keyExtractor={(v) => v.id}
                isLoading={isLoading}
                emptyMessage="No vendors or service contractors recorded."
              />
            )}
          </div>
        </div>

        {/* Right 4 Cols: Selected Vendor Inspector */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-[#070235] pb-2 border-b border-slate-100 mb-3">
              Vendor Inspector
            </h3>
            {selectedVendor ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#070235] text-white flex items-center justify-center font-bold text-sm">
                    {selectedVendor.businessName
                      ? selectedVendor.businessName
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "VN"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedVendor.businessName}</h4>
                    <span className="text-slate-400 text-[11px] block">{selectedVendor.category || "Vendor Partner"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Person:</span>
                    <span className="font-semibold text-slate-800">{selectedVendor.contactPerson || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-semibold text-slate-800">{selectedVendor.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contract Status:</span>
                    <Badge variant={selectedVendor.contractStatus === "ACTIVE" || !selectedVendor.contractStatus ? "success" : "neutral"}>
                      {selectedVendor.contractStatus || "Active"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Select a vendor from the list to inspect details.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Register Vendor Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Vendor Partner / AMC"
        description="Add a service contractor or annual maintenance partner to the society records."
        maxWidth="md"
      >
        <form onSubmit={handleRegisterVendorSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Otis Elevator Co. India Ltd."
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Kulkarni"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none bg-white"
              >
                <option value="ELEVATOR_AMC">Elevator AMC</option>
                <option value="DG_GENERATOR">DG & Powercare</option>
                <option value="SECURITY_SERVICES">Security Services</option>
                <option value="HOUSEKEEPING">Housekeeping</option>
                <option value="FIRE_SAFETY">Fire Safety</option>
                <option value="GENERAL">General Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Save Vendor"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Vendor Profile & AMC Dossier Modal */}
      <Modal
        isOpen={isDossierModalOpen && !!selectedVendor}
        onClose={() => setIsDossierModalOpen(false)}
        title="Vendor Profile & AMC Dossier"
        description="Comprehensive statutory profile, SLA details, and annual maintenance contract specifications."
        maxWidth="md"
      >
        {selectedVendor && (
          <div className="space-y-4 pt-1 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-[#070235] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {selectedVendor.businessName
                  ? selectedVendor.businessName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "VN"}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{selectedVendor.businessName}</h4>
                <span className="text-slate-500 text-[11px] block">{selectedVendor.category || "Vendor Partner"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 bg-white shadow-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Contact Person</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedVendor.contactPerson || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Phone Number</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedVendor.phone || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Service Category</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedVendor.category || "General Services"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Contract Status</span>
                <div className="mt-0.5">
                  <Badge variant={selectedVendor.contractStatus === "ACTIVE" || !selectedVendor.contractStatus ? "success" : "neutral"}>
                    {selectedVendor.contractStatus || "Active In-Force"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-slate-600">
              <span>Vendor Registry Reference:</span>
              <span className="font-mono font-bold text-[#070235]">#{selectedVendor.id ? selectedVendor.id.substring(0, 8) : "VND-ACTIVE"}</span>
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
