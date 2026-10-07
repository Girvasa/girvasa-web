"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Tabs } from "@/components/common/Tabs";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { AmenityResponse, AmenityBookingResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AmenitiesPage() {
  const { activeSocietyId } = useTenant();
  const [activeTab, setActiveTab] = useState("bookings");
  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [bookings, setBookings] = useState<AmenityBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setAmenities(extractArray(amenitiesData));
      setBookings(extractArray(bookingsData));
    } catch (err: any) {
      setError(err.detail || "Unable to load amenities data.");
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
      alert(err.detail || "Approval failed");
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    try {
      await endpoints.amenities.cancelBooking(id, reason);
      await fetchData();
    } catch (err: any) {
      alert(err.detail || "Cancellation failed");
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
      accessor: (b) => <span className="font-semibold text-slate-900">{b.amenityName}</span>,
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
      accessor: (a) => <span>{formatCurrency(a.hourlyFee)}/hr</span>,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Amenities & Facility Bookings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage clubhouse amenities, sports courts, banquet hall bookings, and reservation status.
        </p>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "bookings", label: "Facility Bookings", badge: bookings.length },
          { id: "facilities", label: "Amenity Inventory", badge: amenities.length },
        ]}
      />

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : activeTab === "bookings" ? (
        <Table
          columns={bookingColumns}
          data={bookings}
          keyExtractor={(b) => b.id}
          isLoading={isLoading}
          emptyMessage="No facility booking reservations recorded."
        />
      ) : (
        <Table
          columns={amenityColumns}
          data={amenities}
          keyExtractor={(a) => a.id}
          isLoading={isLoading}
          emptyMessage="No amenities configured in society."
        />
      )}
    </div>
  );
}
