"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useWallet } from "@/hooks/useWallet";
import { Wallet, ShieldCheck, Lock, LogOut } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Header() {
  const { user, logout } = useAuthStore();
  const { balance } = useWallet();

  return (
    <header className="sticky top-0 z-20 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-gray-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Branding */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
          <Lock className="w-4 h-4" />
        </div>
        <span className="font-bold text-white text-base tracking-wider">
          SMART<span className="text-emerald-400">VAULTZ</span>
        </span>
      </div>

      {/* Security Status Badge */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>CYBER ENCRYPTION ACTIVE</span>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Wallet Balance Pill */}
        <Link
          href="/wallet"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-900/90 border border-emerald-500/30 text-white hover:border-emerald-500/60 transition-all text-xs font-medium shadow-glow"
        >
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>{formatCurrency(balance)}</span>
        </Link>

        {/* User Info & Quick Logout on Mobile */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-white">{user?.name}</p>
            <p className="text-[10px] text-emerald-400 font-mono uppercase">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors lg:hidden"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
