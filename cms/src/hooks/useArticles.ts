import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios/apiClient";
import { ArticlesResponse } from "@/types/article.type";

interface UseArticlesParams {
  page?: number;
  limit?: number;
}

export function useArticles(params: UseArticlesParams = {}) {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ["allArticles", page, limit],
    queryFn: () => apiClient.get<ArticlesResponse>(`/article?page=${page}&limit=${limit}`),
    placeholderData: previousData => previousData,
  });
}
