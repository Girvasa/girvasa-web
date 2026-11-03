"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  MapPin,
  Smartphone,
  Sliders,
  MessageSquare,
  Users,
  UserX,
  Server,
  CreditCard,
  Building2,
  DollarSign,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Search,
  Edit3,
  Send,
  Eye,
  EyeOff,
  Clock,
  RefreshCw,
  Lock,
  Unlock,
  Check,
  X,
  Bell,
  HelpCircle,
  Activity,
  FileCheck,
  Play,
  CheckSquare,
  XCircle,
  UserCheck,
  Pause,
  UserPlus,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { usePermission } from "@/lib/rbac/usePermission";
import { AccessDenied } from "@/components/common/AccessDenied";
import { endpoints } from "@/lib/api/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AppVersionConfig,
  FeatureFlagItem,
  SmsGatewayConfig,
  PlatformUserItem,
  DeletedUserItem,
  MaintenanceConfig,
  PaymentGatewayConfig,
  SocietyBankAccountItem,
  SubscriptionRateItem,
  ApiKeyIntegrationItem,
  BroadcastNotificationRequest,
  SocietyLifecycleItem,
  PendingApprovalItem,
  UnreconciledTransactionItem,
  BackgroundJobItem,
} from "@/types/platformAdmin";

type AdminTab =
  | "SETTINGS_FEATURES"
  | "SMS_NOTIFICATIONS"
  | "RBAC_PERMISSIONS"
  | "USERS_PROFILES"
  | "DELETED_USERS"
  | "SOCIETIES_LIFECYCLE"
  | "MAKER_CHECKER"
  | "PAYMENT_RECONCILE"
  | "BACKGROUND_JOBS"
  | "SERVER_MAINTENANCE"
  | "PAYMENTS_GATEWAY"
  | "SUBSCRIPTIONS"
  | "API_KEYS"
  | "SECURITY_AGENCY_SLA";

export default function SuperAdminConsolePage() {
  const { isPlatformSuperAdmin } = usePermission();
  const [activeTab, setActiveTab] = useState<AdminTab>("SETTINGS_FEATURES");

  // Loading & Action Toast
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // 1. App Versions & Feature Flags
  const [appVersions, setAppVersions] = useState<AppVersionConfig | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagItem[]>([]);

  // 2. SMS & Notifications
  const [smsConfig, setSmsConfig] = useState<SmsGatewayConfig | null>(null);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastPayload, setBroadcastPayload] = useState<BroadcastNotificationRequest>({
    title: "",
    message: "",
    channels: ["PUSH"],
    targetAudience: "ALL",
    priority: "HIGH",
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // 3. Active Users & Profile Corrections
  const [usersList, setUsersList] = useState<PlatformUserItem[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<PlatformUserItem | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    kycStatus: "VERIFIED" as "VERIFIED" | "PENDING" | "REJECTED",
    auditReason: "",
  });

  // 4. Deleted Users (Undo / Restore)
  const [deletedUsers, setDeletedUsers] = useState<DeletedUserItem[]>([]);
  const [restoringUserId, setRestoringUserId] = useState<string | null>(null);

  // 5. Society Lifecycle Controls
  const [societies, setSocieties] = useState<SocietyLifecycleItem[]>([]);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedSocietyForReassign, setSelectedSocietyForReassign] = useState<SocietyLifecycleItem | null>(null);
  const [newAdminUserId, setNewAdminUserId] = useState("");
  const [reassignReason, setReassignReason] = useState("");

  // 6. Maker-Checker Dual-Control Approvals
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalItem[]>([]);

  // 7. Payment Dispute & Force Reconciliation
  const [unreconciledTxns, setUnreconciledTxns] = useState<UnreconciledTransactionItem[]>([]);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [selectedTxnForReconcile, setSelectedTxnForReconcile] = useState<UnreconciledTransactionItem | null>(null);
  const [bankUtrInput, setBankUtrInput] = useState("");
  const [reconcileNote, setReconcileNote] = useState("");

  // 8. Background Jobs & Cron Supervisor
  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJobItem[]>([]);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  // 9. Server Maintenance
  const [maintenance, setMaintenance] = useState<MaintenanceConfig | null>(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    isMaintenanceMode: false,
    scheduledStart: "",
    scheduledEnd: "",
    title: "",
    bannerMessage: "",
    allowAdminBypass: true,
  });

  // 10. Payment Gateway & Bank Accounts
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<SocietyBankAccountItem[]>([]);

  // 11. Subscriptions
  const [subscriptionRates, setSubscriptionRates] = useState<SubscriptionRateItem[]>([]);

  // 12. API Keys
  const [apiKeys, setApiKeys] = useState<ApiKeyIntegrationItem[]>([]);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Data Fetch
  useEffect(() => {
    if (!isPlatformSuperAdmin) {
      setIsLoading(false);
      return;
    }

    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [
          vers,
          flags,
          sms,
          users,
          deleted,
          socs,
          apprs,
          unrec,
          jobs,
          maint,
          pg,
          banks,
          rates,
          keys,
        ] = await Promise.all([
          endpoints.platformAdmin.getAppVersions(),
          endpoints.platformAdmin.getFeatureFlags(),
          endpoints.platformAdmin.getSmsConfig(),
          endpoints.platformAdmin.getUsers(),
          endpoints.platformAdmin.getDeletedUsers(),
          endpoints.platformAdmin.getSocietiesLifecycle(),
          endpoints.platformAdmin.getPendingApprovals(),
          endpoints.platformAdmin.getUnreconciledTransactions(),
          endpoints.platformAdmin.getBackgroundJobs(),
          endpoints.platformAdmin.getMaintenanceConfig(),
          endpoints.platformAdmin.getPaymentGatewayConfig(),
          endpoints.platformAdmin.getBankAccounts(),
          endpoints.platformAdmin.getSubscriptionRates(),
          endpoints.platformAdmin.getApiKeys(),
        ]);

        setAppVersions(vers);
        setFeatureFlags(flags);
        setSmsConfig(sms);
        setUsersList(users);
        setDeletedUsers(deleted);
        setSocieties(socs);
        setPendingApprovals(apprs);
        setUnreconciledTxns(unrec);
        setBackgroundJobs(jobs);
        setMaintenance(maint);
        setMaintenanceForm({
          isMaintenanceMode: maint.isMaintenanceMode,
          scheduledStart: maint.scheduledStart || "",
          scheduledEnd: maint.scheduledEnd || "",
          title: maint.title || "",
          bannerMessage: maint.bannerMessage || "",
          allowAdminBypass: maint.allowAdminBypass,
        });
        setPaymentConfig(pg);
        setBankAccounts(banks);
        setSubscriptionRates(rates);
        setApiKeys(keys);
      } catch (err: any) {
        console.error("Failed to load platform admin settings:", err);
        showToast("Error loading some platform settings", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isPlatformSuperAdmin]);

  // 1. Ghost Support Mode / User Impersonation
  const handleImpersonateUser = (user: PlatformUserItem) => {
    if (!confirm(`Enter Ghost Support Mode and log in as "${user.fullName}" (${user.role}) for ${user.societyName}?`)) return;
    try {
      if (typeof window !== "undefined") {
        const currentToken = localStorage.getItem("girvasa_access_token") || "girvasa_dev_super_admin_access_token_jwt";
        localStorage.setItem("girvasa_super_admin_backup_token", currentToken);
        localStorage.setItem(
          "girvasa_impersonation",
          JSON.stringify({
            originalAdminName: "Platform Super Admin",
            targetUserName: user.fullName,
            targetRole: user.role,
            targetSocietyName: user.societyName,
            targetUserId: user.id,
            targetSocietyId: user.societyId,
          })
        );
        localStorage.setItem("girvasa_active_society_id", user.societyId);
      }
      showToast(`Entering Ghost Mode as ${user.fullName}...`);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch {
      showToast("Failed to initiate impersonation session", "error");
    }
  };

  // 2. Society Freeze / Suspend Toggle
  const handleToggleSocietyStatus = async (soc: SocietyLifecycleItem) => {
    const isSuspending = soc.status === "ACTIVE";
    const promptMsg = isSuspending
      ? `Enter justification reason for suspending society "${soc.name}":`
      : `Enter justification reason for reactivating society "${soc.name}":`;
    const reason = prompt(promptMsg);
    if (!reason) return;

    const newStatus = isSuspending ? "SUSPENDED" : "ACTIVE";
    try {
      await endpoints.platformAdmin.updateSocietyStatus(soc.id, newStatus, reason);
      setSocieties((prev) =>
        prev.map((s) => (s.id === soc.id ? { ...s, status: newStatus as any, suspensionReason: isSuspending ? reason : undefined } : s))
      );
      showToast(`Society ${soc.name} is now ${newStatus}. Tenant access updated.`);
    } catch {
      showToast("Failed to update society status", "error");
    }
  };

  // 3. Society Admin Reassignment
  const handleReassignAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocietyForReassign || !newAdminUserId || !reassignReason) {
      showToast("Please select user and enter justification reason", "error");
      return;
    }
    try {
      await endpoints.platformAdmin.reassignSocietyAdmin(selectedSocietyForReassign.id, newAdminUserId, reassignReason);
      setSocieties((prev) =>
        prev.map((s) =>
          s.id === selectedSocietyForReassign.id
            ? { ...s, primaryAdminName: `User (${newAdminUserId})`, primaryAdminUserId: newAdminUserId }
            : s
        )
      );
      showToast(`Primary Admin role for ${selectedSocietyForReassign.name} reassigned to ${newAdminUserId}!`);
      setReassignModalOpen(false);
      setSelectedSocietyForReassign(null);
      setNewAdminUserId("");
      setReassignReason("");
    } catch {
      showToast("Failed to reassign society admin", "error");
    }
  };

  // 4. Maker-Checker Approvals
  const handleApproveRequest = async (appr: PendingApprovalItem) => {
    if (!confirm(`Approve and execute privileged action: "${appr.title}"?`)) return;
    try {
      await endpoints.platformAdmin.approveRequest(appr.id, "Approved by Platform Super Admin (Checker)");
      setPendingApprovals((prev) =>
        prev.map((a) => (a.id === appr.id ? { ...a, status: "APPROVED", reviewedByAdminName: "Platform Super Admin" } : a))
      );
      showToast(`Approval executed: ${appr.title}`);
    } catch {
      showToast("Failed to approve request", "error");
    }
  };

  const handleRejectRequest = async (appr: PendingApprovalItem) => {
    const reason = prompt(`Enter rejection reason for "${appr.title}":`);
    if (!reason) return;
    try {
      await endpoints.platformAdmin.rejectRequest(appr.id, reason);
      setPendingApprovals((prev) =>
        prev.map((a) => (a.id === appr.id ? { ...a, status: "REJECTED", reviewedByAdminName: "Platform Super Admin" } : a))
      );
      showToast(`Request rejected: ${appr.title}`);
    } catch {
      showToast("Failed to reject request", "error");
    }
  };

  // 5. Payment Force Reconcile
  const handleForceReconcileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxnForReconcile || !bankUtrInput) {
      showToast("Please enter Bank UTR / Reference ID", "error");
      return;
    }
    try {
      await endpoints.platformAdmin.forceReconcileTransaction(selectedTxnForReconcile.id, bankUtrInput, reconcileNote);
      setUnreconciledTxns((prev) => prev.filter((t) => t.id !== selectedTxnForReconcile.id));
      showToast(`Payment of ₹${(selectedTxnForReconcile.amountPaise / 100).toFixed(2)} reconciled and credited to unit ${selectedTxnForReconcile.unitNumber}!`);
      setReconcileModalOpen(false);
      setSelectedTxnForReconcile(null);
      setBankUtrInput("");
      setReconcileNote("");
    } catch {
      showToast("Failed to force reconcile payment", "error");
    }
  };

  // 6. Background Jobs Trigger
  const handleTriggerJob = async (job: BackgroundJobItem) => {
    setRunningJobId(job.jobId);
    try {
      await endpoints.platformAdmin.triggerBackgroundJob(job.jobId);
      setBackgroundJobs((prev) =>
        prev.map((j) => (j.jobId === job.jobId ? { ...j, lastRunAt: new Date().toISOString(), status: "COMPLETED" } : j))
      );
      showToast(`Job "${job.jobName}" triggered successfully! Execution completed.`);
    } catch {
      showToast("Failed to trigger job", "error");
    } finally {
      setRunningJobId(null);
    }
  };

  // Feature Flag Toggle
  const handleToggleFlag = async (key: string, currentVal: boolean) => {
    try {
      await endpoints.platformAdmin.toggleFeatureFlag(key, !currentVal);
      setFeatureFlags((prev) =>
        prev.map((f) => (f.key === key ? { ...f, enabledGlobal: !currentVal } : f))
      );
      showToast(`Feature flag ${key} updated to ${!currentVal ? "ENABLED" : "DISABLED"}`);
    } catch {
      showToast("Failed to toggle feature flag", "error");
    }
  };

  // Broadcast Notification
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastPayload.title || !broadcastPayload.message) {
      showToast("Please enter title and message", "error");
      return;
    }
    setIsBroadcasting(true);
    try {
      const res = await endpoints.platformAdmin.broadcastNotification(broadcastPayload);
      showToast(`Broadcast dispatched successfully to ${res.deliveredCount} active recipients!`);
      setBroadcastModalOpen(false);
      setBroadcastPayload({
        title: "",
        message: "",
        channels: ["PUSH"],
        targetAudience: "ALL",
        priority: "HIGH",
      });
    } catch {
      showToast("Failed to dispatch broadcast notification", "error");
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Undo / Restore Deleted User
  const handleRestoreUser = async (user: DeletedUserItem) => {
    setRestoringUserId(user.id);
    try {
      await endpoints.platformAdmin.restoreDeletedUser(user.id, "Super Admin recovery action");
      setDeletedUsers((prev) => prev.filter((u) => u.id !== user.id));
      const restoredUser: PlatformUserItem = {
        id: user.id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        email: user.email,
        kycStatus: "VERIFIED",
        societyId: user.societyId,
        societyName: user.societyName,
        role: user.role,
        status: "ACTIVE",
        lastLoginAt: new Date().toISOString(),
        createdAt: user.deletedAt,
      };
      setUsersList((prev) => [restoredUser, ...prev]);
      showToast(`User ${user.fullName} successfully restored!`);
    } catch {
      showToast("Failed to restore user", "error");
    } finally {
      setRestoringUserId(null);
    }
  };

  // Revoke All Sessions for User
  const handleRevokeSessions = async (userId: string, name: string) => {
    if (!confirm(`Force logout user "${name}" from all web and mobile devices?`)) return;
    try {
      await endpoints.platformAdmin.revokeUserSessions(userId);
      showToast(`All active sessions revoked for ${name}.`);
    } catch {
      showToast("Failed to revoke user sessions", "error");
    }
  };

  // Open Edit User Modal
  const openEditUserModal = (u: PlatformUserItem) => {
    setSelectedUserForEdit(u);
    setEditUserForm({
      fullName: u.fullName,
      email: u.email || "",
      mobileNumber: u.mobileNumber,
      kycStatus: u.kycStatus,
      auditReason: "",
    });
  };

  // Submit User Profile Correction
  const handleSaveUserCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    if (!editUserForm.auditReason.trim()) {
      showToast("Audit Reason is required for Super Admin profile corrections as per industry standards", "error");
      return;
    }

    try {
      await endpoints.platformAdmin.updateUserProfile(selectedUserForEdit.id, editUserForm);
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === selectedUserForEdit.id
            ? {
                ...u,
                fullName: editUserForm.fullName,
                email: editUserForm.email,
                mobileNumber: editUserForm.mobileNumber,
                kycStatus: editUserForm.kycStatus,
              }
            : u
        )
      );
      showToast(`Profile for ${editUserForm.fullName} updated with audit justification logged.`);
      setSelectedUserForEdit(null);
    } catch {
      showToast("Failed to update user profile", "error");
    }
  };

  // Update Maintenance Window
  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await endpoints.platformAdmin.updateMaintenanceConfig(maintenanceForm);
      setMaintenance(updated);
      showToast(
        maintenanceForm.isMaintenanceMode
          ? "SYSTEM MAINTENANCE MODE IS NOW ACTIVE! Public access restricted."
          : "Maintenance mode configured and saved."
      );
    } catch {
      showToast("Failed to update maintenance settings", "error");
    }
  };

  // Override Bank Account Verification
  const handleVerifyBankOverride = async (socId: string, socName: string) => {
    const reason = prompt(`Enter Super Admin justification note for verifying bank account of "${socName}":`);
    if (!reason) return;
    try {
      await endpoints.platformAdmin.overrideBankAccountVerification(socId, "VERIFIED", reason);
      setBankAccounts((prev) =>
        prev.map((b) => (b.societyId === socId ? { ...b, verificationStatus: "VERIFIED" } : b))
      );
      showToast(`Bank account for ${socName} marked VERIFIED via Super Admin override.`);
    } catch {
      showToast("Failed to verify bank account", "error");
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.mobileNumber.includes(userSearchQuery) ||
        (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
        u.societyName.toLowerCase().includes(userSearchQuery.toLowerCase());
      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearchQuery, userRoleFilter]);

  if (!isPlatformSuperAdmin) {
    return <AccessDenied message="Platform Super Admin authorization required. This area controls global system settings, downtime scheduling, payment accounts, and master data overrides." />;
  }

  const pendingApprovalsCount = pendingApprovals.filter((a) => a.status === "PENDING").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold border ${
            toastMessage.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-700"
              : toastMessage.type === "error"
              ? "bg-rose-900 text-rose-100 border-rose-700"
              : "bg-slate-900 text-slate-100 border-slate-700"
          } animate-in fade-in slide-in-from-bottom-2 duration-200`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-white shadow">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Platform Super Admin Control Center</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <Lock className="w-3 h-3" /> God Mode / Privileged
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                Master oversight for Web & Mobile App settings, Ghost Support impersonation, society lifecycle freezes, Maker-Checker four-eyes approvals, payment dispute reconciliation, background billing cron jobs, and soft-delete recovery.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBroadcastModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Push</span>
            </button>
            <button
              onClick={() => setActiveTab("SERVER_MAINTENANCE")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border shadow-sm transition ${
                maintenance?.isMaintenanceMode
                  ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{maintenance?.isMaintenanceMode ? "MAINTENANCE ACTIVE" : "Maintenance Mode"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px scrollbar-none">
        {[
          { id: "SETTINGS_FEATURES", label: "App & Feature Flags", icon: Sliders },
          { id: "SOCIETIES_LIFECYCLE", label: `Societies (${societies.length})`, icon: Building2 },
          { id: "USERS_PROFILES", label: "Users & Ghost Mode", icon: Users },
          { id: "MAKER_CHECKER", label: `Approvals (${pendingApprovalsCount})`, icon: CheckSquare, badge: pendingApprovalsCount },
          { id: "PAYMENT_RECONCILE", label: `Reconcile (${unreconciledTxns.length})`, icon: CreditCard },
          { id: "BACKGROUND_JOBS", label: "Cron Jobs", icon: Activity },
          { id: "DELETED_USERS", label: `Deleted Users (${deletedUsers.length})`, icon: UserX },
          { id: "SMS_NOTIFICATIONS", label: "SMS & Notifications", icon: MessageSquare },
          { id: "RBAC_PERMISSIONS", label: "RBAC & Permissions", icon: ShieldCheck },
          { id: "SERVER_MAINTENANCE", label: "Server Downtime", icon: Server },
          { id: "PAYMENTS_GATEWAY", label: "Gateways & Banks", icon: CreditCard },
          { id: "SUBSCRIPTIONS", label: "Subscription Rates", icon: DollarSign },
          { id: "API_KEYS", label: "API Keys", icon: Key },
          { id: "SECURITY_AGENCY_SLA", label: "Agency SLA & Guard Attendance", icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors relative ${
                isActive
                  ? "border-rose-600 text-rose-700 bg-rose-50/50 rounded-t-lg"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rose-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping absolute top-2 right-1" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. App Versions & Feature Flags */}
      {activeTab === "SETTINGS_FEATURES" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-rose-600" />
                  Mobile App Version & Force Update Governance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controls minimum client versions allowed to connect to Society OS backend APIs.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Production Release Track
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Android Minimum / Latest</span>
                <span className="font-bold text-slate-800 text-sm">
                  v{appVersions?.minAndroidVersion} / v{appVersions?.latestAndroidVersion}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">iOS Minimum / Latest</span>
                <span className="font-bold text-slate-800 text-sm">
                  v{appVersions?.minIosVersion} / v{appVersions?.latestIosVersion}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Force Update Enforcement</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                    appVersions?.forceUpdateEnabled
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {appVersions?.forceUpdateEnabled ? "MANDATORY FORCE UPDATE" : "OPTIONAL (PROMPT ONLY)"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Store Distribution Links</span>
                <span className="text-emerald-700 font-medium truncate block">
                  Google Play & Apple AppStore Configured
                </span>
              </div>
            </div>
          </div>

          {/* Global Feature Flags */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  System Feature Flags & Capability Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enable or disable modules across the entire platform or for specific tenant societies.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {featureFlags.map((flag) => (
                <div key={flag.key} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{flag.name}</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                        {flag.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{flag.description}</p>
                    {flag.societiesOverridden > 0 && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium inline-block">
                        {flag.societiesOverridden} societies customized
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleFlag(flag.key, flag.enabledGlobal)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      flag.enabledGlobal ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        flag.enabledGlobal ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. Societies Lifecycle & Freeze */}
      {activeTab === "SOCIETIES_LIFECYCLE" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Societies Lifecycle, Operational Freezes & Admin Reassignment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage tenant provisioning, lock delinquent societies, and transfer secretary authority during management disputes.
              </p>
            </div>
            <button
              onClick={() => {
                const name = prompt("Enter legal name of new society to provision:");
                if (!name) return;
                const city = prompt("Enter city (e.g. Mumbai):") || "Mumbai";
                const newSoc: SocietyLifecycleItem = {
                  id: `soc-${Date.now()}`,
                  name,
                  code: `SOC-${Math.floor(100 + Math.random() * 900)}`,
                  city,
                  state: "Maharashtra",
                  totalUnits: 50,
                  status: "ACTIVE",
                  planCode: "FREE_TRIAL",
                  primaryAdminUserId: "usr-superadmin-001",
                  primaryAdminName: "Platform Super Admin",
                  primaryAdminMobile: "+919876543210",
                  createdAt: new Date().toISOString(),
                };
                setSocieties((prev) => [newSoc, ...prev]);
                showToast(`Society "${name}" provisioned successfully with 14-day trial!`);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision New Society</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3">Society Legal Name</th>
                  <th className="px-3 py-3">Code & Location</th>
                  <th className="px-3 py-3">Units & Plan</th>
                  <th className="px-3 py-3">Current Primary Admin</th>
                  <th className="px-3 py-3">Lifecycle Status</th>
                  <th className="px-4 py-3 text-right">Super Admin Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {societies.map((soc) => (
                  <tr key={soc.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">{soc.name}</td>
                    <td className="px-3 py-3 text-slate-600">
                      <div className="font-mono font-semibold">{soc.code}</div>
                      <div className="text-[11px] text-slate-400">{soc.city}, {soc.state}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <div>{soc.totalUnits} Units</div>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {soc.planCode}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      <div className="font-semibold">{soc.primaryAdminName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{soc.primaryAdminMobile}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          soc.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : soc.status === "SUSPENDED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {soc.status}
                      </span>
                      {soc.suspensionReason && (
                        <div className="text-[10px] text-rose-600 italic max-w-xs truncate mt-0.5">
                          "{soc.suspensionReason}"
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSocietyForReassign(soc);
                          setReassignModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-semibold transition"
                        title="Reassign Society Admin seat"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Reassign Admin</span>
                      </button>

                      <button
                        onClick={() => handleToggleSocietyStatus(soc)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          soc.status === "ACTIVE"
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                        title={soc.status === "ACTIVE" ? "Suspend tenant access" : "Reactivate tenant"}
                      >
                        {soc.status === "ACTIVE" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <span>{soc.status === "ACTIVE" ? "Freeze / Suspend" : "Unfreeze"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. Users, Profiles & Ghost Support Mode */}
      {activeTab === "USERS_PROFILES" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, phone, email, or society..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="PLATFORM_SUPER_ADMIN">Platform Super Admin</option>
                <option value="SOCIETY_ADMIN">Society Admin</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="SECURITY_GUARD">Security Guard</option>
                <option value="RESIDENT">Resident</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3">User Full Name</th>
                  <th className="px-3 py-3">Contact (Phone & Email)</th>
                  <th className="px-3 py-3">Society & Unit</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">KYC</th>
                  <th className="px-4 py-3 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">{user.fullName}</td>
                    <td className="px-3 py-3 text-slate-600">
                      <div>{user.mobileNumber}</div>
                      {user.email && <div className="text-[11px] text-slate-400">{user.email}</div>}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <div className="font-semibold text-slate-800">{user.societyName}</div>
                      {user.unitNumber && <div className="text-[11px] text-slate-400">Unit: {user.unitNumber}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.kycStatus === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      {/* Ghost Mode Impersonate */}
                      <button
                        onClick={() => handleImpersonateUser(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 text-[11px] font-semibold border border-amber-200 transition"
                        title="Log in as this user to debug support issues"
                      >
                        <Eye className="w-3 h-3 text-amber-600" />
                        <span>Ghost Login</span>
                      </button>

                      {/* Edit / Correct Profile */}
                      <button
                        onClick={() => openEditUserModal(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-semibold transition"
                        title="Correct Name, Mobile or KYC with mandatory audit trail"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {/* Force Logout */}
                      <button
                        onClick={() => handleRevokeSessions(user.id, user.fullName)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold transition"
                        title="Force Invalidate all active JWT tokens on mobile and web"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Kick</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. Maker-Checker Dual-Control Approvals */}
      {activeTab === "MAKER_CHECKER" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-amber-700" />
                Dual-Control ("Four-Eyes") Privilege Approval Queue
              </h4>
              <p className="text-xs text-amber-800">
                To prevent single-operator fraud, high-risk changes (Payment Gateway switches, Bank Account overrides, and Pricing alterations) must be verified and approved by a second administrator.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-200 text-amber-900">
              {pendingApprovalsCount} Pending Decision{pendingApprovalsCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3">Proposed Action Title</th>
                  <th className="px-3 py-3">Operation Category</th>
                  <th className="px-3 py-3">Proposed By & Timestamp</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Four-Eyes Verification Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingApprovals.map((appr) => (
                  <tr key={appr.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{appr.title}</div>
                      <div className="text-[11px] text-slate-500">{appr.description}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {appr.actionType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <div>{appr.proposedByAdminName}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(appr.proposedAt)}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          appr.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 animate-pulse"
                            : appr.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {appr.status}
                      </span>
                      {appr.reviewedByAdminName && (
                        <div className="text-[10px] text-slate-400 mt-0.5">by {appr.reviewedByAdminName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {appr.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleApproveRequest(appr)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-sm transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Execute</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(appr)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Action Concluded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. Payment Dispute & Force Reconciliation */}
      {activeTab === "PAYMENT_RECONCILE" && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Unreconciled Payment Disputes & Webhook Fallback Reconciliation
              </h4>
              <p className="text-xs text-indigo-800">
                Fix gateway webhook delivery failures where resident funds were debited by the bank but not credited to the maintenance ledger.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-200 text-indigo-900">
              {unreconciledTxns.length} Unallocated Transaction{unreconciledTxns.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            {unreconciledTxns.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                All payment transactions are perfectly reconciled with bank gateways and ledger accounts.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Transaction & PG Ref</th>
                    <th className="px-3 py-3">Resident & Unit</th>
                    <th className="px-3 py-3">Society</th>
                    <th className="px-3 py-3">Debited Amount</th>
                    <th className="px-3 py-3">Dispute State</th>
                    <th className="px-4 py-3 text-right">Reconciliation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {unreconciledTxns.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono">
                        <div className="font-bold text-slate-900">{txn.transactionId}</div>
                        <div className="text-[11px] text-slate-500">{txn.gatewayReference}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        <div className="font-semibold">{txn.residentName}</div>
                        <div className="text-[11px] text-slate-500">Unit: {txn.unitNumber}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{txn.societyName}</td>
                      <td className="px-3 py-3 font-bold text-emerald-700 text-sm">
                        {formatCurrency(txn.amountPaise / 100)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTxnForReconcile(txn);
                            setBankUtrInput(txn.gatewayReference);
                            setReconcileModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-sm transition"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Force Reconcile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. Background Jobs & Cron Supervisor */}
      {activeTab === "BACKGROUND_JOBS" && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Automated Background Cron Jobs & Scheduling Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect system scheduled jobs: monthly billing invoice generation, late fee interest compounding, and quota resets.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
            {backgroundJobs.map((job) => (
              <div key={job.jobId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{job.jobName}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {job.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Cron: {job.scheduleCron}</div>
                  <div className="text-[10px] text-slate-400">
                    Last Run: {formatDate(job.lastRunAt)} • Next Scheduled: {formatDate(job.nextRunAt)} • Processed: {job.recordsProcessed} items
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleTriggerJob(job)}
                    disabled={runningJobId === job.jobId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{runningJobId === job.jobId ? "Executing..." : "Run Job Now"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. Deleted Users */}
      {activeTab === "DELETED_USERS" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                Soft-Deleted Users Repository with Instant Undo Functionality
              </h4>
              <p className="text-xs text-amber-800">
                Society OS preserves soft-deleted user records to ensure financial audit integrity. Super Admins can restore any mistakenly removed member with a single click.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-200 text-amber-900">
              {deletedUsers.length} Archived Record{deletedUsers.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            {deletedUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No soft-deleted users in the archive. All member records are active.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Removed User</th>
                    <th className="px-3 py-3">Mobile & Email</th>
                    <th className="px-3 py-3">Society & Role</th>
                    <th className="px-3 py-3">Deleted Date & By</th>
                    <th className="px-3 py-3">Deletion Reason</th>
                    <th className="px-4 py-3 text-right">Undo / Restore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {deletedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-bold text-slate-800 line-through text-slate-500">
                        {u.fullName}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        <div>{u.mobileNumber}</div>
                        {u.email && <div className="text-[11px] text-slate-400">{u.email}</div>}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        <div className="font-semibold text-slate-800">{u.societyName}</div>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        <div>{formatDate(u.deletedAt)}</div>
                        <div className="text-[10px] text-slate-400">by {u.deletedBy}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 italic max-w-xs truncate">
                        "{u.deletionReason}"
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRestoreUser(u)}
                          disabled={restoringUserId === u.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-sm transition disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{restoringUserId === u.id ? "Restoring..." : "Undo / Restore"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 8. SMS & Notifications */}
      {activeTab === "SMS_NOTIFICATIONS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Primary SMS Gateway</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">{smsConfig?.provider} Enterprise</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  CONNECTED
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>DLT Sender ID:</span>
                  <span className="font-semibold">{smsConfig?.senderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>DLT Entity ID:</span>
                  <span className="font-mono text-[11px]">{smsConfig?.dltEntityId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auth Key:</span>
                  <span className="font-mono text-[11px]">{smsConfig?.authKeyMasked}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Daily SMS Consumption</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">
                  {smsConfig?.usedToday.toLocaleString()} / {smsConfig?.dailyQuota.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">6.8% used</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "6.8%" }} />
              </div>
              <span className="text-[11px] text-slate-500 block">
                Reset occurs automatically every midnight at 00:00 IST.
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Delivery SLA Health</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-emerald-600">{smsConfig?.deliverySuccessRate}%</span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                  Zero Queued Drops
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                WhatsApp Business Cloud API enabled for high-priority invoice PDF delivery and gate security pass alerts.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                Emergency Platform Broadcast Notification
              </h4>
              <p className="text-xs text-indigo-800">
                Send instantaneous push alerts or SMS announcements to all mobile app installations and active web portal sessions.
              </p>
            </div>
            <button
              onClick={() => setBroadcastModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
            >
              Compose Broadcast
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 9. RBAC & Permissions */}
      {activeTab === "RBAC_PERMISSIONS" && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Role-Based Access Control (RBAC) Governance Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Society OS canonical 11 roles mapped across 8 core operational domains. Enforced server-side via Spring Security pre-authorization.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3">Role Designation</th>
                  <th className="px-3 py-3">Scope</th>
                  <th className="px-3 py-3">Billing & PG</th>
                  <th className="px-3 py-3">Gate OS</th>
                  <th className="px-3 py-3">Complaints</th>
                  <th className="px-3 py-3">Audit Logs</th>
                  <th className="px-3 py-3">System Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="bg-rose-50/40">
                  <td className="px-4 py-3 font-bold text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    PLATFORM_SUPER_ADMIN
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-slate-600">Cross-Tenant</td>
                  <td className="px-3 py-3 text-emerald-600 font-bold">FULL ACCESS</td>
                  <td className="px-3 py-3 text-emerald-600 font-bold">FULL ACCESS</td>
                  <td className="px-3 py-3 text-emerald-600 font-bold">FULL ACCESS</td>
                  <td className="px-3 py-3 text-emerald-600 font-bold">FULL ACCESS</td>
                  <td className="px-3 py-3 text-rose-600 font-bold">UNRESTRICTED</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-800">SOCIETY_ADMIN</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-slate-500">Tenant (Society)</td>
                  <td className="px-3 py-3 text-emerald-600">Manage & Approve</td>
                  <td className="px-3 py-3 text-emerald-600">Full Access</td>
                  <td className="px-3 py-3 text-emerald-600">Full Access</td>
                  <td className="px-3 py-3 text-emerald-600">View Society Audit</td>
                  <td className="px-3 py-3 text-slate-400">Denied</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-800">ACCOUNTANT</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-slate-500">Tenant (Society)</td>
                  <td className="px-3 py-3 text-emerald-600">Ledgers & Invoicing</td>
                  <td className="px-3 py-3 text-slate-400">View Only</td>
                  <td className="px-3 py-3 text-slate-400">View Financial</td>
                  <td className="px-3 py-3 text-emerald-600">View Reports</td>
                  <td className="px-3 py-3 text-slate-400">Denied</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-800">SECURITY_GUARD</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-slate-500">Gate Terminal</td>
                  <td className="px-3 py-3 text-slate-400">Denied</td>
                  <td className="px-3 py-3 text-emerald-600">Check-in / Check-out</td>
                  <td className="px-3 py-3 text-slate-400">Denied</td>
                  <td className="px-3 py-3 text-slate-400">Denied</td>
                  <td className="px-3 py-3 text-slate-400">Denied</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-800">RESIDENT</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-slate-500">Own Unit Only</td>
                  <td className="px-3 py-3 text-emerald-600">Pay Own Dues</td>
                  <td className="px-3 py-3 text-emerald-600">Pre-approve Guests</td>
                  <td className="px-3 py-3 text-emerald-600">File & Track Own</td>
                  <td className="px-3 py-3 text-slate-400">Denied</td>
                  <td className="px-3 py-3 text-slate-400">Denied</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 10. Server Downtime Scheduling */}
      {activeTab === "SERVER_MAINTENANCE" && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-rose-600" />
                Server Downtime & Scheduled Maintenance Window
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Take the entire platform or specific micro-components offline for database migrations or cloud upgrades. Super Admins bypass the maintenance block.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                maintenanceForm.isMaintenanceMode
                  ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              {maintenanceForm.isMaintenanceMode ? "SYSTEM OFFLINE / MAINTENANCE" : "SYSTEM ONLINE"}
            </span>
          </div>

          <form onSubmit={handleSaveMaintenance} className="space-y-4 max-w-2xl text-xs">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Activate Maintenance Mode Now</span>
                <span className="text-slate-500 text-[11px]">
                  When active, public web pages & mobile apps display the maintenance banner with retry timers.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMaintenanceForm((prev) => ({ ...prev, isMaintenanceMode: !prev.isMaintenanceMode }))
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenanceForm.isMaintenanceMode ? "bg-rose-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    maintenanceForm.isMaintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Scheduled Start Time</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.scheduledStart.slice(0, 16)}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduledStart: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Scheduled End / Restoration Time</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.scheduledEnd.slice(0, 16)}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduledEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Maintenance Window Title</label>
              <input
                type="text"
                value={maintenanceForm.title}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                placeholder="e.g. Scheduled Core Infrastructure Database Upgrade"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Public Banner Message (Web & Mobile)</label>
              <textarea
                rows={3}
                value={maintenanceForm.bannerMessage}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, bannerMessage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                placeholder="Explain the maintenance reason clearly to residents and committee members..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="adminBypass"
                checked={maintenanceForm.allowAdminBypass}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, allowAdminBypass: e.target.checked })}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="adminBypass" className="text-slate-700 font-medium">
                Allow Platform Super Admins to bypass maintenance screen (enables verification before opening public access)
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm transition"
              >
                Save Downtime Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: 11. Payments, Gateway & Bank Accounts */}
      {activeTab === "PAYMENTS_GATEWAY" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Primary Payment Gateway Integration (PG)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Razorpay, Cashfree, PayU, and Stripe production merchant credentials.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                {paymentConfig?.activeProvider} LIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Gateway Provider</span>
                <span className="font-bold text-slate-900 text-sm">{paymentConfig?.activeProvider}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Key ID (Merchant Identifier)</span>
                <span className="font-mono text-slate-900 font-semibold">{paymentConfig?.keyId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Key Secret</span>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="font-mono text-slate-900 font-semibold">
                  {showSecret ? "sec_live_99A821948192841289133bK" : paymentConfig?.keySecretMasked}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Society Settlement Bank Accounts & Verification Overrides
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Maintenance collections are routed directly to verified society bank accounts. Super Admins can manually verify pending accounts.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Society Name</th>
                    <th className="px-3 py-3">Account Holder Name</th>
                    <th className="px-3 py-3">Bank & Branch</th>
                    <th className="px-3 py-3">Account Number & IFSC</th>
                    <th className="px-3 py-3">Penny-Drop Status</th>
                    <th className="px-4 py-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bankAccounts.map((b) => (
                    <tr key={b.societyId} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-bold text-slate-900">{b.societyName}</td>
                      <td className="px-3 py-3 text-slate-700">{b.accountHolderName}</td>
                      <td className="px-3 py-3 text-slate-600">
                        <div>{b.bankName}</div>
                        <div className="text-[11px] text-slate-400">{b.branchName}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        <div className="font-mono font-semibold">{b.accountNumberMasked}</div>
                        <div className="text-[11px] font-mono text-slate-500">IFSC: {b.ifscCode}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.verificationStatus === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {b.verificationStatus !== "VERIFIED" ? (
                          <button
                            onClick={() => handleVerifyBankOverride(b.societyId, b.societyName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-[11px] font-semibold transition"
                          >
                            <Check className="w-3 h-3" />
                            <span>Verify Override</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Payouts
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 12. Subscriptions Rates & Plans */}
      {activeTab === "SUBSCRIPTIONS" && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Subscription Pricing Tiers & Commercial Plans
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage per-unit monthly/annual SaaS pricing, flat base rates, and complimentary trial terms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subscriptionRates.map((rate) => (
              <div
                key={rate.planCode}
                className="rounded-xl border border-slate-200 p-4 space-y-3 bg-gradient-to-b from-white to-slate-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{rate.planName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                    {rate.activeSocietiesCount} societies
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {rate.ratePerUnitPaise === 0 ? "FREE" : formatCurrency(rate.ratePerUnitPaise / 100)}
                  </span>
                  {rate.ratePerUnitPaise > 0 && (
                    <span className="text-xs text-slate-500 font-normal"> / unit / month</span>
                  )}
                  {rate.flatFeePaise > 0 && (
                    <div className="text-[11px] text-slate-500">
                      + Base fee: {formatCurrency(rate.flatFeePaise / 100)}/mo
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1 text-[11px] text-slate-600">
                  <div className="font-semibold text-slate-800">Inclusions:</div>
                  {rate.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-500">
                      <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      const newRate = prompt(
                        `Enter new rate per unit for ${rate.planName} in Rupees (current: ₹${rate.ratePerUnitPaise / 100}):`,
                        (rate.ratePerUnitPaise / 100).toString()
                      );
                      if (newRate && !isNaN(Number(newRate))) {
                        const paise = Math.round(Number(newRate) * 100);
                        endpoints.platformAdmin.updateSubscriptionRate(rate.planCode, { ratePerUnitPaise: paise });
                        setSubscriptionRates((prev) =>
                          prev.map((r) => (r.planCode === rate.planCode ? { ...r, ratePerUnitPaise: paise } : r))
                        );
                        showToast(`Rate for ${rate.planName} updated to ₹${newRate}/unit/month!`);
                      }
                    }}
                    className="w-full py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition text-center"
                  >
                    Adjust Pricing Rate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 13. External API Keys & Integrations */}
      {activeTab === "API_KEYS" && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                External Cloud Provider API Keys & Secret Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Secret tokens for Google Maps Geocoding, WhatsApp Meta Cloud API, AWS S3 Storage, and Kaleyra SMS Fallbacks.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
            {apiKeys.map((k) => (
              <div key={k.keyName} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{k.keyName}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {k.status}
                    </span>
                  </div>
                  <div className="font-mono text-slate-600 text-[11px]">{k.maskedKey}</div>
                  <div className="text-[10px] text-slate-400">Last rotated: {formatDate(k.lastRotatedAt)}</div>
                </div>

                <button
                  onClick={() => {
                    const confirmRotate = confirm(`Rotate secret key for "${k.keyName}"? Ensure new key is provisioned in Vault.`);
                    if (!confirmRotate) return;
                    endpoints.platformAdmin.rotateApiKey(k.service);
                    showToast(`API Key for ${k.keyName} rotated successfully.`);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 transition"
                >
                  Rotate Secret
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SECURITY AGENCY SLA & CROSS-SOCIETY ATTENDANCE */}
      {activeTab === "SECURITY_AGENCY_SLA" && (
        <div className="space-y-6">
          {/* Header & Description */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Platform Security Agencies &amp; Multi-Society Gate SLA
                </h3>
                <p className="text-slate-500 text-xs">
                  Cross-tenant security attendance monitoring, agency shift compliance, and gate shortage audit.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert("Platform Security SLA Audit Report generated for 3 societies.")}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-xs"
              >
                Export SLA Report (.csv)
              </button>
            </div>
          </div>

          {/* Platform Security Metrics Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900"></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Monitored Society Gates
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                  18 <span className="text-xs text-slate-400 font-normal">Active Ingress Gates</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Across 3 Registered Societies</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600"></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Deployed Security Force
                </span>
                <div className="text-2xl font-bold text-[#006a61] mt-1 tracking-tight">
                  36 <span className="text-xs text-slate-400 font-normal">Guards On Duty</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Live Active Shifts Monitored</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Platform Average SLA
                </span>
                <div className="text-2xl font-bold text-emerald-700 mt-1 tracking-tight">
                  96.8% <span className="text-xs text-slate-400 font-normal">Fulfillment Rate</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Contract Benchmark: 95.0%</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Unmanned Gate Shortages
                </span>
                <div className="text-2xl font-bold text-rose-600 mt-1 tracking-tight">
                  1 <span className="text-xs text-slate-400 font-normal">Shortage Alert (Sapphire)</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Penalty Deductions: ₹4,500</span>
              </div>
            </div>
          </div>

          {/* Active Geofence Perimeter & Guard Bunking Audit (Platform Super Admin Telemetry) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-slate-900 text-xs">
                  Active Geofence Perimeter Breaches &amp; Guard Telemetry (Super Admin View)
                </h4>
              </div>
              <span className="text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                1 Incident Under SLA Review
              </span>
            </div>
            <div className="p-4">
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Ram Singh (#SEC-102)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                      POST ABANDONMENT (&gt;60m)
                    </span>
                    <span className="text-[11px] text-slate-500">Sapphire Towers RWA • Gate 2 (Service Ingress)</span>
                  </div>
                  <div className="text-xs text-rose-900 font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span><strong>Coordinates:</strong> 18.521850° N, 73.857920° E</span>
                    <span><strong>Distance from Post:</strong> 142m (Threshold: 60m)</span>
                    <span><strong>Speed:</strong> 4.8 km/h</span>
                    <span><strong>Status:</strong> Unexplained Departure without Punch Out / Break</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => alert("SLA Penalty notice of ₹500 issued to Terrier Security Services.")}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    Apply Agency SLA Penalty
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cross-Tenant Security Agency Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs">
                Security Vendor Agency SLA Performance (November 2026)
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                Multi-Tenant Isolation Enforced
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Society &amp; Code</th>
                    <th className="px-4 py-3">Security Agency</th>
                    <th className="px-4 py-3 text-center">Active Gates</th>
                    <th className="px-4 py-3 text-center">Contracted Shifts</th>
                    <th className="px-4 py-3 text-center">Delivered Shifts</th>
                    <th className="px-4 py-3 text-center">SLA Fulfillment</th>
                    <th className="px-4 py-3 text-center">Shortages</th>
                    <th className="px-4 py-3 text-right">Penalty Deductions</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">Emerald Heights Co-Op</div>
                      <div className="text-[11px] text-slate-400 font-mono">#SOC-EMR-01 • Pune</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      SIS Security Services Ltd.
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-[#006a61] font-bold text-[11px]">
                        2 / 2 Covered
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">120</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">116</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-[#006a61]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>96.7%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-600">0</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">₹0.00</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#006a61] border border-teal-200">
                        COMPLIANT
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">Palm Meadows Villa Society</div>
                      <div className="text-[11px] text-slate-400 font-mono">#SOC-PLM-02 • Bengaluru</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      G4S Secure Solutions India
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-[#006a61] font-bold text-[11px]">
                        1 / 1 Covered
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">60</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">59</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-[#006a61]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>98.3%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-600">0</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">₹0.00</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#006a61] border border-teal-200">
                        COMPLIANT
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">Sapphire Towers RWA</div>
                      <div className="text-[11px] text-slate-400 font-mono">#SOC-SPH-03 • Gurugram</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      Terrier Security Services
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[11px]">
                        1 / 2 Shortage
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">90</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">82</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-rose-600">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>91.1%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">1 Night</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">₹4,500.00</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        PENALTY APPLIED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reassign Society Admin Seat */}
      {reassignModalOpen && selectedSocietyForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Reassign Primary Society Admin for {selectedSocietyForReassign.name}
              </h3>
              <button onClick={() => setReassignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReassignAdminSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Primary Admin</label>
                <div className="p-2.5 rounded bg-slate-100 text-slate-800 font-semibold">
                  {selectedSocietyForReassign.primaryAdminName} ({selectedSocietyForReassign.primaryAdminMobile})
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select New Society Administrator</label>
                <select
                  required
                  value={newAdminUserId}
                  onChange={(e) => setNewAdminUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                >
                  <option value="">-- Choose verified member --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.mobileNumber}) — {u.societyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg space-y-1">
                <label className="font-bold text-amber-900 block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Mandatory Management Handover Reason
                </label>
                <p className="text-[11px] text-amber-700">
                  Recorded in compliance audit trail (e.g. AGM Election Resolution No. 4/2026).
                </p>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Registered AGM Minutes submitted showing handover of Secretary position..."
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-amber-300 rounded focus:outline-none text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Confirm Admin Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Force Reconcile Payment */}
      {reconcileModalOpen && selectedTxnForReconcile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Force Reconcile Payment & Credit Unit Maintenance Ledger
              </h3>
              <button onClick={() => setReconcileModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleForceReconcileSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Resident</span>
                  <span className="font-bold text-slate-900">{selectedTxnForReconcile.residentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Unit & Society</span>
                  <span className="font-bold text-slate-900">
                    {selectedTxnForReconcile.unitNumber} ({selectedTxnForReconcile.societyName})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Debited Amount</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrency(selectedTxnForReconcile.amountPaise / 100)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gateway Ref</span>
                  <span className="font-mono text-slate-700">{selectedTxnForReconcile.gatewayReference}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Bank Reference Number / RRN / UTR
                </label>
                <input
                  type="text"
                  required
                  value={bankUtrInput}
                  onChange={(e) => setBankUtrInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  placeholder="e.g. BANK-RRN-9948218491"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reconciliation Audit Note</label>
                <textarea
                  rows={2}
                  value={reconcileNote}
                  onChange={(e) => setReconcileNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  placeholder="e.g. Verified with bank statement that payment was captured successfully despite webhook failure..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReconcileModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Credit Ledger & Mark Settled
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit / Correct User Profile */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-600" />
                Super Admin Profile Correction & KYC Override
              </h3>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserCorrection} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editUserForm.fullName}
                  onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={editUserForm.mobileNumber}
                    onChange={(e) => setEditUserForm({ ...editUserForm, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">KYC Verification Status</label>
                <select
                  value={editUserForm.kycStatus}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      kycStatus: e.target.value as "VERIFIED" | "PENDING" | "REJECTED",
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                >
                  <option value="VERIFIED">VERIFIED (Government ID / Sale Deed Accepted)</option>
                  <option value="PENDING">PENDING (Verification in Progress)</option>
                  <option value="REJECTED">REJECTED (Documentation Inadequate)</option>
                </select>
              </div>

              {/* Mandatory Audit Reason */}
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg space-y-1">
                <label className="font-bold text-rose-900 block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Mandatory Super Admin Justification Note (Audit Trail)
                </label>
                <p className="text-[11px] text-rose-700">
                  Required by DPDP & ISO 27001 compliance when modifying user personally identifiable information (PII).
                </p>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Corrected surname spelling as per registered society agreement deed submitted by secretary..."
                  value={editUserForm.auditReason}
                  onChange={(e) => setEditUserForm({ ...editUserForm, auditReason: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-rose-300 rounded focus:outline-none text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm"
                >
                  Confirm Profile Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Broadcast Notification */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                Dispatch Platform Broadcast Notification
              </h3>
              <button onClick={() => setBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Broadcast Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Water Supply Maintenance Notice"
                  value={broadcastPayload.title}
                  onChange={(e) => setBroadcastPayload({ ...broadcastPayload, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Message Content</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed announcement displayed on mobile lock screen & web banner..."
                  value={broadcastPayload.message}
                  onChange={(e) => setBroadcastPayload({ ...broadcastPayload, message: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Audience</label>
                  <select
                    value={broadcastPayload.targetAudience}
                    onChange={(e: any) =>
                      setBroadcastPayload({ ...broadcastPayload, targetAudience: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                  >
                    <option value="ALL">All Registered Users</option>
                    <option value="SOCIETY_ADMINS">Society Admins & Secretaries</option>
                    <option value="RESIDENTS">Residents & Owners Only</option>
                    <option value="SECURITY_STAFF">Gate Security Guards</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={broadcastPayload.priority}
                    onChange={(e: any) =>
                      setBroadcastPayload({ ...broadcastPayload, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                  >
                    <option value="NORMAL">Normal Announcement</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">URGENT Emergency Alert</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {isBroadcasting ? "Sending..." : "Dispatch Broadcast Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
