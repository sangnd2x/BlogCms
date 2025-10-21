import { apiClient } from "@/lib/axios/apiClient";
import { ApiResponse } from "@/types/apiResponse.type";

export interface UploadImageResponse {
  message: string;
  url: string;
  filename: string;
  size: number;
}

export const uploadImage = {
  uploadImage: async (
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadImageResponse>> => {
    return apiClient.uploadFile("/media/upload-image", file, "file", progressEvent => {
      if (progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress?.(progress);
      }
    });
  },
};
