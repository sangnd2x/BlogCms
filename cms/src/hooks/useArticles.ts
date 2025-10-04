import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios/apiClient";
import { ArticlesResponse } from "@/types/article.type";

export function useArticles()  {
  return useQuery({
    queryKey: ['allArticles'],
    queryFn: () => apiClient.get<ArticlesResponse>('/article'),
  })
}