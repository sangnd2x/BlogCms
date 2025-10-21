import { useQuery } from "@tanstack/react-query";
import { getBlogs } from "@/routes/blog";
import { BlogsParams } from "@/types/blog.type";

export function useBlogs(params: BlogsParams = {}) {
  const queryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    sort_by: params.sort_by ?? "created_on",
    sort_order: params.sort_order ?? "DESC",
    title: params.title,
    status: params.status,
    author_id: params.author_id,
    author: params.author,
    category: params.category,
    tags: params.tags,
    published_at: params.published_at,
    search: params.search,
  };

  return useQuery({
    queryKey: ["allBlogs", queryParams],
    queryFn: () => {
      // Build query params
      const searchParams = new URLSearchParams();

      // Add each param only if it has a value
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      return getBlogs(searchParams);
    },
    staleTime: 1000,
    placeholderData: previousData => previousData,
  });
}
