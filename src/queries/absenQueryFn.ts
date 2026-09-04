import { AxiosError } from "axios";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import { CheckAbsenRequest } from "../types/requests/check-absen";
import { CheckAbsenResponse } from "../types/responses/check-absen-response";
import { ErrorResponse } from "../types/responses/error";
import { AbsenUploadRequest, absenUploadSchema } from "../types/requests/absen-upload";
import { AbsenUploadResponse } from "../types/responses/absen-upload-response";

export const postCheckAbsen = async (data: CheckAbsenRequest) => {
  const token = useAuthStore.getState().token;

  return await api
    .post<CheckAbsenResponse>("/mobile-v2/absen-check", data, {
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

export const postUploadPhoto = async (data: FormData) => { 
  const token = useAuthStore.getState().token;

  return await api.post("/mobile-v2/upload-photo", data, {
    headers: {
      token: `${token}`,
    }
}).then((res) => {
  return res.data;
}).catch((err: AxiosError<ErrorResponse>) => {
  throw new Error(err.response?.data.message);
});
}

export const postAbsenUpload = async (data: AbsenUploadRequest): Promise<AbsenUploadResponse> => {
  const token = useAuthStore.getState().token;

  try {
    absenUploadSchema.parse(data);

    const response = await api.post("/mobile-v2/absen-upload", data, {
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

export const getRefKelainan = async (type: string) => {
  const token = useAuthStore.getState().token;

  try {
    const response = await api.get("/mobile-v2/ref-kelainan", {
      headers: {
        token: `${token}`,
      },
      params: {
        type,}
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    throw new Error(error.response?.data.message || "Failed to fetch ref kelainan");
  }
}