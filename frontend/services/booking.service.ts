import apiClient from "@/lib/axios";
import { Booking, LockActionResponse } from "@/types";

export const bookingService = {
  async getMyBookings(): Promise<Booking[]> {
    const res = await apiClient.get<Booking[]>("/bookings/me");
    return res.data;
  },

  async bookVault(payload: { vaultId: string; paymentMethod: "wallet" | "upi" }): Promise<Booking> {
    const res = await apiClient.post<Booking>("/bookings", payload);
    return res.data;
  },

  async openVault(bookingId: string): Promise<LockActionResponse> {
    const res = await apiClient.post<LockActionResponse>(`/bookings/open/${bookingId}`);
    return res.data;
  },

  async closeVault(bookingId: string): Promise<LockActionResponse> {
    const res = await apiClient.post<LockActionResponse>(`/bookings/close/${bookingId}`);
    return res.data;
  },
};
