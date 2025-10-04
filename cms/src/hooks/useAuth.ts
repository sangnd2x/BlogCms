import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/axios/apiClient";
import type { LoginFormData } from "@/lib/validations/auth";
import { LoginResponse } from "@/types/auth.type";
import { login } from "@/routes/auth";
import { useAppDispatch } from "@/lib/redux/hooks";
import { clearCredentials, setCredentials } from "@/lib/redux/features/auth/authSlice";

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation<LoginResponse, ApiError, LoginFormData>({
    mutationFn: async (data: LoginFormData) => {
      return login(data);
    },
    onSuccess: data => {
      dispatch(
        setCredentials({
          user: data.user,
          access_token: data.access_token,
        })
      );
      router.push("/dashboard");
    },
    onError: error => {
      console.error("Login failed:", error);
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
