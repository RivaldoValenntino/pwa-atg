import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { User } from "../types/responses/login";

export type AuthStore = {
  token: string | null;
  user: User | null;
  isRehydrated: boolean;
  setToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  validateToken: () => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isRehydrated: false,
      setToken: (accessToken) => {
        set({ token: accessToken });
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        set({ token: null, user: null });
      },
      validateToken: () => {
        const token = get().token;
        if (!token) return false;
        try {
          const decoded = jwtDecode(token);
          return !!decoded;
        } catch (err) {
          return false;
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.set?.({ isRehydrated: true });
      },
    }
  )
);