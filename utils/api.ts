import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

export const apiUrl = process.env.EXPO_PUBLIC_API_URL || "localhost:8080";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (request) => request,
  async (error) => {
    const { response, config } = error;
    const status = response?.status;

    if (status === 401 || status === 403) {
      const refreshAccessToken = useAuthStore.getState().refreshAccessToken;
      const newToken = await refreshAccessToken();

      if (!newToken) {
        return Promise.reject(error);
      }

      // Gắn token mới
      config.headers.Authorization = `Bearer ${newToken}`;

      // Gửi lại request cũ
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
