"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useWallet } from "@/hooks/useWallet";
import { useBookings } from "@/hooks/useBookings";
import { useVaults } from "@/hooks/useVaults";
import { Vault } from "@/types";
import { formatCurrency } from "@/lib/utils";
import ActiveBookingCard from "@/components/dashboard/active-booking-card";
import BookingModal from "@/components/lockers/booking-modal";
import AddMoneyModal from "@/components/wallet/add-money-modal";
import {
  Wallet,
  Lock,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { balance } = useWallet();
  const { activeBooking, bookings, isLoading: isBookingsLoading } = useBookings();
  const { vaults, isLoading: isVaultsLoading } = useVaults(true);

  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);

  const handleBookClick = (vault: Vault) => {
    setSelectedVault(vault);
    setShowBookingModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-emerald-500/20 shadow-glow relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>SMART VAULTZ CORE TERMINAL</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{user?.name || "User"}</span> 👋
            </h1>
            <p className="text-xs lg:text-sm text-gray-400 mt-1 max-w-xl">
              Monitor active locker status, manage your secure digital wallet, and control hardware access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-gray-950 font-bold text-xs shadow-glow hover:bg-emerald-400 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Wallet Money</span>
            </button>
            <Link
              href="/lockers"
              className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white font-semibold text-xs hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Browse All Vaults</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 shadow-glow relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <Link href="/wallet" className="text-gray-400 hover:text-white transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Smart Wallet Balance
          </span>
          <h2 className="text-3xl font-extrabold text-white font-mono mt-1">
            {formatCurrency(balance)}
          </h2>
          <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Instant Booking Credit</span>
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="text-emerald-400 font-semibold hover:underline"
            >
              + Top Up
            </button>
          </div>
        </div>

        {/* Active Reservations Metric */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              LIVE
            </span>
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Active Vault Reservations
          </span>
          <h2 className="text-3xl font-extrabold text-white font-mono mt-1">
            {bookings.length}
          </h2>
          <div className="mt-4 pt-3 border-t border-gray-800/80 text-xs text-gray-400">
            {activeBooking ? (
              <span className="text-emerald-400 font-medium">Locker #{activeBooking.vault?.lockerNo} currently in use</span>
            ) : (
              <span>No active reservations running</span>
            )}
          </div>
        </div>

        {/* Security MPIN Status */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800 relative">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              user?.mpinSet
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}>
              {user?.mpinSet ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <Link href="/profile" className="text-xs text-emerald-400 font-semibold hover:underline">
              Manage MPIN
            </Link>
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            4-Digit Security MPIN
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            {user?.mpinSet ? "CONFIGURED & ACTIVE" : "NOT CONFIGURED"}
          </h2>
          <div className="mt-4 pt-3 border-t border-gray-800/80 text-xs text-gray-400">
            {user?.mpinSet ? (
              <span className="text-emerald-400">Requires MPIN prior to unlocking vault door</span>
            ) : (
              <span className="text-amber-400">Set MPIN in Profile to secure unlock actions</span>
            )}
          </div>
        </div>
      </div>

      {/* Active Booking Interactive Control Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>Active Locker Hardware Terminal</span>
          </h2>
          <Link href="/lockers" className="text-xs text-emerald-400 hover:underline font-mono">
            View All Lockers →
          </Link>
        </div>

        {isBookingsLoading ? (
          <div className="glass-card rounded-2xl p-8 text-center text-gray-400">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono">FETCHING ACTIVE LOCKER HARDWARE STATUS...</p>
          </div>
        ) : (
          <ActiveBookingCard booking={activeBooking} />
        )}
      </div>

      {/* Available Lockers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Available Vault Lockers</h2>
            <p className="text-xs text-gray-400">Reserve an available locker for immediate access</p>
          </div>
          <Link href="/lockers" className="text-xs text-emerald-400 font-semibold hover:underline">
            See All ({vaults.length})
          </Link>
        </div>

        {isVaultsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse h-40 bg-gray-900/50" />
            ))}
          </div>
        ) : vaults.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-gray-400">
            <p className="text-sm font-semibold text-white">All Lockers Currently Booked</p>
            <p className="text-xs text-gray-400 mt-1">Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vaults.slice(0, 3).map((vault) => (
              <div
                key={vault._id}
                className="glass-card rounded-2xl p-5 border border-gray-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                      LOCKER #{vault.lockerNo}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">{formatCurrency(vault.price)}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{vault.name || `Vault Locker ${vault.lockerNo}`}</h3>
                  
                  <div className="space-y-1 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      <span>{vault.location || "Smart Vault Hub"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{vault.slotDate} ({vault.timeSlot})</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBookClick(vault)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-xs shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Book This Vault</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        vault={selectedVault}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={() => setSelectedVault(null)}
      />

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
      />
    </div>
  );
}
