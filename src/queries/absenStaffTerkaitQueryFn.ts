import { AxiosError } from "axios";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import { ErrorResponse } from "../types/responses/error";
import { queryOptions } from "@tanstack/react-query";

export const getAbsenStaffTerkait = async (start_date: string, end_date: string) => {
    const token = useAuthStore.getState().token;
  
    try {
      const response = await api.get("/mobile-v2/riwayat-absen-bawahan", {
        headers: {
          token: `${token}`,
        },
        params: {
            start_date,
            end_date
          },
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      throw new Error(error.response?.data.message || "Failed to fetch ref kelainan");
    }
  }

  export const absenStaffTerkaitQueryOptions = (start_date: string, end_date: string) =>
    queryOptions({
      queryKey: ["riwayatListIzin", start_date, end_date], 
      queryFn: () => getAbsenStaffTerkait(start_date, end_date),
      retry: false,
      staleTime: 60 * 60 * 1000,
    });