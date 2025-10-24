import axios, { AxiosError, AxiosResponse } from "axios";
import { store } from "@/lib/redux/store";
import { clearCredentials } from "@/lib/redux/features/auth/authSlice";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  config => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      store.dispatch(clearCredentials());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
