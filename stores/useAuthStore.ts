import api, { apiUrl } from "@/utils/api";
import { create } from "zustand";
import { UserLoginRepsonse } from "@/interfaces/api/user.api";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  hasHydrated: boolean

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  setUser: (user: User | null) => void;
  setHasHydrated: (value: boolean) => void;
  updateUser: (fields: Partial<User>) => void;
}

// const zustandStorage: StateStorage = {
//   setItem: async (name: string, value: string) => {
//     try {
//       await storeData(name, value);
//     } catch (error) {
//       console.error('Error in zustandStorage.setItem:', error);
//       // Don't throw - let Zustand handle it gracefully
//     }
//   },
//   getItem: async (name: string) => {
//     try {
//       const value = await getData(name);
//       return value ?? null;
//     } catch (error) {
//       console.error('Error in zustandStorage.getItem:', error);
//       return null;
//     }
//   },
//   removeItem: async (name: string) => {
//     try {
//       await removeData(name);
//     } catch (error) {
//       console.error('Error in zustandStorage.removeItem:', error);
//     }
//   },
// };

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      hasHydrated: false,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

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

          set({
            user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isLoading: false,
            error: null,
          });
          // Không cần storeData nữa, persist tự động lưu
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

        console.log("Print refreshToken in useAuthStore", refreshToken);
        
        if (!refreshToken) return null;

        try {
          const res = await api.post(`${apiUrl}/users/refresh`, null, {
            params: {refresh_token: refreshToken}
          });

          const newAccessToken: string = res.data?.data?.access_token;
          set({ accessToken: newAccessToken });

          console.log("new access token", newAccessToken)

          return newAccessToken;
        } catch {
          get().logout();
          return null;
        }
      },

      setUser: (user) => set({ user }),
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
      updateUser: (fields) => {
        const currentUser = get().user;
        
        if (!currentUser) {
          console.warn("Cannot update user: user is null");
          return;
        }

        set({
          user: {
            ...currentUser,
            ...fields,
          },
        });
      },
    }),
    {
      name: "auth-storage", 
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),

      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("❌ Hydration failed:", error);
          } else {
            console.log("✅ Hydration complete");
          }
          useAuthStore.getState().setHasHydrated(true);
        };
      },
    }
  )
);