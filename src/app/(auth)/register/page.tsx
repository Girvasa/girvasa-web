"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Phone,
  User,
  Mail,
  MapPin,
  Compass,
} from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { SubscriptionPlanDto } from "@/types/subscription";

const FALLBACK_PLANS: SubscriptionPlanDto[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    code: "STARTER_100",
    name: "Starter Plan",
    description: "Ideal for small societies, standalone buildings up to 100 flats.",
    maxUnits: 100,
    pricePaise: 149900,
    currency: "INR",
    billingInterval: "MONTHLY",
    featuresSummary: "Visitor & Gate Security, Resident Mobile App, Notice Board, Basic Maintenance",
    active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    code: "GROWTH_300",
    name: "Growth Plan",
    description: "Full management suite for residential complexes up to 300 units.",
    maxUnits: 300,
    pricePaise: 349900,
    currency: "INR",
    billingInterval: "MONTHLY",
    featuresSummary: "All Starter Features + Automated Payment Gateway, Amenity Booking, Staff/Vendors",
    active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    code: "ENTERPRISE",
    name: "Enterprise Plan",
    description: "Multi-tower township management with unlimited units & priority SLA.",
    maxUnits: 999999,
    pricePaise: 799900,
    currency: "INR",
    billingInterval: "MONTHLY",
    featuresSummary: "Everything in Growth + Unlimited Towers, Community Polls, Dedicated Manager",
    active: true,
  },
];

export default function RegisterPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<SubscriptionPlanDto[]>(FALLBACK_PLANS);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("GROWTH_300");

  const [formData, setFormData] = useState({
    adminName: "",
    adminMobile: "",
    adminEmail: "",
    societyName: "",
    societyCode: "",
    addressLine1: "",
    city: "Pune",
    state: "Maharashtra",
    pincode: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    endpoints.subscription
      .getPublicPlans()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setPlans(res);
        }
      })
      .catch(() => {
        // Fallback to pre-configured plans
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = formData.adminMobile.replace(/[^\d+]/g, "");
    const formattedMobile = cleanMobile.startsWith("+")
      ? cleanMobile
      : cleanMobile.length === 10
      ? `+91${cleanMobile}`
      : cleanMobile;

    if (formattedMobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      setError("Pincode must be 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const response = await endpoints.subscription.registerSocietyWithTrial({
        adminName: formData.adminName,
        adminMobile: formattedMobile,
        adminEmail: formData.adminEmail || undefined,
        societyName: formData.societyName,
        societyCode: formData.societyCode || undefined,
        addressLine1: formData.addressLine1,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        planCode: selectedPlanCode,
      });

      // Save credentials for the newly provisioned tenant
      tokenStorage.setAccessToken(response.accessToken);
      tokenStorage.setRefreshToken(response.refreshToken);
      tokenStorage.setActiveSocietyId(response.societyId);

      // Transition to setup wizard
      router.push("/onboarding");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to register society. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-[#86f2e4] selection:text-[#00201d]">
      {/* Top Navigation */}
      <header className="w-full bg-white border-b border-slate-200 py-3.5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#070235] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            G
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#070235] tracking-tight">Girvasa Society OS</h1>
            <p className="text-[11px] text-slate-500 font-medium">B2B SaaS Property Management Platform</p>
          </div>
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold text-[#006a61] hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Already registered? Sign In</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#86f2e4]/30 text-[#006f66] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>14-Day Full-Access Free Trial — Zero Upfront Payment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#070235] tracking-tight">
            Register Housing Society & Start Setup
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Get instant access to your society management portal. Configure towers, flats, and invite committee members in under 10 minutes.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Plan Selection */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-[#070235] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#070235] text-white text-xs flex items-center justify-center">1</span>
              <span>Select Subscription Tier</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => {
                const isSelected = selectedPlanCode === p.code;
                const formattedPrice = (p.pricePaise / 100).toLocaleString("en-IN");

                return (
                  <div
                    key={p.code}
                    onClick={() => setSelectedPlanCode(p.code)}
                    className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#006a61] bg-[#f0fdfa] shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-5 h-5 text-[#006a61]" />
                      </div>
                    )}
                    <h4 className="font-bold text-[#070235] text-sm">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-xl font-black text-[#070235]">
                        ₹{formattedPrice}
                        <span className="text-xs font-normal text-slate-500"> / month</span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#006a61] mt-1">
                        Max {p.maxUnits.toLocaleString()} Flats / Units
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Society & Admin Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-[#070235] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#070235] text-white text-xs flex items-center justify-center">2</span>
              <span>Society & Administrator Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Society Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#070235] mb-1">
                  Housing Society / Complex Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="societyName"
                    required
                    placeholder="e.g. Royal Palms Co-Operative Housing Society"
                    value={formData.societyName}
                    onChange={handleChange}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                  />
                </div>
              </div>

              {/* Society Code (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[#070235] mb-1">
                  Society Code (Optional)
                </label>
                <input
                  type="text"
                  name="societyCode"
                  placeholder="e.g. RP_001 (auto-generated if empty)"
                  value={formData.societyCode}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-semibold text-[#070235] mb-1">
                  6-Digit Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  placeholder="e.g. 411045"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#070235] mb-1">
                  Address Line *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="addressLine1"
                    required
                    placeholder="e.g. Plot 42, Baner-Pashan Link Road"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-[#070235] mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Pune"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-[#070235] mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                />
              </div>

              <div className="md:col-span-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-3">Society Administrator Account</p>
              </div>

              {/* Admin Name */}
              <div>
                <label className="block text-xs font-semibold text-[#070235] mb-1">
                  Administrator Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="adminName"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.adminName}
                    onChange={handleChange}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                  />
                </div>
              </div>

              {/* Admin Mobile */}
              <div>
                <label className="block text-xs font-semibold text-[#070235] mb-1">
                  Admin Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="adminMobile"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={formData.adminMobile}
                    onChange={handleChange}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                  />
                </div>
              </div>

              {/* Admin Email */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#070235] mb-1">
                  Official Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="adminEmail"
                    placeholder="e.g. committee@emeraldheights.in"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Shield className="w-4 h-4 text-[#006a61]" />
              <span>Full features enabled during 14-day trial. Upgrade anytime.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 h-11 bg-[#070235] hover:bg-[#1e1b4b] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60"
            >
              <span>{isLoading ? "Provisioning Society..." : "Create Society & Start Setup Wizard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500">
        Girvasa Multi-Tenant Architecture • End-to-End Encrypted Data Isolation
      </footer>
    </div>
  );
}
