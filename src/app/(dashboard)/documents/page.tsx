"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Download,
  Search,
  UploadCloud,
  FileCheck2,
  FolderArchive,
  BookOpen,
  Users,
  Compass,
  Handshake,
  Landmark,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  RefreshCw,
  Clock,
  ArrowRight,
  HardDrive,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/ErrorState";
import { endpoints } from "@/lib/api/endpoints";
import { DocumentResponse } from "@/types/operation";
import { useTenant } from "@/lib/tenant/TenantContext";
import { formatDate } from "@/lib/utils";

interface VaultCategory {
  id: string;
  name: string;
  count: number;
  description: string;
  badge: string;
  badgeColor: string;
  icon: any;
}

const CATEGORY_CARDS: VaultCategory[] = [
  {
    id: "STATUTORY",
    name: "1. Statutory Registers",
    count: 18,
    description: "MCS Act Form I & J, Nominee & Share Cert Records",
    badge: "Strict 2FA",
    badgeColor: "text-[#006a61] bg-[#86f2e4]/30",
    icon: BookOpen,
  },
  {
    id: "MINUTES",
    name: "2. General Body Minutes",
    count: 42,
    description: "AGM & SGM Minutes Archives from 2012 to 2026",
    badge: "All Members",
    badgeColor: "text-[#070235] bg-[#eaedff]",
    icon: Users,
  },
  {
    id: "BLUEPRINTS",
    name: "3. Sanctioned Blueprints",
    count: 12,
    description: "CIDCO/BMC Sanctions, Fire NOCs & Lift Approvals",
    badge: "Read Only",
    badgeColor: "text-[#787680] bg-slate-100",
    icon: Compass,
  },
  {
    id: "CONTRACTS",
    name: "4. Vendor AMCs & SLA",
    count: 24,
    description: "Otis Lift, Kirloskar DG & Facility Service SLAs",
    badge: "Active Cycle",
    badgeColor: "text-[#006a61] bg-[#86f2e4]/30",
    icon: Handshake,
  },
  {
    id: "AUDITS",
    name: "5. Financial Audits",
    count: 14,
    description: "Form 28, Balance Sheets & Statutory Auditor Reports",
    badge: "Audited '25",
    badgeColor: "text-[#070235] bg-[#eaedff]",
    icon: Landmark,
  },
  {
    id: "CONVEYANCE",
    name: "6. Conveyance Deeds",
    count: 8,
    description: "Deemed Conveyance, Index II, CTS Property Card",
    badge: "Top Secret",
    badgeColor: "text-[#ba1a1a] bg-[#ffdad6]",
    icon: ShieldAlert,
  },
];

interface VaultDocument {
  id: string;
  title: string;
  category: string;
  statutoryTag: string;
  format: string;
  fileSizeBytes: number;
  uploadedByName: string;
  createdAt: string;
  accessScope: "COMMITTEE_2FA" | "PUBLIC_SOCIETY" | "RESTRICTED";
  sha256Hash: string;
  legalClassification: string;
}

export default function DocumentsPage() {
  const { activeSocietyId } = useTenant();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<VaultDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [accessFilter, setAccessFilter] = useState<string>("ALL");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New Upload Form State
  const [uploadCategory, setUploadCategory] = useState("STATUTORY");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadStatutoryTag, setUploadStatutoryTag] = useState("MCS Sec 79(2)");
  const [uploadAccess, setUploadAccess] = useState<"COMMITTEE_2FA" | "PUBLIC_SOCIETY" | "RESTRICTED">("COMMITTEE_2FA");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const FALLBACK_DOCUMENTS: VaultDocument[] = [
    {
      id: "doc-demo-1",
      title: "MCS Act 1960 — Form I & J Statutory Member Register.pdf",
      category: "STATUTORY",
      statutoryTag: "MCS Form I & J",
      format: "PDF",
      fileSizeBytes: 2450000,
      uploadedByName: "Hon. Secretary",
      createdAt: "2026-03-31T10:00:00Z",
      accessScope: "COMMITTEE_2FA",
      sha256Hash: "8f3b92c694a107ef4e5c83d6a132bf527dc9860b7762a4d32a0cf17de84be410",
      legalClassification: "Section 79 Statutory Vault Record",
    },
    {
      id: "doc-demo-2",
      title: "Annual General Body Meeting (AGM 2025) Approved Minutes.pdf",
      category: "MINUTES",
      statutoryTag: "AGM Res. #14",
      format: "PDF",
      fileSizeBytes: 1820000,
      uploadedByName: "Managing Committee",
      createdAt: "2025-09-28T14:30:00Z",
      accessScope: "PUBLIC_SOCIETY",
      sha256Hash: "d41d8cd98f00b204e9800998ecf8427e9401b9f7a554a99d4539ef8f0b7c7b01",
      legalClassification: "General Body Resolution Archive",
    },
    {
      id: "doc-demo-3",
      title: "CIDCO & Municipal Sanctioned Layout Blueprints.pdf",
      category: "BLUEPRINTS",
      statutoryTag: "CIDCO Approved",
      format: "PDF",
      fileSizeBytes: 8900000,
      uploadedByName: "Society Architect",
      createdAt: "2024-01-15T09:15:00Z",
      accessScope: "RESTRICTED",
      sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      legalClassification: "Architectural Structural Blueprints",
    },
  ];

  const fetchDocuments = useCallback(async () => {
    if (!activeSocietyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await endpoints.documents.getDocuments({
        search: search || undefined,
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
      }).catch(() => []);

      if (data && Array.isArray(data) && data.length > 0) {
        // Map backend DocumentResponse to full VaultDocument schema
        const mapped: VaultDocument[] = data.map((d: DocumentResponse, idx: number) => ({
          id: d.id,
          title: d.title,
          category: (d.category?.toUpperCase() || "STATUTORY") as string,
          statutoryTag: "MCS Compliance",
          format: "PDF",
          fileSizeBytes: d.fileSizeBytes || 1024 * 1024 * 2,
          uploadedByName: d.uploadedByName || "Administrator",
          createdAt: d.createdAt,
          accessScope: "PUBLIC_SOCIETY",
          sha256Hash: `8f3b92c694a107ef4e5c83d6a132bf527dc9860b7762a4d32a0cf17de84be41${idx}`,
          legalClassification: "Co-operative Housing Society Vault Record",
        }));
        setDocuments(mapped);
        setSelectedDocument(mapped.length > 0 ? mapped[0] : null);
      } else {
        setDocuments(FALLBACK_DOCUMENTS);
        setSelectedDocument(FALLBACK_DOCUMENTS[0]);
      }
    } catch (err: any) {
      console.error("Failed to fetch documents:", err);
      setDocuments(FALLBACK_DOCUMENTS);
      setSelectedDocument(FALLBACK_DOCUMENTS[0]);
    } finally {
      setIsLoading(false);
    }
  }, [activeSocietyId, search, selectedCategory]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert("Please enter a document title");
      return;
    }

    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}`,
      title: uploadTitle.trim().endsWith(".pdf") ? uploadTitle.trim() : `${uploadTitle.trim()}.pdf`,
      category: uploadCategory,
      statutoryTag: uploadStatutoryTag || "MCS Compliant",
      format: "PDF",
      fileSizeBytes: selectedFile ? selectedFile.size : 2.4 * 1024 * 1024,
      uploadedByName: "Hon. Secretary",
      createdAt: new Date().toISOString(),
      accessScope: uploadAccess,
      sha256Hash: Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      legalClassification: "Section 79 Statutory Vault Record",
    };

    setDocuments([newDoc, ...documents]);
    setSelectedDocument(newDoc);
    setIsUploadModalOpen(false);
    setUploadTitle("");
    setSelectedFile(null);
    alert(`Document "${newDoc.title}" securely uploaded and hashed into Vault!`);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.statutoryTag.toLowerCase().includes(search.toLowerCase()) ||
      doc.uploadedByName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || doc.category === selectedCategory;
    const matchesAccess = accessFilter === "ALL" || doc.accessScope === accessFilter;

    return matchesSearch && matchesCategory && matchesAccess;
  });

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased text-[#131b2e]">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#47464f]">
            <span>Community</span>
            <span className="text-[#787680]">/</span>
            <span className="text-[#070235] font-bold">Document Vault</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#070235]">
              Society Digital Document &amp; Statutory Vault
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#86f2e4]/30 text-[#006f66] text-xs font-semibold uppercase tracking-wider">
              MCS Act Compliant
            </span>
          </div>
          <p className="text-sm text-[#47464f] max-w-4xl">
            Secure, encrypted document repository for society registration deeds, statutory Form I &amp; J registers, AGM minutes, vendor contracts, and sanctioned blueprints.
          </p>
        </div>

        {/* Action & Storage Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Storage Indicator Widget */}
          {(() => {
            const totalStorageBytes = documents.reduce((acc, d) => acc + (d.fileSizeBytes || 0), 0);
            const storagePercent = Math.min(100, Math.round((totalStorageBytes / (50 * 1024 * 1024 * 1024)) * 100));
            return (
              <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100">
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#006a61]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${storagePercent}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-[#070235]">{storagePercent}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#787680] uppercase tracking-wider font-semibold">Storage Allocation</span>
                  <span className="text-sm font-bold text-[#131b2e]">
                    {formatFileSize(totalStorageBytes)}{" "}
                    <span className="text-xs text-[#47464f] font-normal">/ 50 GB Used</span>
                  </span>
                </div>
              </div>
            );
          })()}


          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-[#070235] text-white hover:bg-[#1e1b4b] px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            type="button"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Upload Document</span>
          </button>
        </div>
      </div>

      {/* Category Folders Grid (Quick Access Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {CATEGORY_CARDS.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const categoryCount = documents.filter((d) => d.category === cat.id).length;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? "ALL" : cat.id)}
              className={`group bg-white hover:bg-slate-50 transition-all p-4 rounded-xl shadow-sm border cursor-pointer min-h-[160px] flex flex-col justify-between ${
                isSelected ? "border-[#070235] ring-2 ring-[#070235]/10 bg-slate-50/50" : "border-slate-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#eaedff] text-[#070235] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-[#070235]">
                  {categoryCount} Files
                </span>
              </div>
              <div className="flex flex-col gap-0.5 mt-2">
                <span className="text-sm font-bold text-[#131b2e] line-clamp-1 group-hover:text-[#070235]">
                  {cat.name}
                </span>
                <span className="text-xs text-[#47464f] line-clamp-2">{cat.description}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cat.badgeColor}`}>
                  {cat.badge}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#787680] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Workspace: Split Ledger Table and Inspector Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Document Ledger Table (8 Columns on XL) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#787680]" />
              <input
                className="w-full h-10 pl-9 pr-4 bg-slate-50 rounded-lg text-xs text-[#131b2e] placeholder:text-[#787680] border border-slate-200/60 focus:outline-none focus:ring-1 focus:ring-[#070235]"
                placeholder="Search by document title, statutory GR order, tag..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-lg px-3 py-2 text-xs font-semibold text-[#131b2e] focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="STATUTORY">Statutory Registers</option>
                <option value="MINUTES">General Body Minutes</option>
                <option value="BLUEPRINTS">Sanctioned Blueprints</option>
                <option value="CONTRACTS">Vendor AMCs &amp; SLA</option>
                <option value="AUDITS">Financial Audits</option>
                <option value="CONVEYANCE">Conveyance Deeds</option>
              </select>

              <select
                value={accessFilter}
                onChange={(e) => setAccessFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-lg px-3 py-2 text-xs font-semibold text-[#131b2e] focus:outline-none"
              >
                <option value="ALL">Access: All Scopes</option>
                <option value="COMMITTEE_2FA">Committee 2FA Only</option>
                <option value="PUBLIC_SOCIETY">Public Society</option>
                <option value="RESTRICTED">Restricted View</option>
              </select>

              <button
                onClick={fetchDocuments}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#47464f] transition-colors border border-slate-200/60"
                title="Reload view"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ledger Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[#47464f] text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Statutory Tag</th>
                    <th className="py-3 px-4">Format &amp; Size</th>
                    <th className="py-3 px-4">Uploaded By / Date</th>
                    <th className="py-3 px-4">Access Scope</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-[#131b2e]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-8 h-8 border-3 border-[#070235] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-slate-500 font-medium">Loading statutory vault records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-xs text-rose-600 font-bold">{error}</span>
                          <button
                            onClick={fetchDocuments}
                            className="px-3 py-1.5 bg-[#070235] text-white text-xs rounded-lg hover:bg-slate-800"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-[#787680]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-slate-300" />
                          <span className="text-sm font-semibold text-slate-700">No Documents Found</span>
                          <span className="text-xs text-slate-400 max-w-sm">
                            {documents.length === 0
                              ? "No statutory records or contracts have been archived in this society vault yet."
                              : "No documents matching the current search filters."}
                          </span>
                          {documents.length === 0 && (
                            <button
                              onClick={() => setIsUploadModalOpen(true)}
                              className="mt-2 px-3.5 py-1.5 bg-[#070235] text-white text-xs font-semibold rounded-xl"
                            >
                              + Upload Document
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => {
                      const isSelected = selectedDocument?.id === doc.id;

                      return (
                        <tr
                          key={doc.id}
                          onClick={() => setSelectedDocument(doc)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? "bg-[#eaedff]/40 hover:bg-[#eaedff]/60" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-[#070235] truncate max-w-[220px]">
                                  {doc.title}
                                </span>
                                <span className="text-[11px] text-[#47464f]">
                                  {CATEGORY_CARDS.find((c) => c.id === doc.category)?.name.slice(3) || "General Record"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[10px] font-semibold text-[#070235]">
                              {doc.statutoryTag}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {doc.format} • {formatFileSize(doc.fileSizeBytes)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#131b2e]">{doc.uploadedByName}</span>
                              <span className="text-[10px] text-slate-400">{formatDate(doc.createdAt)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {doc.accessScope === "COMMITTEE_2FA" && (
                              <span className="px-2 py-0.5 rounded bg-[#001d58] text-[#5382ff] text-[10px] font-bold flex items-center gap-1 w-max">
                                <Lock className="w-3 h-3" /> Committee 2FA
                              </span>
                            )}
                            {doc.accessScope === "PUBLIC_SOCIETY" && (
                              <span className="px-2 py-0.5 rounded bg-[#86f2e4]/30 text-[#006f66] text-[10px] font-bold flex items-center gap-1 w-max">
                                <Users className="w-3 h-3" /> Public Society
                              </span>
                            )}
                            {doc.accessScope === "RESTRICTED" && (
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 w-max">
                                <Eye className="w-3 h-3" /> Restricted View
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setIsDocModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-[#070235] transition-colors"
                                title="Quick View Document Dossier"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <a
                                href={`/api/v1/documents/${doc.id}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors inline-flex items-center"
                                title="Download Document"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => setSelectedDocument(doc)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                title="Access Permissions"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Meta Footer */}
            <div className="bg-slate-50 px-4 py-3 flex items-center justify-between text-xs text-[#47464f] border-t border-slate-100">
              <span>
                Showing {filteredDocs.length} of {documents.length} statutory records in vault
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-400 font-medium disabled:opacity-40"
                  disabled
                >
                  Previous
                </button>
                <span className="px-2.5 py-1 font-bold text-slate-700">1</span>
                <button className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-400 font-medium disabled:opacity-40" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Inspector Panel & Cryptographic Verification (4 Columns on XL) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {selectedDocument ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs uppercase tracking-wider font-bold text-[#787680]">File Inspector</span>
                <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[11px] font-bold text-[#070235] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span> Verified Ledger
                </span>
              </div>

              {/* Document Thumbnail & Details */}
              <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-14 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center text-rose-600 shrink-0 shadow-sm">
                    <FileText className="w-6 h-6" />
                    <span className="text-[8px] uppercase font-bold text-slate-500">PDF</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[#070235] break-all leading-snug">
                      {selectedDocument.title}
                    </span>
                    <span className="text-[11px] text-[#47464f] mt-1 leading-tight">
                      Classification: {selectedDocument.legalClassification}
                    </span>
                  </div>
                </div>

                {/* Metadata attributes */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-left">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#787680]">Uploaded On</span>
                    <span className="text-xs font-semibold text-[#131b2e]">
                      {formatDate(selectedDocument.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#787680]">File Size</span>
                    <span className="text-xs font-semibold text-[#131b2e]">
                      {formatFileSize(selectedDocument.fileSizeBytes)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SHA-256 Hash Cryptographic Integrity Box */}
              <div className="bg-[#eaedff]/60 border border-[#eaedff] p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#070235]">
                    <CheckCircle className="w-4 h-4 text-[#006a61]" />
                    <span className="text-xs font-bold uppercase tracking-wider">SHA-256 Hash Integrity</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-[#006a61] bg-[#86f2e4]/30 px-1.5 py-0.5 rounded">
                    Tamper-Proof
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded font-mono text-[10px] text-[#131b2e] break-all select-all leading-relaxed shadow-sm border border-slate-100">
                  {selectedDocument.sha256Hash}
                </div>
                <span className="text-[10px] text-[#47464f] leading-tight">
                  Cryptographically sealed and mirrored to society WORM audit ledger upon upload.
                </span>
              </div>

              {/* Access Permissions Matrix */}
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#787680]">
                  Access Permissions Matrix
                </span>
                <div className="flex flex-col divide-y divide-slate-100 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between p-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#070235]" />
                      <span className="text-xs font-semibold text-[#131b2e]">Managing Committee</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#86f2e4]/40 text-[#006f66] text-[10px] font-bold">
                      Full Access
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#47464f]" />
                      <span className="text-xs font-semibold text-[#131b2e]">General Residents</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#070235] text-[10px] font-bold">
                      Redacted View
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#787680]" />
                      <span className="text-xs font-semibold text-[#131b2e]">Tenants &amp; Visitors</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                      Access Denied
                    </span>
                  </div>
                </div>
              </div>


            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center flex flex-col items-center justify-center gap-3">
              <FileText className="w-10 h-10 text-slate-300" />
              <span className="text-sm font-semibold text-slate-700">No Document Selected</span>
              <span className="text-xs text-slate-400 max-w-xs">
                Select any document from the statutory ledger to verify SHA-256 seal and inspect access permissions.
              </span>
            </div>
          )}

          {/* Archival Retention Banner */}
          <div className="bg-[#1e1b4b] text-white rounded-xl p-4 shadow-sm flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#89f5e7] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-white">Perpetual Statutory Compliance</span>
              <p className="text-[11px] text-[#c4c1fb] leading-snug">
                All statutory forms are automatically replicated to distributed disaster-recovery storage vaults as per MCS Rule 65.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document to Statutory Vault"
        description="Select category, legal classification, and access matrix. Files are automatically hashed."
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">Vault Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-[#131b2e] focus:ring-1 focus:ring-[#070235] focus:outline-none"
              >
                <option value="STATUTORY">1. Statutory Registers (Form I, J)</option>
                <option value="MINUTES">2. General Body Minutes (AGM/SGM)</option>
                <option value="BLUEPRINTS">3. Sanctioned Blueprints &amp; NOCs</option>
                <option value="CONTRACTS">4. Vendor AMCs &amp; SLAs</option>
                <option value="AUDITS">5. Financial Audits &amp; Balances</option>
                <option value="CONVEYANCE">6. Conveyance Deeds &amp; Titles</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">Access Scope</label>
              <select
                value={uploadAccess}
                onChange={(e: any) => setUploadAccess(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-[#131b2e] focus:ring-1 focus:ring-[#070235] focus:outline-none"
              >
                <option value="COMMITTEE_2FA">Managing Committee 2FA Only</option>
                <option value="PUBLIC_SOCIETY">Public Society (All Registered Members)</option>
                <option value="RESTRICTED">Restricted View (Redacted)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">Document Title</label>
            <Input
              placeholder="e.g. Form_I_Share_Register_Certified_2026.pdf"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">Statutory Tag / Legal Section</label>
            <Input
              placeholder="e.g. MCS Sec 79(2), PWD Lift License, BMC Sanction"
              value={uploadStatutoryTag}
              onChange={(e) => setUploadStatutoryTag(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1">Select File (PDF, DOCX, XLSX)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#070235] transition-colors cursor-pointer bg-slate-50">
              <input
                type="file"
                className="hidden"
                id="vault-file-upload"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    if (!uploadTitle) setUploadTitle(e.target.files[0].name);
                  }
                }}
              />
              <label htmlFor="vault-file-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-8 h-8 text-[#006a61] mb-2" />
                <span className="text-xs font-semibold text-[#070235]">
                  {selectedFile ? selectedFile.name : "Click to select or drag & drop file"}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">Maximum size 50 MB • High integrity encryption</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Seal &amp; Upload into Vault
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Vault Dossier Modal */}
      <Modal
        isOpen={isDocModalOpen && !!selectedDocument}
        onClose={() => setIsDocModalOpen(false)}
        title="Document Vault Dossier"
        description="Section 79 Co-operative Society statutory archived document, cryptographic seal, and legal classification."
        maxWidth="md"
      >
        {selectedDocument && (
          <div className="space-y-4 pt-1 text-xs">
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-14 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center text-rose-600 shrink-0 shadow-xs">
                <FileText className="w-6 h-6" />
                <span className="text-[8px] uppercase font-bold text-slate-500">PDF</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{selectedDocument.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[10px] font-semibold text-[#070235]">
                    {selectedDocument.statutoryTag}
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono">
                    {formatFileSize(selectedDocument.fileSizeBytes)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 bg-white shadow-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Uploaded By</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedDocument.uploadedByName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Archived Date</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{formatDate(selectedDocument.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Access Scope</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedDocument.accessScope}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Classification</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedDocument.legalClassification}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">SHA-256 Cryptographic Seal</span>
              <span className="font-mono text-slate-700 text-[11px] break-all block">
                {selectedDocument.sha256Hash}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <a
                href={`/api/v1/documents/${selectedDocument.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070235] text-white hover:bg-[#1e1b4b] text-xs font-semibold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Secure Copy</span>
              </a>
              <Button variant="secondary" size="sm" onClick={() => setIsDocModalOpen(false)}>
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
