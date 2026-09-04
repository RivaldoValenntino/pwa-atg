import { queryOptions } from "@tanstack/react-query";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";

export const getInformasiDataDiri = async () => {
    const token = useAuthStore.getState().token;
  
    const response = await api.get<InformasiDataDiriResponse>(
      "/mobile-v2/pegawai-data",
      {
        headers: {
          token: `${token}`,
        },
      }
    );
    return response.data;
  };
  
  export const informasiDataDiriQueryOptions = () =>
    queryOptions({
      queryKey: ["informasiDataDiri"],
      queryFn: getInformasiDataDiri,
      retry: false,
      staleTime: 60 * 60 * 1000,
    });