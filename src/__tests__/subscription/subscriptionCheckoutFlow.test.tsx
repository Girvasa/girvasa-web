import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscriptionCheckoutPanel } from "@/components/subscription/SubscriptionCheckoutPanel";
import { SubscriptionAlertBanner } from "@/components/subscription/SubscriptionAlertBanner";
import { endpoints } from "@/lib/api/endpoints";
import * as TenantContextModule from "@/lib/tenant/TenantContext";
import * as PermissionModule from "@/lib/rbac/usePermission";
import { SubscriptionPlanDto } from "@/types/subscription";

vi.mock("@/lib/tenant/TenantContext");
vi.mock("@/lib/rbac/usePermission");

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
  {
    id: "p-enterprise",
    code: "ENTERPRISE",
    name: "Enterprise Plan",
    description: "Unlimited flats",
    maxUnits: 999999,
    pricePaise: 799900,
    currency: "INR",
    billingInterval: "MONTHLY",
    featuresSummary: "Unlimited Towers + SLA",
    active: true,
  },
];

describe("Subscription Checkout Payment Options (All Plans)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(endpoints.subscription, "getPublicPlans").mockResolvedValue(MOCK_PLANS);
    vi.spyOn(endpoints.subscriptions, "listMyRequests").mockResolvedValue([]);
  });

  it("shows Direct UPI VPA, UPI Intent link, Bank NEFT details, and UTR input when choosing ANY plan (Starter -> Enterprise)", async () => {
    const createOrderSpy = vi
      .spyOn(endpoints.subscriptions, "createCheckoutOrder")
      .mockResolvedValueOnce({
        requestId: "req-starter-1",
        societyId: "soc-1",
        planCode: "STARTER_100",
        planName: "Starter Plan",
        billingMonths: 1,
        orderReference: "SUB-ORD-STARTER-1",
        gatewayName: "DIRECT_UPI",
        amount: 1499,
        currency: "INR",
        status: "INITIATED",
        upiUri: "upi://pay?pa=girvasa@upi&pn=Girvasa%20Technologies&tr=SUB-ORD-STARTER-1&am=1499.00&cu=INR",
        payeeUpiId: "girvasa@upi",
        payeeName: "Girvasa Technologies",
        bankName: "HDFC Bank",
        bankAccountNumber: "50200000000001",
        ifscCode: "HDFC0000001",
      });

    const submitUtrSpy = vi
      .spyOn(endpoints.subscriptions, "submitUtr")
      .mockResolvedValueOnce({
        requestId: "req-starter-1",
        societyId: "soc-1",
        planCode: "STARTER_100",
        planName: "Starter Plan",
        billingMonths: 1,
        orderReference: "SUB-ORD-STARTER-1",
        gatewayName: "DIRECT_UPI",
        amount: 1499,
        currency: "INR",
        status: "PENDING_VERIFICATION",
        paymentMethod: "UPI",
        utrReference: "432998765432",
        payeeUpiId: "girvasa@upi",
        payeeName: "Girvasa Technologies",
        bankName: "HDFC Bank",
        bankAccountNumber: "50200000000001",
        ifscCode: "HDFC0000001",
      });

    render(<SubscriptionCheckoutPanel initialPlanCode="GROWTH_300" />);

    // Select Starter Plan instead of default Growth
    const starterBtn = await screen.findByRole("button", { name: /Starter Plan/i });
    fireEvent.click(starterBtn);

    const showPayBtn = screen.getByRole("button", {
      name: /Show Zero-Fee UPI & Bank Payment Options \(₹1,499\)/i,
    });
    fireEvent.click(showPayBtn);

    await waitFor(() => {
      expect(createOrderSpy).toHaveBeenCalledWith({
        planCode: "STARTER_100",
        billingMonths: 1,
      });
    });

    // Payment options must both be visible
    expect(await screen.findByText(/Option A: Direct UPI/i)).toBeInTheDocument();
    expect(screen.getByText(/Option B: Bank Transfer \(NEFT \/ IMPS/i)).toBeInTheDocument();
    expect(screen.getByText("girvasa@upi")).toBeInTheDocument();
    expect(screen.getByText(/50200000000001/)).toBeInTheDocument();
    expect(screen.getByText(/HDFC0000001/)).toBeInTheDocument();

    const upiLink = screen.getByRole("link", { name: /Open UPI App to Pay ₹1,499/i });
    expect(upiLink).toHaveAttribute(
      "href",
      expect.stringContaining("upi://pay?pa=girvasa@upi")
    );

    // Submit UTR
    const utrInput = screen.getByPlaceholderText(/432912345678 or NEFT reference/i);
    fireEvent.change(utrInput, { target: { value: "432998765432" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit UTR for Plan Activation/i }));

    await waitFor(() => {
      expect(submitUtrSpy).toHaveBeenCalledWith("req-starter-1", {
        utrNumber: "432998765432",
        paymentMethod: "UPI",
      });
    });

    expect(await screen.findByText(/UTR Submitted: 432998765432/i)).toBeInTheDocument();
  });

  it("shows Enterprise payment options from Expired Trial Lockout Banner without bypassing checkout", async () => {
    vi.spyOn(TenantContextModule, "useTenant").mockReturnValue({
      activeSocietyId: "soc-new-1",
      currentSociety: { societyId: "soc-new-1", societyName: "Silver Oak CHS", societyCode: "SO_01", roles: ["SOCIETY_ADMIN"] } as any,
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
      permissions: ["society.configure"],
      roles: ["SOCIETY_ADMIN"],
      hasPermission: vi.fn().mockReturnValue(true),
      canAccessModule: vi.fn().mockReturnValue(true),
    });

    vi.spyOn(endpoints.subscription, "getCurrentSubscription").mockResolvedValue({
      id: "sub-1",
      societyId: "soc-new-1",
      plan: MOCK_PLANS[0],
      status: "EXPIRED",
      trialEndsAt: "2026-01-01T00:00:00Z",
      currentPeriodStart: "2025-12-18T00:00:00Z",
      currentPeriodEnd: "2026-01-01T00:00:00Z",
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: true,
    });

    const createOrderSpy = vi
      .spyOn(endpoints.subscriptions, "createCheckoutOrder")
      .mockResolvedValueOnce({
        requestId: "req-ent-1",
        societyId: "soc-new-1",
        planCode: "ENTERPRISE",
        planName: "Enterprise Plan",
        billingMonths: 1,
        orderReference: "SUB-ORD-ENT-1",
        gatewayName: "DIRECT_UPI",
        amount: 7999,
        currency: "INR",
        status: "INITIATED",
        upiUri: "upi://pay?pa=girvasa@upi&pn=Girvasa%20Technologies&tr=SUB-ORD-ENT-1&am=7999.00&cu=INR",
        payeeUpiId: "girvasa@upi",
        payeeName: "Girvasa Technologies",
        bankName: "HDFC Bank",
        bankAccountNumber: "50200000000001",
        ifscCode: "HDFC0000001",
      });

    render(<SubscriptionAlertBanner />);

    const entCard = await screen.findByRole("button", { name: /Enterprise Plan/i });
    fireEvent.click(entCard);

    fireEvent.click(screen.getByRole("button", { name: /Pay & Reactivate Society/i }));
    const launchPayBtn = await screen.findByRole("button", {
      name: /Pay & Reactivate Society \(Zero-Fee UPI \/ Bank\)/i,
    });
    fireEvent.click(launchPayBtn);

    await waitFor(() => {
      expect(createOrderSpy).toHaveBeenCalledWith({
        planCode: "ENTERPRISE",
        billingMonths: 1,
      });
    });

    expect(await screen.findByText(/Open UPI App to Pay ₹7,999/i)).toBeInTheDocument();
  });
});

