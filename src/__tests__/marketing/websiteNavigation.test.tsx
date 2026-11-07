import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WebsiteHeader } from "@/components/marketing/WebsiteHeader";
import { WebsiteFooter } from "@/components/marketing/WebsiteFooter";
import * as AuthContextModule from "@/lib/auth/AuthContext";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("WebsiteHeader", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders brand logo and main navigation links when unauthenticated", () => {
    render(<WebsiteHeader />);

    // Brand title
    expect(screen.getByText("GIRVASA")).toBeInTheDocument();
    expect(screen.getByText("Society OS")).toBeInTheDocument();

    // Nav links
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute("href", "/features");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
    expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");

    // Action buttons
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/login");
    expect(screen.getAllByRole("link", { name: /Book a Demo/i })[0]).toHaveAttribute("href", "/demo");
  });

  it("hides Sign In button and renders active Dashboard button when user session is active", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "usr-admin-01",
        fullName: "Platform Admin",
        mobileNumber: "+919876543210",
        phoneVerified: true,
        status: "ACTIVE",
        createdAt: "2026-01-01T00:00:00Z",
      },
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<WebsiteHeader />);

    // Sign In button must be hidden
    expect(screen.queryByRole("link", { name: "Sign In" })).not.toBeInTheDocument();

    // Dashboard button must be visible and active
    const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Platform Admin")).toBeInTheDocument();
  });
});

describe("WebsiteFooter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders company summary, platform links, and compliance badges when unauthenticated", () => {
    render(<WebsiteFooter />);

    // Platform links
    expect(screen.getByText("Features & Modules")).toHaveAttribute("href", "/features");
    expect(screen.getByText("Pricing & ROI Calculator")).toHaveAttribute("href", "/pricing");
    expect(screen.getByText("Book Committee Walkthrough")).toHaveAttribute("href", "/demo");

    // Legal & Governance
    expect(screen.getByText("About Girvasa & Mission")).toHaveAttribute("href", "/about");
    expect(screen.getByText("Privacy Policy & DPDP Act")).toHaveAttribute("href", "/privacy");
    expect(screen.getByText("Terms & Subscription Agreement")).toHaveAttribute("href", "/terms");

    // Portal links
    expect(screen.getByText("Managing Committee Sign In")).toHaveAttribute("href", "/login");

    // Statutory compliance mentions
    expect(
      screen.getByText(/Maharashtra Co-operative Societies Act 1960 Aligned/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/DPDP Act 2023 Ready/i)).toBeInTheDocument();
  });

  it("routes portal links to /dashboard when user session is active", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "usr-admin-01",
        fullName: "Platform Admin",
        mobileNumber: "+919876543210",
        phoneVerified: true,
        status: "ACTIVE",
        createdAt: "2026-01-01T00:00:00Z",
      },
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<WebsiteFooter />);

    expect(screen.getByText("Managing Committee Dashboard")).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Resident Portal Dashboard")).toHaveAttribute("href", "/dashboard");
  });
});

