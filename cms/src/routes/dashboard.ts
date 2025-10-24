import { DashboardResponse } from "@/types/dashboard.type";
import { apiClient } from "@/lib/axios/apiClient";
import { ApiResponse } from "../types/apiResponse.type";

const getDashboardStats = async (): Promise<ApiResponse<DashboardResponse>> => {
  return apiClient.get("/dashboard");
};

export { getDashboardStats };
