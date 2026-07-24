"use client";

import { useState } from "react";
import { Booking } from "@/types";
import { useBookings } from "@/hooks/useBookings";
import { useAuthStore } from "@/store/useAuthStore";
import { Lock, Unlock, Cpu, ShieldCheck, Clock, MapPin, AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import MpinModal from "@/components/lockers/mpin-modal";

interface ActiveBookingCardProps {
  booking: Booking | null;
}

export default function ActiveBookingCard({ booking }: ActiveBookingCardProps) {
  const { user } = useAuthStore();
  const { openVault, closeVault, isOpenPending, isClosePending } = useBookings();
  const [showMpinModal, setShowMpinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"open" | "close" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!booking || !booking.vault) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-gray-800 flex flex-col items-center justify-center text-center py-10">
        <div className="w-14 h-14 rounded-full bg-gray-800/80 text-gray-500 flex items-center justify-center mb-3">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white">No Active Vault Booking</h3>
        <p className="text-xs text-gray-400 max-w-sm mt-1 mb-4">
          You currently have no active locker reservations. Reserve a locker to secure your valuables.
        </p>
      </div>
    );
  }

  const vault = booking.vault;
  const isOpen = booking.lockStatus === "open";
  const hasHardware = (vault.lockerNo || "").toString().trim() === "1";

  const triggerAction = async (action: "open" | "close") => {
    if (action === "open" && user?.mpinSet) {
      setPendingAction(action);
      setShowMpinModal(true);
    } else {
      executeLockAction(action);
    }
  };

  const executeLockAction = async (action: "open" | "close") => {
    try {
      if (action === "open") {
        const res = await openVault(booking._id);
        setToastMessage(res.hasHardware ? "Vault door unlocked on physical ESP hardware" : "Vault door unlocked (Virtual)");
      } else {
        const res = await closeVault(booking._id);
        setToastMessage(res.hasHardware ? "Vault door locked on physical ESP hardware" : "Vault door locked");
      }
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setToastMessage(errorObj.response?.data?.message || "Failed to update vault door state");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleMpinVerified = () => {
    setShowMpinModal(false);
    if (pendingAction) {
      executeLockAction(pendingAction);
      setPendingAction(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 shadow-glow relative overflow-hidden">
      {/* Background Subtle Glow Accent */}
      <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl transition-all ${
        isOpen ? "bg-cyan-500/20" : "bg-emerald-500/20"
      }`} />

      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold">
            LOCKER #{vault.lockerNo}
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300">
            {vault.location || "Smart Vault Location"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hardware Connection Badge */}
          {hasHardware ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              ESP Hardware Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">
              Virtual Lock Mode
            </span>
          )}
        </div>
      </div>

      {/* Main Lock Control Visualizer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-950/60 rounded-xl p-6 border border-gray-800/80 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
            isOpen
              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-cyanGlow"
              : "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow"
          }`}>
            {isOpen ? <Unlock className="w-8 h-8 animate-bounce" /> : <Lock className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-400">Door Status:</span>
              <span className={`text-base font-bold font-mono uppercase tracking-wider ${
                isOpen ? "text-cyan-400" : "text-emerald-400"
              }`}>
                {isOpen ? "UNLOCKED (OPEN)" : "SECURED (CLOSED)"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {isOpen
                ? "Vault door is unlocked. Store or retrieve items safely."
                : "Vault is fully locked and encrypted."}
            </p>
          </div>
        </div>

        {/* Lock / Unlock Toggle Button */}
        <div className="w-full md:w-auto flex justify-center">
          {isOpen ? (
            <button
              onClick={() => triggerAction("close")}
              disabled={isClosePending}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-gray-950 font-bold text-sm shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isClosePending ? (
                <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Lock Vault Door</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => triggerAction("open")}
              disabled={isOpenPending}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 font-bold text-sm shadow-cyanGlow hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isOpenPending ? (
                <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Vault Door</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Booking Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-900/60 border border-gray-800">
          <Clock className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-gray-400 block text-[10px]">Slot Time Period</span>
            <span className="font-mono text-white font-semibold">
              {vault.slotDate} ({vault.timeSlot})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-900/60 border border-gray-800">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-gray-400 block text-[10px]">Booking Period</span>
            <span className="font-mono text-white font-semibold">
              {formatDateTime(booking.start)} - {formatDateTime(booking.end)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Toast Alert */}
      {toastMessage && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MPIN Verification Dialog */}
      <MpinModal
        isOpen={showMpinModal}
        onClose={() => setShowMpinModal(false)}
        onSuccess={handleMpinVerified}
        title="Security Unlock Verification"
        description={`Enter MPIN to unlock Vault Locker #${vault.lockerNo}`}
      />
    </div>
  );
}
