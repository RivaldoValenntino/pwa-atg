import { queryOptions } from "@tanstack/react-query";
import api from "../lib/api";
import { AbsenInfoRespon } from "../types/responses/absent-information";
import { useAuthStore } from "../store/auth-store";
import { RiwayatAbsenResponse } from "../types/responses/riwayat-absen";

export const getAbsenInfo = async () => {
  const token = useAuthStore.getState().token;

  const response = await api.get<AbsenInfoRespon>(
    "/mobile-v2/absent-information",
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return response.data;
};

export const absenInfoQueryOptions = () =>
  queryOptions({
    queryKey: ["absenInfo"],
    queryFn: getAbsenInfo,
    retry: false,
    staleTime: 60 * 60 * 1000,
  });

  export const getRiwayatAbsen = async (period: string): Promise<RiwayatAbsenResponse> => {
    const token = useAuthStore.getState().token;
  
    const response = await api.get<RiwayatAbsenResponse>("/mobile-v2/riwayat-absen", {
      headers: {
        token: `${token}`,
      },
      params: {
        period,
      },
    });
  
    return response.data;
  };
  
  export const riwayatAbsenQueryOptions = (period: string) =>
    queryOptions({
      queryKey: ["riwayatAbsen", period], // Include period in queryKey to prevent caching issues
      queryFn: () => getRiwayatAbsen(period), // Pass period correctly
      retry: false,
      staleTime: 60 * 60 * 1000,
    });
  