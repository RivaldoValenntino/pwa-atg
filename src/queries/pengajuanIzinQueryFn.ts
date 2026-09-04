import { AxiosError } from "axios";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import { ErrorResponse } from "../types/responses/error";
import { queryOptions } from "@tanstack/react-query";
import { PengajuanIzinInsertRequest, pengajuanIzinInsertSchema } from "../types/requests/pengajuan-izin";

export const getListIzin = async (period: string) => {
    const token = useAuthStore.getState().token;
  
    try {
      const response = await api.get("/mobile-v2/izin/list", {
        headers: {
          token: `${token}`,
        },
        params: {
            period,
          },
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      throw new Error(error.response?.data.message || "Failed to fetch ref kelainan");
    }
  }

  export const riwayatListIzinQueryOptions = (period: string) =>
    queryOptions({
      queryKey: ["riwayatListIzin", period], 
      queryFn: () => getListIzin(period),
      retry: false,
      staleTime: 60 * 60 * 1000,
    });
  

export const postPengajuanInsert = async (data: PengajuanIzinInsertRequest) => {
    const token = useAuthStore.getState().token;

    try{
        pengajuanIzinInsertSchema.parse(data);

        const response = await api.post("/mobile-v2/izin/insert", data, {
            headers: {
                token: `${token}`,
                "Content-Type": "application/json", // Set the content type to JSON
            },
        });
        return response.data;
    } catch (err) {
        const error = err as AxiosError<ErrorResponse>;
        throw new Error(error.response?.data.message || "Failed to fetch ref kelainan");
    }
}

export const fetchCutiQuota = async (): Promise<KuotaCutiResponse> => {
    const token = useAuthStore.getState().token;
  
    const response = await api.get<KuotaCutiResponse>(
      "https://devcharisma.aurorasystem.co.id/tirta-kahuripan/kepegawaian-api/mobile-v2/izin/get-kuota-cuti",
      {
        headers: {
          token: `${token}`,
        },
      }
    );
  
    return response.data;
  };

  export const deletePengajuanIzin = async (id: string) => {
    const token = useAuthStore.getState().token;

    try {
        const response = await api.post(
            `/mobile-v2/izin/delete`, 
            { id }, // Send id as request body
            {
                headers: {
                    token: `${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (err) {
        const error = err as AxiosError<ErrorResponse>;
        throw new Error(error.response?.data.message || "Failed to delete izin");
    }
};
