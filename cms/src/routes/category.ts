import { apiClient } from "@/lib/axios/apiClient";
import { ApiResponse } from "@/types/apiResponse.type";
import { Category } from "../types/category.type";
import { CategoryFormData } from "../lib/zod/categoryForm";

const createCategory = async (data: CategoryFormData): Promise<ApiResponse<Category>> => {
  return await apiClient.post("/categories", data);
};

const updateCategory = async (id: string, data: CategoryFormData): Promise<ApiResponse<Category>> => {
  return await apiClient.patch(`/categories/${id}`, data);
};

const deleteCategory = async (id: string): Promise<ApiResponse<Category>> => {
  return await apiClient.delete(`/categories/${id}`);
};

const getCategories = async (params: any): Promise<ApiResponse<Category[]>> => {
  return await apiClient.get(`/categories?${params.toString()}`);
};

const getCategory = async (id: string): Promise<ApiResponse<Category>> => {
  return await apiClient.get(`/categories/admin/${id}`);
};

export { createCategory, deleteCategory, getCategories, updateCategory, getCategory };
