"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import Link from "next/link";
import { ShieldAlert, Users, Cpu, Lock, ArrowUpRight, Plus } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: adminService.getDashboardStats,
  });

  return (
    <div className="space-y-8">
      {/* Superadmin Header */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-purple-500/30 shadow-glass relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>SUPERADMIN ACCESS CONSOLE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              System Administration Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Control locker inventory, set slot dates, monitor user reservations, and manage hardware attachments.
            </p>
          </div>

          <Link
            href="/admin/lockers"
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-glass self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Vault Lockers</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Registered Users */}
        <div className="glass-card rounded-2xl p-6 border border-purple-500/30 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-purple-400">USERS</span>
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Total Registered Users
          </span>
          <h2 className="text-3xl font-extrabold text-white font-mono mt-1">
            {isLoading ? "..." : stats?.totalUsers ?? 0}
          </h2>
          <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-800">
            Registered accounts on backend
          </p>
        </div>

        {/* Total Lockers */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-cyan-400">LOCKERS</span>
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Total Vault Lockers
          </span>
          <h2 className="text-3xl font-extrabold text-white font-mono mt-1">
            {isLoading ? "..." : stats?.totalVaults ?? 0}
          </h2>
          <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-800">
            Configured vault locker slots
          </p>
        </div>

        {/* Total Active Bookings */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 shadow-glow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-emerald-400">BOOKED</span>
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Active Locker Bookings
          </span>
          <h2 className="text-3xl font-extrabold text-white font-mono mt-1">
            {isLoading ? "..." : stats?.totalBookings ?? 0}
          </h2>
          <p className="text-xs text-emerald-400 mt-3 pt-2 border-t border-gray-800 font-medium">
            Lockers currently reserved by users
          </p>
        </div>
      </div>
    </div>
  );
}
