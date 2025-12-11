import axios from "axios";
import { router } from "expo-router";

export const apiUrl = process.env.EXPO_PUBLIC_API_URL || "localhost:8080";

// Lazy getter to avoid circular dependency
const getAuthStore = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/stores/useAuthStore").useAuthStore;
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthStore().getState().accessToken;

  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (request) => request,
  async (error) => {
    const { response, config } = error;
    const status = response?.status;

    console.log(status);
    const isAuthEndpoint = config?.url?.includes("/users/login");
    const isRefreshEndpoint = config?.url?.includes("/users/refresh");
    const alreadyRetried = (config as typeof config & { _retry?: boolean })?._retry;

    if (
      (status === 401 || status === 403) &&
      !isAuthEndpoint &&
      !isRefreshEndpoint &&
      !alreadyRetried
    ) {
      const authStore = getAuthStore();
      const refreshAccessToken = authStore.getState().refreshAccessToken;

      const newToken = await refreshAccessToken();

      console.log("Print new Token in api.ts", newToken);

      if (!newToken) {
        const logout = authStore.getState().logout;
        logout();
        router.replace("/auth/login");
        return Promise.reject(error);
      }

      // Gắn token mới
      config.headers.Authorization = `Bearer ${newToken}`;
      // Tránh lặp vô hạn khi token refresh cũng hết hạn
      (config as typeof config & { _retry?: boolean })._retry = true;

      // Gửi lại request cũ
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
