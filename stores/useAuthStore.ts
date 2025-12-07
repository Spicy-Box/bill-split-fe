import api, { apiUrl } from "@/utils/api";
import { create } from "zustand";
import { ApiResponse } from "../../../ITS-Fe/src/interfaces/api";
import { UserLoginRepsonse } from "@/interfaces/api/user.api";
import { storeData } from "@/utils/asyncStorage";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const res = await api.post(`${apiUrl}/users/login`, {
        email,
        password,
      });

      const data: UserLoginRepsonse = res.data.data;

      const user = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
      };

      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      set({
        user,
        accessToken,
        refreshToken,
        isLoading: false,
        error: null,
      });

      await storeData("user", JSON.stringify(user));
      await storeData("accessToken", accessToken);
      await storeData("refreshToken", refreshToken);
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Something went wrong",
      });
      console.log(err);
    }
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
  },

  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) return null;

    try {
      const res = await api.post(`${apiUrl}/users/refresh`, {
        refresh_token: refreshToken,
      });

      const newAccessToken: string = res.data?.data?.access_token;

      set({ accessToken: newAccessToken });

      await storeData("accessToken", newAccessToken);

      return newAccessToken;
    } catch (err: any) {
      get().logout();
      return null;
    }
  },

  setUser: (user) => set({ user: user }),
}));
