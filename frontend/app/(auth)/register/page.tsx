"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient, setCustomApiUrl } from "@/lib/axios";
import { UserPlus, Mail, Key, User, ShieldCheck, CheckCircle2, AlertCircle, Settings, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, sendOtp, isRegistering, isSendingOtp } = useAuth();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setCustomUrl(apiClient.defaults.baseURL || "");
  }, []);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      const updated = setCustomApiUrl(customUrl);
      setCustomUrl(updated);
      setSavedNotice(true);
      setError(null);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  };

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const res = await sendOtp({ email, type: "signup" });
      setOtpNotice(res.message + (res.checkSpamNotice ? ` (${res.checkSpamNotice})` : ""));
      if (res.devOtp) {
        setDevCode(res.devOtp);
      }
      setOtp("");
      setStep("otp");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      if (!errorObj.response) {
        setError(`Cannot reach API server at [ ${apiClient.defaults.baseURL} ]. Click 'Backend Settings' below to set your Render URL.`);
      } else {
        setError(errorObj.response?.data?.message || "Failed to send OTP verification email.");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim()) {
      setError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    try {
      await register({ name, email, password, otp });
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || "Registration failed. Check OTP and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-emerald-500/20 shadow-glow relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 mx-auto flex items-center justify-center shadow-glow mb-4">
            <UserPlus className="w-8 h-8 text-gray-950 font-bold" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Join Smart <span className="text-emerald-400">Vaultz</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono uppercase tracking-wider">
            {step === "details" ? "Create your encrypted account" : "Enter Email OTP Code"}
          </p>
        </div>

        {step === "details" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Key className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-sm shadow-glow hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSendingOtp ? (
                <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Send OTP & Continue</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            {otpNotice && (
              <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{otpNotice}</span>
                </div>
                {devCode && (
                  <div className="mt-2 p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-center font-mono text-xs text-emerald-300 font-bold tracking-wider">
                    🔑 Backup Code: <span className="text-emerald-400 text-sm tracking-widest">{devCode}</span> (Type in box below)
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  6-Digit Verification OTP
                </label>
                <button
                  type="button"
                  onClick={() => handleRequestOtp()}
                  disabled={isSendingOtp}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  {isSendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-center text-xl font-mono tracking-widest text-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-1/3 py-3 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs hover:bg-gray-700 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isRegistering}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-xs shadow-glow hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Verify OTP & Create Account</span>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-400 mb-4">
            Already registered?{" "}
            <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign In Here
            </Link>
          </p>

          <button
            type="button"
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-emerald-400 transition-colors font-mono"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showApiSettings ? "Hide Backend Settings" : "Configure Live Render API URL"}</span>
          </button>

          {showApiSettings && (
            <form onSubmit={handleSaveApiUrl} className="mt-3 p-3 bg-gray-900/90 border border-gray-700/60 rounded-xl text-left space-y-2">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Backend API URL (Render / Server)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://smart-vault-backend.onrender.com/api"
                  className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-500 text-gray-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
              {savedNotice && (
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3" /> Live API URL updated & saved!
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
