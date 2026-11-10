import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SuperAdminConsolePage from "@/app/(dashboard)/platform/admin/page";
import * as usePermissionModule from "@/lib/rbac/usePermission";
import { endpoints } from "@/lib/api/endpoints";
import {
  DEV_APP_VERSIONS,
  DEV_FEATURE_FLAGS,
  DEV_SMS_GATEWAY,
  DEV_PLATFORM_USERS,
  DEV_DELETED_USERS,
  DEV_SOCIETIES_LIFECYCLE,
  DEV_PENDING_APPROVALS,
  DEV_UNRECONCILED_TXNS,
  DEV_BACKGROUND_JOBS,
  DEV_MAINTENANCE_CONFIG,
  DEV_PAYMENT_GATEWAY,
  DEV_SOCIETY_BANK_ACCOUNTS,
  DEV_SUBSCRIPTION_RATES,
  DEV_API_KEY_INTEGRATIONS,
} from "@/lib/api/devMockData";

vi.mock("@/lib/rbac/usePermission");

describe("Super Admin Console Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(endpoints.platformAdmin, "getAppVersions").mockResolvedValue(DEV_APP_VERSIONS);
    vi.spyOn(endpoints.platformAdmin, "getFeatureFlags").mockResolvedValue(DEV_FEATURE_FLAGS);
    vi.spyOn(endpoints.platformAdmin, "getSmsConfig").mockResolvedValue(DEV_SMS_GATEWAY);
    vi.spyOn(endpoints.platformAdmin, "getUsers").mockResolvedValue(DEV_PLATFORM_USERS);
    vi.spyOn(endpoints.platformAdmin, "getDeletedUsers").mockResolvedValue(DEV_DELETED_USERS);
    vi.spyOn(endpoints.platformAdmin, "getSocietiesLifecycle").mockResolvedValue(DEV_SOCIETIES_LIFECYCLE);
    vi.spyOn(endpoints.platformAdmin, "getPendingApprovals").mockResolvedValue(DEV_PENDING_APPROVALS);
    vi.spyOn(endpoints.platformAdmin, "getUnreconciledTransactions").mockResolvedValue(DEV_UNRECONCILED_TXNS);
    vi.spyOn(endpoints.platformAdmin, "getBackgroundJobs").mockResolvedValue(DEV_BACKGROUND_JOBS);
    vi.spyOn(endpoints.platformAdmin, "getMaintenanceConfig").mockResolvedValue(DEV_MAINTENANCE_CONFIG);
    vi.spyOn(endpoints.platformAdmin, "getPaymentGatewayConfig").mockResolvedValue(DEV_PAYMENT_GATEWAY);
    vi.spyOn(endpoints.platformAdmin, "getBankAccounts").mockResolvedValue(DEV_SOCIETY_BANK_ACCOUNTS);
    vi.spyOn(endpoints.platformAdmin, "getSubscriptionRates").mockResolvedValue(DEV_SUBSCRIPTION_RATES);
    vi.spyOn(endpoints.platformAdmin, "getApiKeys").mockResolvedValue(DEV_API_KEY_INTEGRATIONS);
  });

  it("should deny access when user is not a Platform Super Admin", () => {
    vi.spyOn(usePermissionModule, "usePermission").mockReturnValue({
      isPlatformSuperAdmin: false,
      isPlatformAdmin: false,
      isSocietyAdmin: true,
      isAccountant: false,
      isWebAuthorized: true,
      permissions: ["society.view"],
      roles: ["SOCIETY_ADMIN"],
      hasPermission: vi.fn().mockReturnValue(false),
      hasRole: vi.fn().mockReturnValue(false),
      canAccessModule: vi.fn().mockReturnValue(false),
    });

    render(<SuperAdminConsolePage />);
    expect(screen.getByText(/Platform Super Admin authorization required/i)).toBeDefined();
  });

  it("should render Super Admin Control Center when user is Platform Super Admin", async () => {
    vi.spyOn(usePermissionModule, "usePermission").mockReturnValue({
      isPlatformSuperAdmin: true,
      isPlatformAdmin: true,
      isSocietyAdmin: true,
      isAccountant: true,
      isWebAuthorized: true,
      permissions: ["*"],
      roles: ["PLATFORM_SUPER_ADMIN"],
      hasPermission: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(true),
      canAccessModule: vi.fn().mockReturnValue(true),
    });

    render(<SuperAdminConsolePage />);

    expect(screen.getByText(/Platform Super Admin Control Center/i)).toBeDefined();
    expect(screen.getByText(/God Mode \/ Privileged/i)).toBeDefined();

    // Verify all primary tabs exist
    expect(screen.getByRole("button", { name: /App & Feature Flags/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /SMS & Notifications/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /RBAC & Permissions/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Users & Ghost Mode/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Server Downtime/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Gateways & Banks/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Subscription Rates/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /API Keys/i })).toBeDefined();
  });

  it("should navigate to Deleted Users and provide Undo / Restore functionality", async () => {
    vi.spyOn(usePermissionModule, "usePermission").mockReturnValue({
      isPlatformSuperAdmin: true,
      isPlatformAdmin: true,
      isSocietyAdmin: true,
      isAccountant: true,
      isWebAuthorized: true,
      permissions: ["*"],
      roles: ["PLATFORM_SUPER_ADMIN"],
      hasPermission: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(true),
      canAccessModule: vi.fn().mockReturnValue(true),
    });

    render(<SuperAdminConsolePage />);

    // Click Deleted Users tab
    const deletedTab = await screen.findByRole("button", { name: /Deleted Users/i });
    fireEvent.click(deletedTab);

    // Verify deleted users banner
    expect(await screen.findByText(/Soft-Deleted Users Repository with Instant Undo Functionality/i)).toBeDefined();
    
    // Verify soft-deleted items render
    expect(await screen.findByText(/Amitabh Verma/i)).toBeDefined();
    expect(screen.getAllByText(/Undo \/ Restore/i).length).toBeGreaterThan(0);
  });

  it("should render Societies Lifecycle and allow freeze/suspend and admin reassignment", async () => {
    vi.spyOn(usePermissionModule, "usePermission").mockReturnValue({
      isPlatformSuperAdmin: true,
      isPlatformAdmin: true,
      isSocietyAdmin: true,
      isAccountant: true,
      isWebAuthorized: true,
      permissions: ["*"],
      roles: ["PLATFORM_SUPER_ADMIN"],
      hasPermission: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(true),
      canAccessModule: vi.fn().mockReturnValue(true),
    });

    render(<SuperAdminConsolePage />);

    const socTab = await screen.findByRole("button", { name: /Societies/i });
    fireEvent.click(socTab);

    expect(await screen.findByText(/Societies Lifecycle, Operational Freezes & Admin Reassignment/i)).toBeDefined();
    expect(await screen.findByText(/Girvasa Apex Grandeur Society/i)).toBeDefined();
    expect(screen.getAllByText(/Freeze \/ Suspend/i).length).toBeGreaterThan(0);
  });

  it("should render Maker-Checker Dual-Control Approvals and Payment Reconciliation tabs", async () => {
    vi.spyOn(usePermissionModule, "usePermission").mockReturnValue({
      isPlatformSuperAdmin: true,
      isPlatformAdmin: true,
      isSocietyAdmin: true,
      isAccountant: true,
      isWebAuthorized: true,
      permissions: ["*"],
      roles: ["PLATFORM_SUPER_ADMIN"],
      hasPermission: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(true),
      canAccessModule: vi.fn().mockReturnValue(true),
    });

    render(<SuperAdminConsolePage />);

    // Test Approvals tab
    const approvalsTab = await screen.findByRole("button", { name: /Approvals/i });
    fireEvent.click(approvalsTab);
    expect(await screen.findByText(/Dual-Control \("Four-Eyes"\) Privilege Approval Queue/i)).toBeDefined();

    // Test Reconcile tab
    const reconcileTab = await screen.findByRole("button", { name: /Reconcile/i });
    fireEvent.click(reconcileTab);
    expect(await screen.findByText(/Unreconciled Payment Disputes & Webhook Fallback Reconciliation/i)).toBeDefined();

    // Test Cron Jobs tab
    const jobsTab = await screen.findByRole("button", { name: /Cron Jobs/i });
    fireEvent.click(jobsTab);
    expect(await screen.findByText(/Automated Background Cron Jobs & Scheduling Engine/i)).toBeDefined();
  });
});
