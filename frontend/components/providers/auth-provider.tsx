"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldCheck } from "lucide-react";

const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      const isPublic = publicRoutes.includes(pathname);
      if (!isAuthenticated && !isPublic) {
        router.push("/login");
      } else if (isAuthenticated && isPublic) {
        router.push("/dashboard");
      } else if (isAuthenticated && pathname.startsWith("/admin") && user?.role !== "superadmin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <ShieldCheck className="w-8 h-8 text-emerald-400 absolute" />
        </div>
        <p className="text-emerald-400 font-mono text-sm tracking-widest animate-pulse">
          INITIALIZING SMART VAULTZ SECURITY...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
