import apiClient from "@/lib/axios";
import { AdminStats } from "@/types";

export const adminService = {
  async getDashboardStats(): Promise<AdminStats> {
    const res = await apiClient.get<AdminStats>("/admin/dashboard");
    return res.data;
  },
};
