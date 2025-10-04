import { AxiosError, AxiosRequestConfig } from "axios";
import axiosInstance from "@/lib/axios/axiosInstance";

export interface ApiError {
  message: string;
  status: number;
  statusText?: string;
  data?: any;
}

class ApiClient {
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      return {
        message: error.message || "Server error occurred",
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      };
    } else {
      return {
        message: error.message || "An unexpected error occurred",
        status: 0,
        statusText: "Unknown Error",
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // POST request
  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // DELETE request
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // UPLOAD FILE request
  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = "file",
    onUploadProgress?: (progressEven: any) => void,
    additionalData?: Record<string, any>
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await axiosInstance.post<T>(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

export const apiClient = new ApiClient();
