import { CategoriesResponse } from "@/types/category.type";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios/apiClient";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get<CategoriesResponse>("/categories");

      return response.data.map(category => ({
        label: category.name,
        value: category.id,
        color: category.color,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};
