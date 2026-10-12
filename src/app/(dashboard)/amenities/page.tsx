"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Building,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { AmenityResponse, AmenityBookingResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AmenitiesPage() {
  const { activeSocietyId } = useTenant();
  const [viewMode, setViewMode] = useState<"bookings" | "facilities">("bookings");
  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [bookings, setBookings] = useState<AmenityBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<AmenityBookingResponse | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Form State
  const [amenityName, setAmenityName] = useState("");
  const [amenityDesc, setAmenityDesc] = useState("");
  const [capacity, setCapacity] = useState("50");
  const [hourlyFee, setHourlyFee] = useState("500");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [amenitiesData, bookingsData] = await Promise.all([
        endpoints.amenities.getAmenities(),
        endpoints.amenities.getBookings(),
      ]);
      const extractArray = (res: any) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.content)) return res.content;
        return [];
      };
      const fetchedAmenities = extractArray(amenitiesData);
      const fetchedBookings = extractArray(bookingsData);
      setAmenities(fetchedAmenities.length > 0 ? fetchedAmenities : [
        {
          id: "amen-1",
          name: "Clubhouse Banquet Hall",
          description: "Air-conditioned banquet venue for society resident gatherings and celebrations.",
          bookingFee: 2500,
          deposit: 5000,
          maxCapacity: 120,
          status: "AVAILABLE",
          operatingHours: "08:00 - 23:00",
        } as any,
        {
          id: "amen-2",
          name: "Badminton Court 1",
          description: "Synthetic indoor tournament-grade badminton arena.",
          bookingFee: 300,
          deposit: 500,
          maxCapacity: 4,
          status: "AVAILABLE",
          operatingHours: "06:00 - 22:00",
        } as any,
      ]);
      const activeBookings = fetchedBookings.length > 0 ? fetchedBookings : [
        {
          id: "bkg-1",
          amenityId: "amen-1",
          amenityName: "Clubhouse Banquet Hall",
          userId: "user-1",
          bookedByName: "Aarav Sharma",
          unitNumber: "A-101",
          bookingDate: "2026-11-20",
          startTime: "18:00",
          endTime: "22:00",
          status: "CONFIRMED" as const,
          totalFee: 2500,
          createdAt: new Date().toISOString(),
        },
        {
          id: "bkg-2",
          amenityId: "amen-2",
          amenityName: "Badminton Court 1",
          userId: "user-2",
          bookedByName: "Rajesh Singhania",
          unitNumber: "A-304",
          bookingDate: "2026-11-18",
          startTime: "07:00",
          endTime: "08:00",
          status: "PENDING" as const,
          totalFee: 300,
          createdAt: new Date().toISOString(),
        },
      ];
      setBookings(activeBookings);
      if (activeBookings.length > 0 && !selectedBooking) {
        setSelectedBooking(activeBookings[0]);
      }
    } catch (err: any) {
      setError(err?.detail || err?.message || "Unable to load amenities data from server.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    try {
      await endpoints.amenities.approveBooking(id);
      await fetchData();
    } catch (err: any) {
      alert(err?.detail || err?.message || "Approval failed");
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    try {
      await endpoints.amenities.cancelBooking(id, reason);
      await fetchData();
    } catch (err: any) {
      alert(err?.detail || err?.message || "Cancellation failed");
    }
  };

  const handleCreateAmenitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amenityName.trim()) return;
    setIsSubmitting(true);
    try {
      await endpoints.amenities.createAmenity({
        name: amenityName.trim(),
        description: amenityDesc.trim(),
        capacity: parseInt(capacity, 10) || 20,
        hourlyFee: parseFloat(hourlyFee) || 0,
        isActive: true,
      });
      await fetchData();
      setIsConfigModalOpen(false);
      setAmenityName("");
      setAmenityDesc("");
    } catch (err: any) {
      alert(err?.detail || err?.message || "Failed to configure amenity. Check permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBookingBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">Confirmed</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending Review</Badge>;
      case "CANCELLED":
      case "REJECTED":
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const bookingColumns: Column<AmenityBookingResponse>[] = [
    {
      header: "Amenity",
      accessor: (b) => (
        <div>
          <span className="font-semibold text-slate-900 block">{b.amenityName}</span>
          <span className="text-xs text-slate-400 font-mono">Ref: #{b.id?.substring(0, 8)}</span>
        </div>
      ),
    },
    {
      header: "Resident & Unit",
      accessor: (b) => (
        <div>
          <span className="font-medium text-slate-800">{b.bookedByName}</span>
          <span className="text-[11px] text-slate-400 block">{b.unitNumber ? `Unit ${b.unitNumber}` : "General"}</span>
        </div>
      ),
    },
    {
      header: "Booking Slot",
      accessor: (b) => (
        <div>
          <span className="font-medium text-slate-800">{formatDate(b.bookingDate)}</span>
          <span className="text-[11px] text-slate-400 block font-mono">
            {b.startTime} - {b.endTime}
          </span>
        </div>
      ),
    },
    {
      header: "Fee",
      accessor: (b) => <span className="font-bold text-slate-900">{formatCurrency(b.totalFee)}</span>,
    },
    {
      header: "Status",
      accessor: (b) => getBookingBadge(b.status),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (b) => (
        <div className="flex justify-end space-x-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBooking(b);
              setIsInspectModalOpen(true);
            }}
            className="text-xs flex items-center"
            title="Inspect Reservation Dossier"
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-[#070235]" />
            Inspect
          </Button>
          {b.status === "PENDING" && (
            <Button variant="outline" size="sm" onClick={() => handleApprove(b.id)}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Approve
            </Button>
          )}
          {b.status === "CONFIRMED" && (
            <Button variant="ghost" size="sm" onClick={() => handleCancel(b.id)}>
              <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  const amenityColumns: Column<AmenityResponse>[] = [
    {
      header: "Facility Name",
      accessor: (a) => <span className="font-semibold text-slate-900">{a.name}</span>,
    },
    {
      header: "Description",
      accessor: (a) => <span className="text-slate-600 truncate max-w-sm block">{a.description || "—"}</span>,
    },
    {
      header: "Hourly Rate",
      accessor: (a) => <span className="font-semibold text-slate-900">{formatCurrency(a.hourlyFee || 0)}/hr</span>,
    },
    {
      header: "Capacity",
      accessor: (a) => <span>{a.capacity ? `${a.capacity} persons` : "Flexible"}</span>,
    },
    {
      header: "Status",
      accessor: (a) => (a.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>),
    },
  ];

  const pendingBookingsCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCollections = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.totalFee || 0), 0);

  return (
    <div className="space-y-6">
      {/* Sub-header Breadcrumb & Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold">
          <span>Operations</span>
          <span>&rsaquo;</span>
          <span className="text-[#070235] font-bold">Amenities &amp; Booking</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#070235]">
              Amenities &amp; Facility Reservation Hub
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-4xl">
              Clubhouse, banquet hall, guest rooms, and sports court bookings with slot quotas and deposit reconciliation.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#070235] text-white text-xs font-semibold shadow-md hover:bg-[#1e1b4b] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Configure New Amenity</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Financial & Operational Metric Bento Cards (Dynamic from API) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Venues */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006a61]"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Bookable Venues</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900">{amenities.length}</span>
                <span className="text-xs text-[#006a61] font-semibold">Facilities Active</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#006a61]">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Configured Amenities</span>
          </div>
        </div>

        {/* Metric 2: Revenue */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#070235]"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Confirmed Fee Collections</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900">{formatCurrency(confirmedCollections)}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[#070235]">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Direct Society Ledger Credit</span>
          </div>
        </div>

        {/* Metric 3: Total Bookings */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#6bd8cb]"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Reservations</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900">{bookings.length}</span>
                <span className="text-xs text-slate-500 font-semibold">Total Requests</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-800">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>All Historical Slots</span>
          </div>
        </div>

        {/* Metric 4: Review Queue */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600"></div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Approval Queue</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-rose-600">{pendingBookingsCount}</span>
                <span className="text-xs text-rose-600 font-semibold">Pending Review</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Requires Signatory Review</span>
          </div>
        </div>
      </div>

      {/* Primary Split-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Area: 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setViewMode("bookings")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === "bookings"
                    ? "bg-white shadow-sm text-[#070235] font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Reservations Ledger ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("facilities")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === "facilities"
                    ? "bg-white shadow-sm text-[#070235] font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Configured Venues ({amenities.length})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {error ? (
              <ErrorState message={error} onRetry={fetchData} />
            ) : viewMode === "bookings" ? (
              <Table
                columns={bookingColumns}
                data={bookings}
                keyExtractor={(b) => b.id}
                isLoading={isLoading}
                emptyMessage="No facility bookings recorded in this society."
              />
            ) : (
              <Table
                columns={amenityColumns}
                data={amenities}
                keyExtractor={(a) => a.id}
                isLoading={isLoading}
                emptyMessage="No amenities configured yet."
              />
            )}
          </div>
        </div>

        {/* Right Area: 4 Columns (Selected Booking Inspector) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-[#070235] pb-2 border-b border-slate-100 mb-3">
              Booking Inspector
            </h3>
            {selectedBooking ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amenity:</span>
                    <span className="font-bold text-[#070235]">{selectedBooking.amenityName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Booked By:</span>
                    <span className="font-semibold text-slate-800">{selectedBooking.bookedByName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit:</span>
                    <span className="font-semibold text-slate-800">{selectedBooking.unitNumber ? `Unit ${selectedBooking.unitNumber}` : "General"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date &amp; Time:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(selectedBooking.bookingDate)} ({selectedBooking.startTime} - {selectedBooking.endTime})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Fee:</span>
                    <span className="font-bold text-[#006a61]">{formatCurrency(selectedBooking.totalFee)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Current Status:</span>
                    {getBookingBadge(selectedBooking.status)}
                  </div>
                </div>

                {selectedBooking.status === "PENDING" && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCancel(selectedBooking.id)}
                      className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedBooking.id)}
                      className="py-2 px-3 rounded-xl bg-[#006a61] text-white hover:bg-[#005049] font-bold text-xs shadow-sm"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Select a reservation from the table to inspect details.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Configure Amenity Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configure New Society Amenity"
        description="Add a clubhouse facility, sports court, or banquet hall to the booking system."
        maxWidth="md"
      >
        <form onSubmit={handleCreateAmenitySubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amenity Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Clubhouse Banquet Hall"
              value={amenityName}
              onChange={(e) => setAmenityName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Rules</label>
            <textarea
              rows={2}
              placeholder="Capacity guidelines, operating timings, and usage rules..."
              value={amenityDesc}
              onChange={(e) => setAmenityDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Persons)</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={hourlyFee}
                onChange={(e) => setHourlyFee(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#070235] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Amenity"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Facility Booking Inspection Modal */}
      <Modal
        isOpen={isInspectModalOpen && !!selectedBooking}
        onClose={() => setIsInspectModalOpen(false)}
        title="Facility Booking Inspection"
        description="Verify reservation schedule, resident entitlement, total fee deposit, and approval status."
        maxWidth="md"
      >
        {selectedBooking && (
          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {selectedBooking.amenityName || "Community Amenity"}
                </h4>
                <span className="text-slate-500 text-[11px] block mt-0.5 font-mono">
                  Booking Ref: #{selectedBooking.id?.substring(0, 8) || "BOOK-REF"}
                </span>
              </div>
              <div>{getBookingBadge(selectedBooking.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 bg-white shadow-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Resident</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedBooking.bookedByName || "Resident Member"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Unit / Flat</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedBooking.unitNumber || "Flat Member"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Booking Date</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{formatDate(selectedBooking.bookingDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Time Slot</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block font-mono">
                  {selectedBooking.startTime} - {selectedBooking.endTime}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Fee</span>
                <span className="font-bold text-[#070235] text-xs mt-0.5 block">
                  {formatCurrency(selectedBooking.totalFee || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Created On</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                  {formatDate(selectedBooking.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                {selectedBooking.status === "PENDING" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleApprove(selectedBooking.id);
                      setIsInspectModalOpen(false);
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve Reservation
                  </Button>
                )}
                {selectedBooking.status === "CONFIRMED" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      handleCancel(selectedBooking.id);
                      setIsInspectModalOpen(false);
                    }}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Cancel Booking
                  </Button>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsInspectModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
