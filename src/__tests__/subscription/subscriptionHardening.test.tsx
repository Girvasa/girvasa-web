import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscriptionCheckoutPanel } from "@/components/subscription/SubscriptionCheckoutPanel";
import { DashboardShell } from "@/components/layout/DashboardShell";
import RegisterPage from "@/app/(auth)/register/page";
import { endpoints } from "@/lib/api/endpoints";
import * as AuthContextModule from "@/lib/auth/AuthContext";
import * as TenantContextModule from "@/lib/tenant/TenantContext";
import * as PermissionModule from "@/lib/rbac/usePermission";
import { SubscriptionPlanDto } from "@/types/subscription";

const mockUsePathname = vi.fn(() => "/units");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/lib/auth/AuthContext");
vi.mock("@/lib/tenant/TenantContext");
vi.mock("@/lib/rbac/usePermission");
vi.mock("@/components/layout/Header", () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

const MOCK_PLANS: SubscriptionPlanDto[] = [
  {
    id: "p-starter",
    code: "STARTER_100",
    name: "Starter Plan",
    description: "Up to 100 flats",
    maxUnits: 100,
    pricePaise: 149900,
    currency: "INR",
    billingInterval: "MONTHLY",
    featuresSummary: "Gate + Billing",
    active: true,
  },
  {
    id: "p-growth",
    code: "GROWTH_300",
    name: "Growth Plan",
    description: "Up to 300 flats",
    maxUnits: 300,
    pricePaise: 349900,
    currency: "INR",
    billingInterval: "MONTHLY",
    featuresSummary: "All Starter + Direct UPI",
    active: true,
  },
];

describe("Subscription Hardening, Lockout & OTP Registration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUsePathname.mockReturnValue("/units");

    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "u-1", mobileNumber: "+919876540001", fullName: "Society Admin", status: "ACTIVE" } as any,
      refreshUser: vi.fn(),
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
    } as any);

    vi.spyOn(TenantContextModule, "useTenant").mockReturnValue({
      activeSocietyId: "soc-lock-1",
      currentSociety: { societyId: "soc-lock-1", societyName: "Lockout CHS", societyCode: "LOCK_1", roles: ["SOCIETY_ADMIN"] } as any,
      societies: [],
      isLoadingTenant: false,
      switchSociety: vi.fn(),
      refreshTenant: vi.fn(),
    });

    vi.spyOn(PermissionModule, "usePermission").mockReturnValue({
      hasRole: (role: string | string[]) =>
        Array.isArray(role) ? role.includes("SOCIETY_ADMIN") : role === "SOCIETY_ADMIN",
      isPlatformAdmin: false,
      isPlatformSuperAdmin: false,
      isSocietyAdmin: true,
      isAccountant: false,
      isWebAuthorized: true,
      permissions: ["society.configure", "unit.view"],
      roles: ["SOCIETY_ADMIN"],
      hasPermission: vi.fn().mockReturnValue(true),
      canAccessModule: vi.fn().mockReturnValue(true),
    });

    vi.spyOn(endpoints.subscription, "getPublicPlans").mockResolvedValue(MOCK_PLANS);
    vi.spyOn(endpoints.subscriptions, "listMyRequests").mockResolvedValue([]);
  });

  it("DashboardShell unmounts operational children and locks Sidebar when subscription is expired on society routes", async () => {
    vi.spyOn(endpoints.subscription, "getCurrentSubscription").mockResolvedValue({
      id: "sub-exp-1",
      societyId: "soc-lock-1",
      plan: MOCK_PLANS[0],
      status: "EXPIRED",
      trialEndsAt: "2026-01-01T00:00:00Z",
      currentPeriodStart: "2025-12-18T00:00:00Z",
      currentPeriodEnd: "2026-01-01T00:00:00Z",
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: true,
    });

    render(
      <DashboardShell>
        <div data-testid="operational-units-table">Sensitive Units Data</div>
      </DashboardShell>
    );

    expect(await screen.findByText(/Society Subscription Expired/i)).toBeInTheDocument();
    expect(screen.getByText(/Workspace Paused/i)).toBeInTheDocument();
    expect(screen.queryByTestId("operational-units-table")).not.toBeInTheDocument();
  });

  it("DashboardShell keeps /platform/admin accessible even when active tenant is expired", async () => {
    mockUsePathname.mockReturnValue("/platform/admin");
    vi.spyOn(endpoints.subscription, "getCurrentSubscription").mockResolvedValue({
      id: "sub-exp-1",
      societyId: "soc-lock-1",
      plan: MOCK_PLANS[0],
      status: "EXPIRED",
      trialEndsAt: "2026-01-01T00:00:00Z",
      currentPeriodStart: "2025-12-18T00:00:00Z",
      currentPeriodEnd: "2026-01-01T00:00:00Z",
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: true,
    });

    render(
      <DashboardShell>
        <div data-testid="platform-admin-console">Platform Super Admin Queue</div>
      </DashboardShell>
    );

    expect(await screen.findByTestId("platform-admin-console")).toBeInTheDocument();
  });

  it("SubscriptionCheckoutPanel rejects non-12-digit alphanumeric UTR on UPI channel before calling API", async () => {
    vi.spyOn(endpoints.subscriptions, "createCheckoutOrder").mockResolvedValueOnce({
      requestId: "req-val-1",
      societyId: "soc-lock-1",
      planCode: "STARTER_100",
      planName: "Starter Plan",
      billingMonths: 1,
      orderReference: "SUB-ORD-VAL-1",
      gatewayName: "DIRECT_UPI",
      amount: 1499,
      currency: "INR",
      status: "INITIATED",
      upiUri: "upi://pay?pa=girvasa@upi&am=1499.00",
      payeeUpiId: "girvasa@upi",
      payeeName: "Girvasa Technologies",
      bankName: "HDFC Bank",
      bankAccountNumber: "50200000000001",
      ifscCode: "HDFC0000001",
    });
    const submitSpy = vi.spyOn(endpoints.subscriptions, "submitUtr");

    render(<SubscriptionCheckoutPanel />);

    fireEvent.click(await screen.findByRole("button", { name: /Show Zero-Fee UPI & Bank Payment Options/i }));
    const utrInput = await screen.findByPlaceholderText(/432912345678 or NEFT reference/i);
    fireEvent.change(utrInput, { target: { value: "BADUTR123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit UTR for Plan Activation/i }));

    expect(await screen.findByText(/exact 12-digit numeric value/i)).toBeInTheDocument();
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it("RegisterPage requires OTP verification before calling self-serve registration API", async () => {
    const requestOtpSpy = vi.spyOn(endpoints.auth, "requestOtp").mockResolvedValueOnce({
      requestId: "otp-req-999",
      expiresInSeconds: 300,
      resendAfterSeconds: 60,
    });
    const registerSpy = vi.spyOn(endpoints.subscription, "registerSocietyWithTrial").mockResolvedValueOnce({
      societyId: "soc-new-99",
      societyCode: "GREEN_99",
      societyName: "Green Valley CHS",
      onboardingStatus: "WIZARD_STEP_1",
      accessToken: "at-1",
      refreshToken: "rt-1",
      expiresIn: 900,
      tokenType: "Bearer",
      planCode: "GROWTH_300",
      planName: "Growth Plan",
      subscriptionStatus: "TRIALING",
      trialEndsAt: "2026-12-09T00:00:00Z",
    });

    const { container } = render(<RegisterPage />);

    const fill = (name: string, value: string) => {
      const el = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
      fireEvent.change(el, { target: { name, value } });
    };

    fill("societyName", "Green Valley CHS");
    fill("addressLine1", "Plot 12, Baner");
    fill("city", "Pune");
    fill("state", "Maharashtra");
    fill("pincode", "411045");
    fill("adminName", "Suresh Patil");
    fill("adminMobile", "9876549988");
    fill("adminEmail", "suresh@greenvalley.org");

    fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));
    await waitFor(() => {
      expect(requestOtpSpy).toHaveBeenCalledWith("+919876549988", "SMS");
    });

    fill("otpCode", "123456");
    fireEvent.click(screen.getByRole("button", { name: /Create Society & Start Setup Wizard/i }));

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          adminMobile: "+919876549988",
          otpRequestId: "otp-req-999",
          otpCode: "123456",
          adminEmail: "suresh@greenvalley.org",
        })
      );
    });
  });
});
