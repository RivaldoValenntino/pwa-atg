import { queryOptions } from "@tanstack/react-query";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";

export const getPengumuman = async () => {
    const token = useAuthStore.getState().token;
  
    const response = await api.get<PengumumanResponse>(
      "/mobile-v2/pengumuman",
      {
        headers: {
          token: `${token}`,
        },
      }
    );
    return response.data;
  };
  
  export const pengumumanQueryOptions = () =>
    queryOptions({
      queryKey: ["pengumuman"],
      queryFn: getPengumuman,
      retry: false,
      staleTime: 60 * 60 * 1000,
    });