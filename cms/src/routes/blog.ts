import { apiClient } from "@/lib/axios/apiClient";
import { Blog } from "@/types/blog.type";
import { BlogFormData } from "@/lib/zod/blogForm";
import { ApiResponse } from "@/types/apiResponse.type";

const createBlog = async (data: BlogFormData): Promise<ApiResponse<Blog>> => {
  return await apiClient.post("/blogs", data);
};

const updateBlog = async (id: string, data: BlogFormData): Promise<ApiResponse<Blog>> => {
  return await apiClient.patch(`/blogs/${id}`, data);
};

const deleteBlog = async (id: string): Promise<ApiResponse<Blog>> => {
  return await apiClient.delete(`/blogs/${id}`);
};

const getBlogs = async (params: any): Promise<ApiResponse<Blog[]>> => {
  return await apiClient.get(`/blogs?${params.toString()}`);
};

const getBlog = async (id: string): Promise<ApiResponse<Blog>> => {
  return await apiClient.get(`/blogs/admin/${id}`);
};

export { createBlog, deleteBlog, getBlogs, updateBlog, getBlog };
