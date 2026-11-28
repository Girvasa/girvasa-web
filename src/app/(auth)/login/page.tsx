"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { GirvasaLogo } from "@/components/common/GirvasaLogo";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/lib/auth/AuthContext";
import type { OtpIntent } from "@/types/auth";

const WEAK_PINS = new Set([
  "0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999",
  "1234", "2345", "3456", "4567", "5678", "6789", "0123",
  "9876", "8765", "7654", "6543", "5432", "4321", "3210",
  "1122", "2580",
]);

function validatePinClient(pin: string): string | null {
  if (!/^\d{4}$/.test(pin)) return "Enter a 4-digit numeric PIN";
  if (WEAK_PINS.has(pin)) return `Avoid simple or sequential digits like ${pin}`;
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const {
    checkUser,
    requestOtp,
    verifyOtp,
    loginWithPin,
    setupPin,
    resetPinWithOtp,
    isAuthenticated,
    isLoading: authLoading,
    needsPinSetup,
  } = useAuth();

  const [step, setStep] = useState<"PHONE" | "PIN" | "OTP" | "PIN_SETUP" | "FORGOT_PIN">("PHONE");
  const [mobileNumber, setMobileNumber] = useState("");
  const [activeChannel, setActiveChannel] = useState<"SMS" | "WHATSAPP">("SMS");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!authLoading && isAuthenticated && !needsPinSetup && step !== "PIN_SETUP") {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, needsPinSetup, step, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((step === "OTP" || (step === "FORGOT_PIN" && forgotOtpSent)) && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, forgotOtpSent, resendTimer]);

  // Progressive WebOTP auto-fill enhancement when supported by mobile browsers
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      (step !== "OTP" && !(step === "FORGOT_PIN" && forgotOtpSent)) ||
      !("OTPCredential" in window) ||
      !navigator.credentials?.get
    ) {
      return;
    }
    const ac = new AbortController();
    (navigator.credentials as any)
      .get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((cred: any) => {
        if (cred?.code && /^\d{6}$/.test(cred.code)) {
          setOtpCode(cred.code);
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, [step, forgotOtpSent]);

  const formatPhoneNumber = (val: string) => {
    const cleaned = val.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.length === 10) return "+91" + cleaned;
    return cleaned;
  };

  const handleRequestOtp = async (
    channel: "SMS" | "WHATSAPP" = "SMS",
    intent: OtpIntent = "SIGN_IN",
    e?: React.FormEvent,
    newDeviceNotice = false
  ) => {
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
      if (intent === "SIGN_IN" && step === "PHONE" && checkUser) {
        const precheck = await checkUser(formatted);
        if (!precheck.registered) {
          setError("This mobile number is not registered in Girvasa. Contact your society admin or register your society.");
          setIsLoading(false);
          return;
        }
      }
      const res = await requestOtp(formatted, channel, intent);
      const challengeReqId = res.requestId || (res as any).challengeId || null;
      if (challengeReqId) {
        setRequestId(challengeReqId);
      }
      if (intent === "PIN_RESET") {
        setStep("FORGOT_PIN");
        setForgotOtpSent(true);
      } else {
        setStep("OTP");
      }
      setResendTimer(typeof res.resendAfterSeconds === "number" && res.resendAfterSeconds >= 0 ? res.resendAfterSeconds : 60);
      setInfoMessage(
        newDeviceNotice
          ? `New browser detected — verify once via ${channel === "WHATSAPP" ? "WhatsApp" : "SMS"} OTP sent to ${formatted}.`
          : res.message ||
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

  const handleContinueWithPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formatted = formatPhoneNumber(mobileNumber);
    if (!formatted || formatted.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const check = checkUser
        ? await checkUser(formatted)
        : { registered: true, status: "ACTIVE", hasPinConfigured: false, deviceTrusted: false };
      if (!check.registered) {
        setError("This mobile number is not registered in Girvasa. Contact your society admin or register your society.");
        return;
      }
      if (check.hasPinConfigured && check.deviceTrusted) {
        setPin("");
        setStep("PIN");
        return;
      }
      setIsLoading(false);
      await handleRequestOtp("SMS", "SIGN_IN", undefined, check.hasPinConfigured === true && !check.deviceTrusted);
    } catch (err: any) {
      setError(err.detail || err.message || "Unable to verify mobile number status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{4}$/.test(pin.trim())) {
      setError("Please enter your 4-digit Login PIN");
      return;
    }
    setIsLoading(true);
    try {
      const formatted = formatPhoneNumber(mobileNumber);
      await loginWithPin?.(formatted, pin.trim());
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.detail || err?.message || "Invalid 4-digit PIN.";
      setError(msg);
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
      const res = await verifyOtp(formatted, trimmedOtp, requestId || undefined);
      if (res && res.needsPinSetup) {
        setNewPin("");
        setConfirmPin("");
        setStep("PIN_SETUP");
        return;
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.detail || err.message || "Invalid or expired OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialPinSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const pinErr = validatePinClient(newPin.trim());
    if (pinErr) {
      setError(pinErr);
      return;
    }
    if (newPin.trim() !== confirmPin.trim()) {
      setError("PINs do not match. Re-enter the same 4-digit PIN.");
      return;
    }
    setIsLoading(true);
    try {
      await setupPin?.(newPin.trim());
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to save Login PIN.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError("Enter the 6-digit OTP verification code");
      return;
    }
    const pinErr = validatePinClient(newPin.trim());
    if (pinErr) {
      setError(pinErr);
      return;
    }
    if (newPin.trim() !== confirmPin.trim()) {
      setError("New PIN and confirmation PIN do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const formatted = formatPhoneNumber(mobileNumber);
      await resetPinWithOtp?.(formatted, otpCode.trim(), newPin.trim());
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.detail || err.message || "Unable to reset PIN.");
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
              <GirvasaLogo size={34} variant="plated" className="rounded-lg" />
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

          {process.env.NEXT_PUBLIC_SUPPORT_PHONE && (
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Phone className="w-3.5 h-3.5 text-[#107A48]" />
              <span>Support:</span>
              <a
                className="font-semibold text-[#1E293B] hover:underline"
                href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE}`}
              >
                {process.env.NEXT_PUBLIC_SUPPORT_PHONE}
              </a>
            </div>
          )}
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
                  if (step === "PIN") setStep("PIN");
                  else if (requestId) setStep("OTP");
                }}
                disabled={!requestId && step !== "OTP" && step !== "PIN" && step !== "PIN_SETUP" && step !== "FORGOT_PIN"}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  step !== "PHONE" ? "bg-white text-[#1E293B] shadow-sm font-bold" : "text-[#64748B]"
                }`}
                type="button"
              >
                <span className={`w-2 h-2 rounded-full ${step !== "PHONE" ? "bg-[#107A48]" : "bg-slate-400"}`}></span>
                {step === "PIN"
                  ? "Step 2: 4-Digit PIN"
                  : step === "PIN_SETUP"
                    ? "Step 3: Set Login PIN"
                    : step === "FORGOT_PIN"
                      ? "Reset Login PIN"
                      : "Step 2: OTP Verification"}
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="relative z-10 mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {infoMessage && (step === "OTP" || (step === "FORGOT_PIN" && forgotOtpSent)) && !error && (
            <div className="relative z-10 mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
              {infoMessage}
            </div>
          )}

          {/* Step 1: Phone */}
          {step === "PHONE" && (
            <form onSubmit={handleContinueWithPhone} noValidate className="relative z-10 mt-6 flex flex-col gap-4">
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
                    Registered admins sign in with their 4-digit PIN on trusted browsers (1-time OTP on new devices).
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  disabled={isLoading}
                  className="flex-1 h-11 bg-[#107A48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#0D623A] transition-all disabled:opacity-60"
                  type="submit"
                >
                  <span>{isLoading ? "Checking..." : "Continue"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  disabled={isLoading}
                  type="button"
                  onClick={(e) => handleRequestOtp("WHATSAPP", "SIGN_IN", e)}
                  className="flex-1 h-11 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1EBE5D] transition-all disabled:opacity-60"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isLoading && activeChannel === "WHATSAPP" ? "Dispatching..." : "WhatsApp OTP"}</span>
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

          {/* Step 2A: Trusted Browser 4-Digit PIN */}
          {step === "PIN" && (
            <form onSubmit={handlePinLogin} className="relative z-10 mt-6 flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#107A48]" />
                  <div className="text-xs">
                    <span className="font-bold text-[#1E293B] block">Trusted Browser Recognized</span>
                    <span className="text-[#475569]">Signing in to +91 {mobileNumber.replace(/^\+91/, "")} without OTP</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("PHONE");
                    setError(null);
                  }}
                  className="text-xs font-semibold text-[#107A48] hover:underline"
                >
                  Change
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#1E293B]">
                    Enter Your 4-Digit Login PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin((s) => !s)}
                    className="text-[11px] font-semibold text-[#107A48] flex items-center gap-1"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPin ? "Hide PIN" : "Show PIN"}</span>
                  </button>
                </div>
                <Input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="• • • •"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="font-mono text-center tracking-[0.6em] text-xl font-bold"
                  autoFocus
                  required
                />
              </div>

              <button
                disabled={isLoading}
                className="w-full h-11 bg-[#107A48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#0D623A] transition-all disabled:opacity-60"
                type="submit"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isLoading ? "Signing In..." : "Sign In with PIN"}</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("FORGOT_PIN");
                    setForgotOtpSent(false);
                    setOtpCode("");
                    setNewPin("");
                    setConfirmPin("");
                    setError(null);
                  }}
                  className="font-semibold text-[#107A48] hover:underline"
                >
                  Forgot 4-digit PIN?
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRequestOtp("SMS", "SIGN_IN", e)}
                  className="font-semibold text-slate-600 hover:underline"
                >
                  Sign in with SMS OTP instead
                </button>
              </div>
            </form>
          )}

          {/* Step 2B: OTP */}
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
                  inputMode="numeric"
                  autoComplete="one-time-code"
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
                    onClick={() => handleRequestOtp("SMS", "SIGN_IN")}
                    className="font-semibold text-[#107A48] hover:underline disabled:opacity-40"
                  >
                    Resend via SMS
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={() => handleRequestOtp("WHATSAPP", "SIGN_IN")}
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
                <span>{isLoading ? "Verifying Token..." : "Authenticate & Continue"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 3: Mandatory First-Time 4-Digit PIN Setup */}
          {step === "PIN_SETUP" && (
            <form onSubmit={handleInitialPinSetup} className="relative z-10 mt-6 flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold block">Set Your 4-Digit Login PIN</span>
                Next time you sign in from this trusted browser, enter this 4-digit PIN instead of waiting for an SMS OTP.
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Create 4-Digit PIN
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="• • • •"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  className="font-mono text-center tracking-[0.6em] text-lg font-bold"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Confirm 4-Digit PIN
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="• • • •"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className="font-mono text-center tracking-[0.6em] text-lg font-bold"
                  required
                />
              </div>
              <button
                disabled={isLoading}
                className="w-full h-11 bg-[#107A48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#0D623A] transition-all disabled:opacity-60"
                type="submit"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isLoading ? "Saving PIN..." : "Save PIN & Open Society Console"}</span>
              </button>
            </form>
          )}

          {/* Step 4: Forgot 4-Digit PIN Recovery */}
          {step === "FORGOT_PIN" && (
            <form onSubmit={handleResetPinSubmit} className="relative z-10 mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1E293B]">Reset Forgotten 4-Digit PIN</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("PHONE");
                    setError(null);
                  }}
                  className="font-semibold text-[#107A48] hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Registered Mobile Number</label>
                <Input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={forgotOtpSent}
                  required
                />
              </div>
              {!forgotOtpSent ? (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRequestOtp("SMS", "PIN_RESET")}
                    className="flex-1 h-11 bg-[#107A48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#0D623A] transition-all disabled:opacity-60"
                  >
                    <span>Send SMS Verification Code</span>
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRequestOtp("WHATSAPP", "PIN_RESET")}
                    className="flex-1 h-11 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1EBE5D] transition-all disabled:opacity-60"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">6-Digit OTP</label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="font-mono text-center tracking-widest text-base font-bold"
                      required
                    />
                    <div className="flex items-center justify-between text-[11px] mt-1 text-[#64748B]">
                      <span>{resendTimer > 0 ? `Resend in 00:${resendTimer < 10 ? `0${resendTimer}` : resendTimer}s` : "Resend OTP:"}</span>
                      <div className="flex gap-3">
                        <button type="button" disabled={resendTimer > 0} onClick={() => handleRequestOtp("SMS", "PIN_RESET")} className="font-semibold text-[#107A48] disabled:opacity-40">Resend SMS</button>
                        <button type="button" disabled={resendTimer > 0} onClick={() => handleRequestOtp("WHATSAPP", "PIN_RESET")} className="font-semibold text-[#25D366] disabled:opacity-40">WhatsApp</button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">New 4-Digit PIN</label>
                      <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="• • • •"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                        className="font-mono text-center tracking-widest text-base font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">Confirm PIN</label>
                      <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="• • • •"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                        className="font-mono text-center tracking-widest text-base font-bold"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-[#107A48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#0D623A] transition-all disabled:opacity-60"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isLoading ? "Updating PIN..." : "Verify OTP & Reset PIN"}</span>
                  </button>
                </>
              )}
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
            <span>Society Management Console</span>
          </div>
          <span className="hidden md:inline">Maharashtra Co-operative Societies Act 1960 Aligned</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Girvasa Society OS</span>
          <span>•</span>
          <span>&copy; {new Date().getFullYear()} Girvasa Technologies</span>
        </div>
      </footer>
    </div>
  );
}
