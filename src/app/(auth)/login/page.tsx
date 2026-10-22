"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  MessageSquare,
  HelpCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { requestOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [mobileNumber, setMobileNumber] = useState("");
  const [activeChannel, setActiveChannel] = useState<"SMS" | "WHATSAPP">("SMS");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(42);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "OTP" && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const formatPhoneNumber = (val: string) => {
    const cleaned = val.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.length === 10) return "+91" + cleaned;
    return cleaned;
  };

  const handleRequestOtp = async (channel: "SMS" | "WHATSAPP" = "SMS", e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const formatted = formatPhoneNumber(mobileNumber);
    if (!formatted || formatted.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setActiveChannel(channel);
    setIsLoading(true);
    try {
      const res = await requestOtp(formatted, channel);
      const challengeReqId = res.requestId || (res as any).challengeId || null;
      if (challengeReqId) {
        setRequestId(challengeReqId);
      }
      setStep("OTP");
      setResendTimer(45);
      setInfoMessage(
        res.message ||
          (channel === "WHATSAPP"
            ? `OTP code sent directly to your WhatsApp at ${formatted}.`
            : `OTP sent successfully via SMS to ${formatted}.`)
      );
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to send OTP challenge.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const trimmedOtp = otpCode.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      const formatted = formatPhoneNumber(mobileNumber);
      await verifyOtp(formatted, trimmedOtp, requestId || undefined);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.detail || err.message || "Invalid or expired OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] font-sans text-[#1E293B] antialiased min-h-screen flex flex-col justify-between">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="h-16 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#107A48] text-white flex items-center justify-center font-bold text-base shadow-sm">
                G
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[#1E293B] leading-none">GIRVASA</span>
                <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Society OS</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#107A48] border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">256-Bit Encrypted MCS-Compliant Gateway</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#64748B]">
              <Phone className="w-3.5 h-3.5 text-[#107A48]" />
              <span>Support:</span>
              <a className="font-semibold text-[#1E293B] hover:underline" href="tel:+918850409901">
                +91 8850 40 9901
              </a>
            </div>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
              <button className="px-2.5 py-1 rounded font-bold bg-white text-[#1E293B] shadow-sm" type="button">
                EN
              </button>
              <button className="px-2.5 py-1 rounded text-[#64748B] hover:text-[#1E293B]" type="button">
                MR
              </button>
              <button className="px-2.5 py-1 rounded text-[#64748B] hover:text-[#1E293B]" type="button">
                HI
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-20 flex-1 flex flex-col justify-center items-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-[580px] bg-white rounded-2xl shadow-xl shadow-slate-900/5 p-6 sm:p-10 relative overflow-hidden border border-slate-200">
          {/* Subtle Background Glow */}
          <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-gradient-to-br from-[#107A48]/10 via-[#1E293B]/5 to-transparent blur-2xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-56 h-56 rounded-full bg-gradient-to-tr from-emerald-50 to-transparent blur-2xl pointer-events-none"></div>

          {/* Compliance Top Badge & Titles */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#1E293B] text-[11px] uppercase tracking-wider mb-3 shadow-sm font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#107A48]" />
              <span>MCS Act &amp; Model Bye-Laws Compliant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B]">
              Sign In to Your Society Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-[440px] mt-1.5 leading-relaxed">
              Enter your registered 10-digit mobile number to receive a secure one-time password (OTP).
            </p>
          </div>

          {/* Step Indicator Toggle */}
          <div className="relative z-10 mt-6 flex items-center justify-center">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 shadow-sm text-xs font-semibold">
              <button
                onClick={() => {
                  setStep("PHONE");
                  setError(null);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${
                  step === "PHONE" ? "bg-white text-[#1E293B] shadow-sm font-bold" : "text-[#64748B]"
                }`}
                type="button"
              >
                <span className={`w-2 h-2 rounded-full ${step === "PHONE" ? "bg-[#107A48]" : "bg-slate-400"}`}></span>
                Step 1: Mobile Phone
              </button>
              <button
                onClick={() => {
                  if (mobileNumber) setStep("OTP");
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${
                  step === "OTP" ? "bg-white text-[#1E293B] shadow-sm font-bold" : "text-[#64748B]"
                }`}
                type="button"
              >
                <span className={`w-2 h-2 rounded-full ${step === "OTP" ? "bg-[#107A48]" : "bg-slate-400"}`}></span>
                Step 2: OTP Verification
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="relative z-10 mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {infoMessage && step === "OTP" && !error && (
            <div className="relative z-10 mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
              {infoMessage}
            </div>
          )}

          {/* Step 1: Phone */}
          {step === "PHONE" && (
            <form onSubmit={(e) => handleRequestOtp("SMS", e)} noValidate className="relative z-10 mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Mobile Number
                </label>
                <div className={`flex items-stretch bg-white rounded-xl border ${error ? "border-rose-400 ring-1 ring-rose-400" : "border-slate-200 focus-within:border-[#107A48] focus-within:ring-1 focus-within:ring-[#107A48]"} shadow-sm transition-all`}>
                  <div className="flex items-center gap-1.5 px-3.5 bg-slate-50 rounded-l-xl text-xs font-semibold text-[#1E293B] border-r border-slate-200">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      className="w-full h-11 px-3.5 text-sm text-[#1E293B] bg-transparent outline-none rounded-r-xl tracking-wide placeholder:text-slate-400 font-medium"
                      id="mobile-number-input"
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value);
                        if (error) setError(null);
                      }}
                    />
                    {mobileNumber.length === 10 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-[#107A48]" />
                      </div>
                    )}
                  </div>
                </div>
                {error ? (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <span>{error}</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-[#64748B] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#107A48] shrink-0" />
                    Accessible to registered Flat Owners, Tenants, Committee Members, and Staff.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  disabled={isLoading}
                  className="flex-1 h-11 bg-[#107A48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#0D623A] transition-all disabled:opacity-60"
                  type="submit"
                >
                  <span>{isLoading && activeChannel === "SMS" ? "Dispatching SMS..." : "Send SMS OTP"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  disabled={isLoading}
                  type="button"
                  onClick={(e) => handleRequestOtp("WHATSAPP", e)}
                  className="flex-1 h-11 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1EBE5D] transition-all disabled:opacity-60"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isLoading && activeChannel === "WHATSAPP" ? "Dispatching..." : "Send via WhatsApp"}</span>
                </button>
              </div>

              <div className="mt-2 pt-3 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500 mb-1.5">Setting up a new society or residential project?</p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#107A48] hover:underline"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Register Society & Start 14-Day Free Trial →</span>
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "OTP" && (
            <form onSubmit={handleVerifyOtp} className="relative z-10 mt-6 flex flex-col gap-4">
              {/* Dispatch Alert */}
              <div className="p-3.5 rounded-xl bg-[#F1F5F9] border border-slate-200 flex items-start justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${activeChannel === "WHATSAPP" ? "bg-[#25D366]" : "bg-[#107A48]"} text-white flex items-center justify-center shrink-0 mt-0.5`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E293B]">
                      {activeChannel === "WHATSAPP" ? "WhatsApp OTP Dispatched" : "SMS OTP Dispatched"}
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Sent via {activeChannel === "WHATSAPP" ? "WhatsApp chat" : "SMS"} to <span className="font-semibold text-[#1E293B]">{mobileNumber}</span>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("PHONE");
                    setError(null);
                  }}
                  className="text-xs font-semibold text-[#107A48] hover:underline shrink-0"
                >
                  Change
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#1E293B]">
                    Enter 6-Digit Verification Code
                  </label>
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeChannel === "WHATSAPP" ? "bg-[#25D366]" : "bg-[#107A48]"} animate-pulse`}></span>
                    {activeChannel === "WHATSAPP" ? "WhatsApp message dispatched" : "SMS text dispatched"}
                  </span>
                </div>

                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="font-mono text-center tracking-widest text-lg font-bold"
                  autoFocus
                  required
                />
              </div>

              {/* Resend actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 py-1 text-xs">
                <div className="flex items-center gap-1.5 text-[#64748B]">
                  <Clock className="w-3.5 h-3.5 text-[#107A48]" />
                  <span>
                    Resend in{" "}
                    <span className="font-bold text-[#1E293B]">
                      00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}s
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={() => handleRequestOtp("SMS")}
                    className="font-semibold text-[#107A48] hover:underline disabled:opacity-40"
                  >
                    Resend via SMS
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={() => handleRequestOtp("WHATSAPP")}
                    className="font-semibold text-[#25D366] hover:underline disabled:opacity-40 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 inline" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </div>

              <button
                disabled={isLoading}
                className="w-full h-11 bg-[#107A48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#0D623A] transition-all disabled:opacity-60"
                type="submit"
              >
                <span>{isLoading ? "Verifying Token..." : "Authenticate & Open Society Console"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Security & Audit Disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-[#64748B]">
            <Lock className="w-3.5 h-3.5 text-[#107A48] shrink-0 mt-0.5" />
            <p>
              Pursuant to Maharashtra Co-operative Societies Bye-Laws, all administrative logins are subject to device fingerprinting and immutable session audit logging.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-100 py-3 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-[#107A48] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#107A48]"></span>
            <span>Statutory Year FY 2026-27 Active</span>
          </div>
          <span className="hidden md:inline">Maharashtra Co-operative Societies Act 1960 Regd. Compliance</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Girvasa OS Sovereign Core</span>
          <span>•</span>
          <span>Security Level: Tier IV Encrypted</span>
        </div>
      </footer>
    </div>
  );
}
