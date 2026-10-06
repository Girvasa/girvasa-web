"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Bell, Plus, Eye, Send, Archive, XCircle, AlertTriangle } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Badge } from "@/components/common/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { NoticeResponse, CreateNoticeRequest } from "@/types/notice";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate } from "@/lib/utils";

export default function NoticesPage() {
  const { activeSocietyId } = useTenant();
  const [notices, setNotices] = useState<NoticeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<NoticeResponse | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [createForm, setCreateForm] = useState<CreateNoticeRequest>({
    title: "",
    content: "",
    isImportant: false,
    audienceType: "ALL_RESIDENTS",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotices = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.notices.getNotices({
        status: statusFilter || undefined,
      });
      setNotices(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load society notices.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, statusFilter]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await endpoints.notices.createNotice(createForm);
      setIsCreateOpen(false);
      setCreateForm({ title: "", content: "", isImportant: false, audienceType: "ALL_RESIDENTS" });
      await fetchNotices();
    } catch (err: any) {
      alert(err.detail || "Failed to create notice draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await endpoints.notices.publishNotice(id);
      setSelectedNotice(null);
      await fetchNotices();
    } catch (err: any) {
      alert(err.detail || "Publish failed");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await endpoints.notices.archiveNotice(id);
      setSelectedNotice(null);
      await fetchNotices();
    } catch (err: any) {
      alert(err.detail || "Archive failed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge variant="success">Published</Badge>;
      case "DRAFT":
        return <Badge variant="warning">Draft</Badge>;
      case "SCHEDULED":
        return <Badge variant="info">Scheduled</Badge>;
      case "ARCHIVED":
        return <Badge variant="neutral">Archived</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns: Column<NoticeResponse>[] = [
    {
      header: "Notice Title",
      accessor: (n) => (
        <div className="flex items-center space-x-2">
          {n.isImportant && <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
          <div>
            <span className="font-semibold text-slate-900">{n.title}</span>
            <span className="text-[11px] text-slate-400 block truncate max-w-xs">{n.content}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Audience",
      accessor: (n) => <span className="capitalize text-slate-700">{n.audienceType?.replace(/_/g, " ").toLowerCase()}</span>,
    },
    {
      header: "Published Date",
      accessor: (n) => <span>{formatDate(n.publishedAt || n.createdAt)}</span>,
    },
    {
      header: "Status",
      accessor: (n) => getStatusBadge(n.status),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (n) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedNotice(n)}>
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Society Notices & Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast administrative notices, maintenance advisories, and official bulletins.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Notice Statuses"
            options={[
              { label: "Published", value: "PUBLISHED" },
              { label: "Draft", value: "DRAFT" },
              { label: "Archived", value: "ARCHIVED" },
            ]}
          />
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Post Notice
          </Button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchNotices} />
      ) : (
        <Table
          columns={columns}
          data={notices}
          keyExtractor={(n) => n.id}
          isLoading={isLoading}
          emptyMessage="No notices published."
        />
      )}

      {/* Notice Detail Modal */}
      <Modal
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title}
        description={`Status: ${selectedNotice?.status} • Audience: ${selectedNotice?.audienceType}`}
        footer={
          <div className="flex justify-between w-full">
            <div className="flex space-x-2">
              {selectedNotice?.status === "DRAFT" && (
                <Button variant="primary" size="sm" onClick={() => handlePublish(selectedNotice.id)}>
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Publish Now
                </Button>
              )}
              {selectedNotice?.status === "PUBLISHED" && (
                <Button variant="outline" size="sm" onClick={() => handleArchive(selectedNotice.id)}>
                  <Archive className="w-3.5 h-3.5 mr-1" />
                  Archive Notice
                </Button>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={() => setSelectedNotice(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{selectedNotice.content}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Notice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Draft Society Notice"
        description="Create a new communication notice for residents."
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <Input
            label="Notice Title"
            placeholder="e.g. Annual General Body Meeting (AGM) 2026"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Notice Content
            </label>
            <textarea
              rows={4}
              placeholder="Detailed announcement text..."
              value={createForm.content}
              onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <Select
            label="Target Audience"
            value={createForm.audienceType}
            onChange={(e) => setCreateForm({ ...createForm, audienceType: e.target.value })}
            options={[
              { label: "All Residents", value: "ALL_RESIDENTS" },
              { label: "Owners Only", value: "OWNERS_ONLY" },
              { label: "Tenants Only", value: "TENANTS_ONLY" },
              { label: "Management Committee", value: "COMMITTEE_ONLY" },
            ]}
          />
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isImportant"
              checked={createForm.isImportant}
              onChange={(e) => setCreateForm({ ...createForm, isImportant: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isImportant" className="text-xs font-medium text-slate-700">
              Mark as urgent / high-priority announcement
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Draft
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
