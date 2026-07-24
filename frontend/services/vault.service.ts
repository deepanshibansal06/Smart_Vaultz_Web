import apiClient from "@/lib/axios";
import { Vault } from "@/types";

export const vaultService = {
  async getVaults(availableOnly: boolean = false): Promise<Vault[]> {
    const res = await apiClient.get<Vault[]>(`/vaults${availableOnly ? "?available=true" : ""}`);
    return res.data;
  },

  async createVault(payload: { lockerNo?: string; location?: string; price: number; slotDate?: string; timeSlot?: string }): Promise<Vault> {
    const res = await apiClient.post<Vault>("/vaults", payload);
    return res.data;
  },

  async updateVault(id: string, payload: Partial<Vault>): Promise<Vault> {
    const res = await apiClient.put<Vault>(`/vaults/${id}`, payload);
    return res.data;
  },

  async deleteVault(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/vaults/${id}`);
    return res.data;
  },
};
