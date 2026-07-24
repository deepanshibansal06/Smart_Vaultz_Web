"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Lock,
  Wallet,
  User,
  Bell,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const userNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Lockers", href: "/lockers", icon: Lock },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Profile & MPIN", href: "/profile", icon: User },
  ];

  const adminNav = [
    { name: "Admin Dashboard", href: "/admin/dashboard", icon: ShieldAlert },
    { name: "Manage Lockers", href: "/admin/lockers", icon: Cpu },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-800 bg-[#0D1322] min-h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-glow">
          <Lock className="w-5 h-5 text-gray-950 font-bold" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wider flex items-center gap-1">
            SMART<span className="text-emerald-400">VAULTZ</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
            Cyber Security Storage
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-3">
            Main Portal
          </p>
          <nav className="space-y-1">
            {userNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-glow"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-gray-400 group-hover:text-white")} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-emerald-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Superadmin Menu */}
        {user?.role === "superadmin" && (
          <div>
            <p className="px-3 text-[11px] font-mono text-purple-400 uppercase tracking-widest mb-3">
              Administrator Controls
            </p>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                      isActive
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-4 h-4", isActive ? "text-purple-400" : "text-gray-400 group-hover:text-white")} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-purple-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/60 border border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30 flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
