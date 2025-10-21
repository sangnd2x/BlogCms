import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios/apiClient";
import { UsersResponse } from "@/types/user.type";


export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClient.get<UsersResponse>("/users");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};