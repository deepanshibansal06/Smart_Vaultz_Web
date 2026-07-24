"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/user.service";
import { User, ShieldCheck, Lock, Save, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [location, setLocation] = useState(user?.location || "");

  const [mpin, setMpin] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSettingMpin, setIsSettingMpin] = useState(false);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [mpinMessage, setMpinMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setLocation(user.location || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProfileMessage(null);
    setIsUpdatingProfile(true);

    try {
      const updated = await userService.updateProfile({ name, phone, address, location });
      setUser(updated);
      setProfileMessage("Profile updated successfully!");
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSetMpin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMpinMessage(null);

    if (!/^\d{4}$/.test(mpin.trim())) {
      setError("MPIN must be exactly 4 digits.");
      return;
    }

    setIsSettingMpin(true);
    try {
      const res = await userService.setMpin(mpin.trim());
      if (user) {
        setUser({ ...user, mpinSet: true });
      }
      setMpinMessage("4-digit MPIN set successfully!");
      setMpin("");
      setTimeout(() => setMpinMessage(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || "Failed to set MPIN.");
    } finally {
      setIsSettingMpin(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-400" />
          <span>Profile & Security Settings</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your account credentials, contact address, and 4-digit unlock MPIN.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Details Form */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-gray-800 space-y-6">
          <h2 className="text-base font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Personal Information</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 bg-gray-900/40 border border-gray-800 rounded-xl text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Primary Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address..."
                className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">City / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mumbai, India"
                className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {profileMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{profileMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-xs shadow-glow hover:opacity-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isUpdatingProfile ? (
                <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* MPIN Security Card */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 space-y-6 h-fit">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Security MPIN</span>
            </h2>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                user?.mpinSet
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {user?.mpinSet ? "MPIN ACTIVE" : "NOT SET"}
            </span>
          </div>

          <p className="text-xs text-gray-400">
            Set a 4-digit MPIN to authorize opening your smart locker hardware doors.
          </p>

          <form onSubmit={handleSetMpin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                {user?.mpinSet ? "Change 4-Digit MPIN" : "Create 4-Digit MPIN"}
              </label>
              <input
                type="password"
                maxLength={4}
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-center text-xl font-mono text-white focus:border-emerald-500 focus:outline-none tracking-widest"
              />
            </div>

            {mpinMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{mpinMessage}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSettingMpin || mpin.length !== 4}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-xs shadow-glow hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSettingMpin ? (
                <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{user?.mpinSet ? "Update MPIN" : "Set MPIN Now"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
