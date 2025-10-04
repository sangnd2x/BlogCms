import { DashboardResponse } from "@/types/dashboard.type";
import { apiClient } from "@/lib/axios/apiClient";

const getDashboardStats = async (): Promise<DashboardResponse> => {
  return apiClient.get<DashboardResponse>("/dashboard");
};

export { getDashboardStats };
