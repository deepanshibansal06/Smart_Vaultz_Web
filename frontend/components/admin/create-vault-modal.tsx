"use client";

import { useState, useEffect } from "react";
import { Vault } from "@/types";
import { useVaults } from "@/hooks/useVaults";
import { Lock, Cpu, X, Plus, Save, AlertCircle } from "lucide-react";

interface CreateVaultModalProps {
  vaultToEdit?: Vault | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateVaultModal({
  vaultToEdit,
  isOpen,
  onClose,
  onSuccess,
}: CreateVaultModalProps) {
  const { createVault, updateVault, isCreating, isUpdating } = useVaults();
  const [lockerNo, setLockerNo] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("100");
  const [slotDate, setSlotDate] = useState("2026-08-01");
  const [timeSlot, setTimeSlot] = useState("9:00 AM - 6:00 PM");
  const [status, setStatus] = useState<"available" | "booked">("available");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vaultToEdit) {
      setLockerNo(vaultToEdit.lockerNo || "");
      setLocation(vaultToEdit.location || "");
      setPrice(String(vaultToEdit.price || 100));
      setSlotDate(vaultToEdit.slotDate || "");
      setTimeSlot(vaultToEdit.timeSlot || "");
      setStatus(vaultToEdit.status || "available");
    } else {
      setLockerNo("");
      setLocation("Building A - Level 1");
      setPrice("100");
      setSlotDate(new Date().toISOString().split("T")[0]);
      setTimeSlot("9:00 AM - 6:00 PM");
      setStatus("available");
    }
  }, [vaultToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice < 0) {
      setError("Please enter a valid price");
      return;
    }

    try {
      if (vaultToEdit) {
        await updateVault({
          id: vaultToEdit._id,
          payload: {
            lockerNo,
            location,
            price: numPrice,
            slotDate,
            timeSlot,
            status,
          },
        });
      } else {
        await createVault({
          lockerNo,
          location,
          price: numPrice,
          slotDate,
          timeSlot,
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || "Failed to save vault details");
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 border border-purple-500/30 shadow-glass animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {vaultToEdit ? `Edit Vault Locker #${vaultToEdit.lockerNo}` : "Create New Vault Locker"}
            </h3>
            <p className="text-xs text-gray-400">Manage locker slot date, location, and pricing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Locker Number / ID</label>
            <input
              type="text"
              value={lockerNo}
              onChange={(e) => setLockerNo(e.target.value)}
              placeholder="e.g. 1 (Set to 1 for ESP Hardware attachment)"
              className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
            />
            <p className="text-[10px] text-purple-400 mt-1">
              Note: Locker #1 is automatically linked to physical ESP8266 hardware.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Location Name</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Gate Vault Hub"
              className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Slot Date</label>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Time Slot</label>
            <input
              type="text"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="e.g. 9:00 AM - 6:00 PM"
              className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          {vaultToEdit && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Status Override</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "available" | "booked")}
                className="w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="available">Available (Free Slot & Clear Bookings)</option>
                <option value="booked">Booked</option>
              </select>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm shadow-glass hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : vaultToEdit ? (
              <>
                <Save className="w-4 h-4" />
                <span>Save Vault Changes</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create Vault Locker</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
