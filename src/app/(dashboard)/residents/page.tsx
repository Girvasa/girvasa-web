"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, Search, UserPlus, CheckCircle, Ban, XCircle } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { MemberResponse, CreateMemberRequest } from "@/types/member";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate } from "@/lib/utils";

export default function ResidentsPage() {
  const { activeSocietyId } = useTenant();
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New member form
  const [formData, setFormData] = useState<CreateMemberRequest>({
    fullName: "",
    mobileNumber: "",
    email: "",
    role: "RESIDENT",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.members.getMembers({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setMembers(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load society residents.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, search, statusFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await endpoints.members.createMember(formData);
      setIsAddModalOpen(false);
      setFormData({ fullName: "", mobileNumber: "", email: "", role: "RESIDENT" });
      await fetchMembers();
    } catch (err: any) {
      setFormError(err.detail || "Failed to provision member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await endpoints.members.approveMember(id);
      await fetchMembers();
    } catch (err: any) {
      alert(err.detail || "Approval failed");
    }
  };

  const handleSuspend = async (id: string) => {
    const reason = prompt("Enter suspension reason:");
    if (!reason) return;
    try {
      await endpoints.members.suspendMember(id, reason);
      await fetchMembers();
    } catch (err: any) {
      alert(err.detail || "Suspension failed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "PENDING_APPROVAL":
        return <Badge variant="warning">Pending</Badge>;
      case "SUSPENDED":
        return <Badge variant="danger">Suspended</Badge>;
      case "TERMINATED":
        return <Badge variant="neutral">Terminated</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns: Column<MemberResponse>[] = [
    {
      header: "Resident / Member",
      accessor: (m) => (
        <div>
          <div className="font-semibold text-slate-900">{m.fullName}</div>
          <div className="text-[11px] text-slate-500 font-mono">{m.mobileNumber}</div>
        </div>
      ),
    },
    {
      header: "Unit",
      accessor: (m) => (
        <span className="font-medium text-slate-800">
          {m.unitNumber ? `Unit ${m.unitNumber}` : "—"}
        </span>
      ),
    },
    {
      header: "Roles",
      accessor: (m) => (
        <div className="flex flex-wrap gap-1">
          {m.roles?.map((r) => (
            <span key={r} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Joined",
      accessor: (m) => <span>{formatDate(m.joinedAt)}</span>,
    },
    {
      header: "Status",
      accessor: (m) => getStatusBadge(m.status),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (m) => (
        <div className="flex justify-end space-x-1.5">
          {m.status === "PENDING_APPROVAL" && (
            <Button variant="outline" size="sm" onClick={() => handleApprove(m.id)}>
              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Approve
            </Button>
          )}
          {m.status === "ACTIVE" && (
            <Button variant="ghost" size="sm" onClick={() => handleSuspend(m.id)}>
              <Ban className="w-3.5 h-3.5 mr-1 text-rose-500" />
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Resident Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage society members, tenant occupancy authorizations, and lifecycle status.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Add Resident
        </Button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All Member Statuses"
          options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Pending Approval", value: "PENDING_APPROVAL" },
            { label: "Suspended", value: "SUSPENDED" },
            { label: "Terminated", value: "TERMINATED" },
          ]}
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchMembers} />
      ) : (
        <Table
          columns={columns}
          data={members}
          keyExtractor={(m) => m.id}
          isLoading={isLoading}
          emptyMessage="No residents found in directory."
        />
      )}

      {/* Add Resident Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Society Member"
        description="Provision a new resident or operational member profile."
      >
        <form onSubmit={handleCreateMember} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              {formError}
            </div>
          )}
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Mobile Number (E.164)"
            placeholder="+919876543210"
            value={formData.mobileNumber}
            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
            required
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Select
            label="Initial Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { label: "Resident", value: "RESIDENT" },
              { label: "Owner", value: "OWNER" },
              { label: "Tenant", value: "TENANT" },
              { label: "Committee Member", value: "COMMITTEE_MEMBER" },
              { label: "Accountant", value: "ACCOUNTANT" },
              { label: "Facility Manager", value: "FACILITY_MANAGER" },
            ]}
          />
          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Create Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
