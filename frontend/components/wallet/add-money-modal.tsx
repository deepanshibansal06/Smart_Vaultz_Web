"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Wallet, Plus, X, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMoneyModal({ isOpen, onClose }: AddMoneyModalProps) {
  const { addMoney, isAdding } = useWallet();
  const [amount, setAmount] = useState<string>("500");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [100, 200, 500, 1000, 2000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    setError(null);
    try {
      const res = await addMoney(numAmount);
      setSuccessMsg(`Successfully added ${formatCurrency(numAmount)} to your wallet! New balance: ${formatCurrency(res.balance)}`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || "Failed to add wallet money");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm glass-panel rounded-2xl p-6 border border-emerald-500/30 shadow-glow animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Top Up Wallet</h3>
            <p className="text-xs text-gray-400">Add funds to your Smart Vault balance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              Enter Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-gray-900/90 border border-gray-700 rounded-xl text-white font-mono font-bold text-lg focus:border-emerald-500 focus:outline-none transition-all"
                placeholder="500"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <p className="text-[11px] text-gray-400 mb-2">Quick Presets:</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    amount === String(val)
                      ? "bg-emerald-500 text-gray-950 font-bold shadow-glow"
                      : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  +{formatCurrency(val)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isAdding}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-sm shadow-glow hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Money Now</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
