"use client";

import { useState } from "react";
import { Vault } from "@/types";
import { useWallet } from "@/hooks/useWallet";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { Lock, Wallet, CreditCard, X, CheckCircle2, AlertCircle } from "lucide-react";

interface BookingModalProps {
  vault: Vault | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ vault, isOpen, onClose, onSuccess }: BookingModalProps) {
  const { balance } = useWallet();
  const { bookVault, isBooking } = useBookings();
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "upi">("wallet");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !vault) return null;

  const handleConfirm = async () => {
    setError(null);
    if (paymentMethod === "wallet" && balance < vault.price) {
      setError("Insufficient wallet balance. Please top up your wallet or use UPI.");
      return;
    }

    try {
      await bookVault({ vaultId: vault._id, paymentMethod });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 border border-emerald-500/30 shadow-glow animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Book Vault Locker #{vault.lockerNo}</h3>
            <p className="text-xs text-gray-400">{vault.location || "Smart Vault Location"}</p>
          </div>
        </div>

        {/* Slot Summary */}
        <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800 space-y-2 mb-6">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Date Slot:</span>
            <span className="text-white font-mono">{vault.slotDate || "Today"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Time Slot:</span>
            <span className="text-emerald-400 font-mono font-medium">{vault.timeSlot || "Standard Slot"}</span>
          </div>
          <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs font-semibold text-white">Total Amount:</span>
            <span className="text-lg font-bold text-emerald-400">{formatCurrency(vault.price)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Select Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("wallet")}
              className={`p-3.5 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                paymentMethod === "wallet"
                  ? "bg-emerald-500/10 border-emerald-500 text-white shadow-glow"
                  : "bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Wallet className="w-4 h-4 text-emerald-400" />
                {paymentMethod === "wallet" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <span className="text-xs font-bold text-white mt-1">Smart Wallet</span>
              <span className="text-[10px] text-gray-400">Balance: {formatCurrency(balance)}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("upi")}
              className={`p-3.5 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                paymentMethod === "upi"
                  ? "bg-cyan-500/10 border-cyan-500 text-white shadow-cyanGlow"
                  : "bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                {paymentMethod === "upi" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <span className="text-xs font-bold text-white mt-1">Instant UPI</span>
              <span className="text-[10px] text-gray-400">Direct Pay</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={isBooking}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-sm shadow-glow hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isBooking ? (
            <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Confirm & Pay {formatCurrency(vault.price)}</span>
          )}
        </button>
      </div>
    </div>
  );
}
