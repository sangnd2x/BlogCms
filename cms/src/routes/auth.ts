import { apiClient } from "@/lib/axios/apiClient";
import { LoginResponse } from "@/types/auth.type";
import { ApiResponse } from "@/types/apiResponse.type";
import type { LoginFormData, RegisterFormData } from "@/lib/zod/authForm";

const login = async (data: LoginFormData): Promise<ApiResponse<LoginResponse>> => {
  return apiClient.post("/auth/login", data);
};

const register = async (data: Omit<RegisterFormData, "confirmPassword">): Promise<ApiResponse<LoginResponse>> => {
  return apiClient.post("/auth/register", data);
};

export { login, register };
