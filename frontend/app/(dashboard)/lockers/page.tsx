"use client";

import { useState } from "react";
import { useVaults } from "@/hooks/useVaults";
import { Vault } from "@/types";
import { formatCurrency } from "@/lib/utils";
import BookingModal from "@/components/lockers/booking-modal";
import { Lock, Search, Filter, MapPin, Clock, Cpu, CheckCircle2 } from "lucide-react";

export default function LockersPage() {
  const [filterType, setFilterType] = useState<"all" | "available" | "booked">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { vaults, isLoading } = useVaults(filterType === "available");
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const filteredVaults = vaults.filter((vault) => {
    if (filterType === "booked" && vault.status !== "booked") return false;
    if (filterType === "available" && vault.status !== "available") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const lockerMatch = (vault.lockerNo || "").toLowerCase().includes(q);
      const locMatch = (vault.location || "").toLowerCase().includes(q);
      const nameMatch = (vault.name || "").toLowerCase().includes(q);
      return lockerMatch || locMatch || nameMatch;
    }
    return true;
  });

  const handleBook = (vault: Vault) => {
    setSelectedVault(vault);
    setShowBookingModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-400" />
            <span>Smart Vault Locations & Lockers</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Explore available smart lockers, check slot dates, and book instantly.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 self-start md:self-auto">
          {(["all", "available", "booked"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterType === type
                  ? "bg-emerald-500 text-gray-950 shadow-glow font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by locker number, location, or slot..."
          className="w-full pl-11 pr-4 py-3 bg-gray-900/80 border border-gray-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none transition-all"
        />
      </div>

      {/* Lockers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-48 animate-pulse bg-gray-900/50" />
          ))}
        </div>
      ) : filteredVaults.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400 border border-gray-800">
          <Lock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Lockers Found</h3>
          <p className="text-xs text-gray-400 mt-1">Try matching different search criteria or clear filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVaults.map((vault) => {
            const isAvailable = vault.status === "available";
            const hasHardware = (vault.lockerNo || "").toString().trim() === "1";

            return (
              <div
                key={vault._id}
                className={`glass-card rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                  isAvailable
                    ? "border-gray-800 hover:border-emerald-500/40"
                    : "border-amber-500/20 bg-amber-500/5"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        LOCKER #{vault.lockerNo}
                      </span>
                      {hasHardware && (
                        <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          ESP Hardware
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-white font-mono">{formatCurrency(vault.price)}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {vault.name || `Smart Vault Locker ${vault.lockerNo}`}
                  </h3>

                  <div className="space-y-2 text-xs text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{vault.location || "Smart Vault Hub"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {vault.slotDate} ({vault.timeSlot || "Full Day Access"})
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {isAvailable ? (
                    <button
                      onClick={() => handleBook(vault)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-xs shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Book Vault Locker</span>
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-xs text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Currently Booked</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        vault={selectedVault}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={() => setSelectedVault(null)}
      />
    </div>
  );
}
