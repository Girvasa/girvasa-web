"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MessageSquareWarning, Search, Eye, CheckCircle2, Clock } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { ComplaintResponse } from "@/types/complaint";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function ComplaintsPage() {
  const { activeSocietyId } = useTenant();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState("");

  const fetchComplaints = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.complaints.getComplaints({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setComplaints(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load complaints.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleViewComplaint = async (id: string) => {
    try {
      const detail = await endpoints.complaints.getComplaint(id);
      setSelectedComplaint(detail);
    } catch (err: any) {
      alert(err.detail || "Failed to load complaint details");
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedComplaint) return;
    setIsUpdatingStatus(true);
    try {
      await endpoints.complaints.updateStatus(selectedComplaint.id, newStatus, statusNote);
      setStatusNote("");
      const updated = await endpoints.complaints.getComplaint(selectedComplaint.id);
      setSelectedComplaint(updated);
      await fetchComplaints();
    } catch (err: any) {
      alert(err.detail || "Failed to transition ticket state");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Badge variant="warning">Submitted</Badge>;
      case "ASSIGNED":
        return <Badge variant="info">Assigned</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">In Progress</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Resolved</Badge>;
      case "CLOSED":
        return <Badge variant="neutral">Closed</Badge>;
      case "REOPENED":
        return <Badge variant="danger">Reopened</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="danger">Urgent</Badge>;
      case "HIGH":
        return <Badge variant="warning">High</Badge>;
      case "MEDIUM":
        return <Badge variant="info">Medium</Badge>;
      case "LOW":
        return <Badge variant="neutral">Low</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  const columns: Column<ComplaintResponse>[] = [
    {
      header: "Ticket #",
      accessor: (c) => <span className="font-mono font-semibold text-blue-600">{c.ticketNumber}</span>,
    },
    {
      header: "Title & Category",
      accessor: (c) => (
        <div>
          <div className="font-semibold text-slate-900">{c.title}</div>
          <div className="text-[11px] text-slate-400">{c.categoryName || "General Maintenance"}</div>
        </div>
      ),
    },
    {
      header: "Unit",
      accessor: (c) => <span className="font-medium text-slate-800">{c.unitNumber ? `Unit ${c.unitNumber}` : "General Area"}</span>,
    },
    {
      header: "Priority",
      accessor: (c) => getPriorityBadge(c.priority),
    },
    {
      header: "Reported",
      accessor: (c) => <span>{formatDate(c.createdAt)}</span>,
    },
    {
      header: "Status",
      accessor: (c) => getStatusBadge(c.status),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (c) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleViewComplaint(c.id)}>
            <Eye className="w-3.5 h-3.5 mr-1" />
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Complaints & Helpdesk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Resident service requests, operational ticket routing, and resolution timeline tracking.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Ticket Statuses"
            options={[
              { label: "Submitted", value: "SUBMITTED" },
              { label: "Assigned", value: "ASSIGNED" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Resolved", value: "RESOLVED" },
              { label: "Closed", value: "CLOSED" },
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            placeholder="All Priorities"
            options={[
              { label: "Urgent", value: "URGENT" },
              { label: "High", value: "HIGH" },
              { label: "Medium", value: "MEDIUM" },
              { label: "Low", value: "LOW" },
            ]}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchComplaints} />
      ) : (
        <Table
          columns={columns}
          data={complaints}
          keyExtractor={(c) => c.id}
          isLoading={isLoading}
          emptyMessage="No complaints recorded."
        />
      )}

      {/* Complaint Detail & Workflow Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Ticket: ${selectedComplaint?.ticketNumber}`}
        description={selectedComplaint?.title}
        maxWidth="xl"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedComplaint(null)}>
            Close
          </Button>
        }
      >
        {selectedComplaint && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-xs">
              <span className="text-slate-400 block mb-1">Issue Description</span>
              <p className="text-slate-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-slate-100 p-2.5">
                <span className="text-slate-400 block">Current Status</span>
                {getStatusBadge(selectedComplaint.status)}
              </div>
              <div className="rounded-lg border border-slate-100 p-2.5">
                <span className="text-slate-400 block">Priority</span>
                {getPriorityBadge(selectedComplaint.priority)}
              </div>
              <div className="rounded-lg border border-slate-100 p-2.5">
                <span className="text-slate-400 block">Reported By</span>
                <span className="font-semibold text-slate-800">
                  {selectedComplaint.reportedByName || "Resident"}
                </span>
              </div>
            </div>

            {/* Workflow transition controls */}
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Update Ticket Status
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Optional status transition remark..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex flex-wrap gap-2">
                  {selectedComplaint.status !== "IN_PROGRESS" && (
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isUpdatingStatus}
                      onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    >
                      Start Progress
                    </Button>
                  )}
                  {selectedComplaint.status !== "RESOLVED" && (
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isUpdatingStatus}
                      onClick={() => handleUpdateStatus("RESOLVED")}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Mark Resolved
                    </Button>
                  )}
                  {selectedComplaint.status !== "CLOSED" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={isUpdatingStatus}
                      onClick={() => handleUpdateStatus("CLOSED")}
                    >
                      Close Ticket
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {selectedComplaint.timeline && selectedComplaint.timeline.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Activity Timeline
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {selectedComplaint.timeline.map((event) => (
                    <div key={event.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{event.actorName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Transitioned from <span className="font-mono">{event.fromStatus}</span> to{" "}
                        <span className="font-mono">{event.toStatus}</span>
                      </div>
                      {event.comment && (
                        <div className="mt-1 rounded bg-slate-50 p-1.5 text-slate-600 italic">
                          &quot;{event.comment}&quot;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
