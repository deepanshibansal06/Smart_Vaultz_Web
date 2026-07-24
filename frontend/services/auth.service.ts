import apiClient from "@/lib/axios";
import { AuthResponse, OtpResponse, User } from "@/types";

export const authService = {
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", payload);
    return res.data;
  },

  async register(payload: { name: string; email: string; password: string; otp?: string }): Promise<User> {
    const res = await apiClient.post<User>("/auth/register", payload);
    return res.data;
  },

  async sendOtp(payload: { email: string; type: "signup" | "forgot" }): Promise<OtpResponse> {
    const res = await apiClient.post<OtpResponse>("/auth/send-otp", payload);
    return res.data;
  },

  async resetPassword(payload: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>("/auth/reset-password", payload);
    return res.data;
  },
};
