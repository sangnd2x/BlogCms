"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/axios/apiClient";
import type { LoginFormData, RegisterFormData } from "@/lib/zod/authForm";
import { ApiResponse } from "../types/apiResponse.type";
import { LoginResponse } from "@/types/auth.type";
import { login, register } from "@/routes/auth";
import { useAppDispatch } from "@/lib/redux/hooks";
import { clearCredentials, setCredentials } from "@/lib/redux/features/auth/authSlice";

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation<ApiResponse<LoginResponse>, ApiError, LoginFormData>({
    mutationFn: async (data: LoginFormData) => {
      return login(data);
    },
    onSuccess: data => {
      dispatch(
        setCredentials({
          user: data.data.user,
          access_token: data.data.access_token,
        })
      );
      router.push("/dashboard");
    },
    onError: error => {
      console.error("Login failed:", error);
    },
  });
}

export function userRegister() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation<ApiResponse<LoginResponse>, ApiError, RegisterFormData>({
    mutationFn: async (data: RegisterFormData) => {
      return register(data);
    },
    onSuccess: data => {
      dispatch(
        setCredentials({
          user: data.data.user,
          access_token: data.data.access_token,
        })
      );
      router.push("/dashboard");
    },
    onError: error => {
      console.error("Register failed:", error);
    },
  });
}

// Optional: Create a logout hook
export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async () => {
      // Optional: Call logout endpoint if you have one
      // await apiClient.post("/auth/logout");

      // Clear storage
      dispatch(clearCredentials());
    },
    onSuccess: () => {
      router.push("/login");
    },
  });
}
