"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import AddMoneyModal from "@/components/wallet/add-money-modal";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, CreditCard } from "lucide-react";

export default function WalletPage() {
  const { balance, isLoading } = useWallet();
  const { bookings } = useBookings();
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* Wallet Header Card */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-emerald-500/30 shadow-glow relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>ENCRYPTED VAULT PAYMENTS</span>
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Current Available Balance
            </span>
            <h1 className="text-4xl font-extrabold text-white font-mono mt-1">
              {isLoading ? "..." : formatCurrency(balance)}
            </h1>
            <p className="text-xs text-gray-400 mt-2">
              Used for instant seamless locker reservations without payment gateway delays.
            </p>
          </div>

          <button
            onClick={() => setShowAddMoneyModal(true)}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-sm shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Funds to Wallet</span>
          </button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Wallet & Booking Activity</span>
          </h2>
          <span className="text-xs text-gray-400 font-mono">Recent Transactions</span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            <p className="font-semibold text-white">No Recent Wallet Transactions</p>
            <p className="mt-1">Transactions will appear here when you book lockers or add funds.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {bookings.map((booking) => (
              <div key={booking._id} className="py-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">
                      Locker #{booking.vault?.lockerNo} Reservation
                    </p>
                    <p className="text-gray-400 text-[10px] font-mono mt-0.5">
                      {formatDateTime(booking.start)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-bold text-red-400">
                    -{formatCurrency(booking.vault?.price || 0)}
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    SUCCESSFUL
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
      />
    </div>
  );
}
