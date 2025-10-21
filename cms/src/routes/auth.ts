import { apiClient } from "@/lib/axios/apiClient";
import { LoginResponse } from "@/types/auth.type";
import type { LoginFormData } from "@/lib/zod/authForm";

const login = async (data: LoginFormData): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>("/auth/login", data);
};

export { login };
