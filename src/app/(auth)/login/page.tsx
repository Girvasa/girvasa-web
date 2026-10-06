"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, KeyRound, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { requestOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const formatPhoneNumber = (val: string) => {
    // Keep numbers and +
    const cleaned = val.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.length === 10) return "+91" + cleaned;
    return cleaned;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formatted = formatPhoneNumber(mobileNumber);
    if (!formatted || formatted.length < 10) {
      setError("Please enter a valid mobile number (e.g., +919876543210)");
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestOtp(formatted);
      setMobileNumber(formatted);
      setStep("OTP");
      setInfoMessage(res.message || "OTP sent successfully to your mobile number.");
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to send OTP challenge.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(mobileNumber, otpCode.trim());
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.detail || err.message || "Invalid or expired OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/25 mb-4">
            G
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Girvasa Admin Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-tenant Society OS Administration Console</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {infoMessage && step === "OTP" && !error && (
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
              {infoMessage}
            </div>
          )}

          {step === "PHONE" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <Input
                  type="tel"
                  placeholder="+919876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  icon={<Phone className="w-4 h-4" />}
                  autoFocus
                  required
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Enter your registered society mobile number with country code.
                </p>
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">{mobileNumber}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("PHONE");
                    setError(null);
                  }}
                  className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  6-Digit OTP Code
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  icon={<KeyRound className="w-4 h-4" />}
                  className="font-mono text-center tracking-widest text-lg"
                  autoFocus
                  required
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Enter the code dispatched to your mobile phone.
                </p>
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                <span>Verify & Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Cryptographically Signed Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
