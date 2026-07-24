"use client";

import { useState } from "react";
import { useVaults } from "@/hooks/useVaults";
import { Vault } from "@/types";
import { formatCurrency } from "@/lib/utils";
import CreateVaultModal from "@/components/admin/create-vault-modal";
import { Cpu, Plus, Edit2, Trash2, MapPin, Clock, Lock, CheckCircle2 } from "lucide-react";

export default function AdminLockersPage() {
  const { vaults, isLoading, deleteVault, isDeleting } = useVaults(false);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (vault: Vault) => {
    setSelectedVault(vault);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedVault(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vault locker?")) return;
    setDeletingId(id);
    try {
      await deleteVault(id);
    } catch (err: unknown) {
      alert("Failed to delete vault locker.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-400" />
            <span>Vault Locker Inventory & Control</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Create new locker slots, adjust pricing/dates, or change availability status.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-glass self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Locker</span>
        </button>
      </div>

      {/* Lockers Table / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-48 animate-pulse bg-gray-900/50" />
          ))}
        </div>
      ) : vaults.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400 border border-gray-800">
          <Cpu className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Lockers Configured</h3>
          <p className="text-xs text-gray-400 mt-1">Click &quot;Add New Locker&quot; to create your first vault slot.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => {
            const isBooked = vault.status === "booked";
            const isLocker1 = (vault.lockerNo || "").toString().trim() === "1";

            return (
              <div
                key={vault._id}
                className="glass-card rounded-2xl p-6 border border-gray-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-purple-400 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        LOCKER #{vault.lockerNo}
                      </span>
                      {isLocker1 && (
                        <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          ESP Hardware
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isBooked
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {vault.status?.toUpperCase() || "AVAILABLE"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {vault.name || `Vault Locker ${vault.lockerNo}`}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{vault.location || "Smart Vault Hub"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {vault.slotDate || "N/A"} ({vault.timeSlot || "Standard"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold">
                      <span>Rate: {formatCurrency(vault.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => handleEdit(vault)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Edit Slot</span>
                  </button>

                  <button
                    onClick={() => handleDelete(vault._id)}
                    disabled={deletingId === vault._id}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all disabled:opacity-50"
                    title="Delete Vault Locker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CreateVaultModal
        vaultToEdit={selectedVault}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => setSelectedVault(null)}
      />
    </div>
  );
}
