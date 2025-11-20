import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // يرسل cookies تلقائيًا
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // اعمل طلب refresh token
        await axios.post("/api/auth/refresh-token", null, { withCredentials: true });
        // بعد ما ينجح، حاول الطلب الأصلي تاني
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        return Promise.reject(refreshError);
      }
    }

    const customError = error.response?.data || { message: "Network error" };
    return Promise.reject(customError);
  }
);
