import { AxiosError } from "axios";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import { CheckAbsenLemburRequest } from "../types/requests/check-absen-lembur";
import { CheckAbsenLemburResponse } from "../types/responses/check-absen-lembur-response";
import { ErrorResponse } from "../types/responses/error";
import { AbsenLemburUploadRequest, absenLemburUploadSchema } from "../types/requests/absen-lembur-upload";
import { AbsenLemburUploadResponse } from "../types/responses/absen-lembur-upload-response";
import { RiwayatAbsenLemburResponse } from "../types/responses/riwayat-absen-lembur";
import { queryOptions } from "@tanstack/react-query";

export const postCheckAbsenLembur = async (data: CheckAbsenLemburRequest) => {
    const token = useAuthStore.getState().token;

    return await api
      .post<CheckAbsenLemburResponse>("/mobile-v2/absen-lembur/check", data, {
        headers: {
          token: `${token}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err: AxiosError<ErrorResponse>) => {
        throw new Error(err.response?.data.message);
      });
  };

  export const postUploadPhotoLembur = async (data: FormData) => { 
    const token = useAuthStore.getState().token;
  
    return await api.post("/mobile-v2/absen-lembur/upload-photo", data, {
      headers: {
        token: `${token}`,
      }
  }).then((res) => {
    return res.data;
  }).catch((err: AxiosError<ErrorResponse>) => {
    throw new Error(err.response?.data.message);
  });
  }
  
  export const postAbsenLemburUpload = async (data: AbsenLemburUploadRequest): Promise<AbsenLemburUploadResponse> => {
    const token = useAuthStore.getState().token;
  
    try {
      absenLemburUploadSchema.parse(data);
  
      const response = await api.post("/mobile-v2/absen-lembur/insert", data, {
        headers: {
          token: `${token}`,
          "Content-Type": "application/json", // Set the content type to JSON
        },
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      throw new Error(error.response?.data.message || "Absen upload failed");
    }
  };

  export const getRiwayatAbsenLembur = async (period: string): Promise<RiwayatAbsenLemburResponse> => {
    const token = useAuthStore.getState().token;
  
    const response = await api.get<RiwayatAbsenLemburResponse>("/mobile-v2/absen-lembur/list", {
      headers: {
        token: `${token}`,
      },
      params: {
        period,
      },
    });
  
    return response.data;
  };
  
  export const riwayatAbsenLemburQueryOptions = (period: string) =>
    queryOptions({
      queryKey: ["riwayatAbsenLembur", period], // Include period in queryKey to prevent caching issues
      queryFn: () => getRiwayatAbsenLembur(period), // Pass period correctly
      retry: false,
      staleTime: 60 * 60 * 1000,
    });
  