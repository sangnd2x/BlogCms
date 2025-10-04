import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios/apiClient";
import { DashboardResponse } from "@/types/dashboard.type";
import { getDashboardStats } from "@/routes/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });
}
