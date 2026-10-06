"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FileText, Download, Search } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { DocumentResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate } from "@/lib/utils";

export default function DocumentsPage() {
  const { activeSocietyId } = useTenant();
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchDocuments = useCallback(async () => {
    if (!activeSocietyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.documents.getDocuments({ search: search || undefined });
      setDocuments(data || []);
    } catch (err: any) {
      setError(err.detail || "Unable to load society documents repository.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const columns: Column<DocumentResponse>[] = [
    {
      header: "Document Name",
      accessor: (d) => (
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-slate-900">{d.title}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (d) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {d.category || "General"}
        </span>
      ),
    },
    {
      header: "File Size",
      accessor: (d) => <span>{formatFileSize(d.fileSizeBytes)}</span>,
    },
    {
      header: "Uploaded By",
      accessor: (d) => <span>{d.uploadedByName || "Administrator"}</span>,
    },
    {
      header: "Upload Date",
      accessor: (d) => <span>{formatDate(d.createdAt)}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (d) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              alert(`Authorizing secure tenant download for ${d.title}...`);
            }}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Society Documents Repository</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official society bylaws, AGM minutes, auditing records, and operational guidelines.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchDocuments} />
      ) : (
        <Table
          columns={columns}
          data={documents}
          keyExtractor={(d) => d.id}
          isLoading={isLoading}
          emptyMessage="No documents uploaded to society repository."
        />
      )}
    </div>
  );
}
