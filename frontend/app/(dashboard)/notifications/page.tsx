"use client";

import { useBookings } from "@/hooks/useBookings";
import { formatDateTime } from "@/lib/utils";
import { Bell, ShieldCheck, Clock, Cpu, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
  const { bookings, activeBooking } = useBookings();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-400" />
          <span>Security & System Notifications</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Real-time security logs, slot time reminders, and hardware door events.
        </p>
      </div>

      <div className="space-y-4">
        {/* System Active Banner */}
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Smart Vault Guardian Active</h3>
            <p className="text-xs text-gray-400">
              Automated 20-second email notification jobs are active for slot reminders and expiration.
            </p>
          </div>
        </div>

        {/* Dynamic Booking Notifications */}
        {bookings.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-gray-400 border border-gray-800">
            <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No Security Notifications</p>
            <p className="text-xs text-gray-400 mt-1">
              Alerts regarding your reservations and door status will appear here.
            </p>
          </div>
        ) : (
          bookings.map((b) => (
            <div
              key={b._id}
              className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">
                      Locker #{b.vault?.lockerNo} Reservation Active
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Slot Time: {b.vault?.slotDate} ({b.vault?.timeSlot})
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono mt-1">
                    Started: {formatDateTime(b.start)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Expires: {formatDateTime(b.end)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
