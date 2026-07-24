import apiClient from "@/lib/axios";
import { MpinVerifyResponse, User, WalletResponse } from "@/types";

export const userService = {
  async getMe(): Promise<User> {
    const res = await apiClient.get<User>("/users/me");
    return res.data;
  },

  async updateProfile(payload: { name?: string; phone?: string; address?: string; location?: string }): Promise<User> {
    const res = await apiClient.put<User>("/users/me", payload);
    return res.data;
  },

  async setMpin(pin: string): Promise<{ message: string; mpinSet: boolean }> {
    const res = await apiClient.post<{ message: string; mpinSet: boolean }>("/users/me/mpin", { pin });
    return res.data;
  },

  async verifyMpin(pin: string): Promise<MpinVerifyResponse> {
    const res = await apiClient.post<MpinVerifyResponse>("/users/me/mpin/verify", { pin });
    return res.data;
  },

  async getWalletBalance(): Promise<WalletResponse> {
    const res = await apiClient.get<WalletResponse>("/users/me/wallet");
    return res.data;
  },

  async addWalletMoney(amount: number): Promise<WalletResponse> {
    const res = await apiClient.post<WalletResponse>("/users/me/wallet/add", { amount });
    return res.data;
  },
};
