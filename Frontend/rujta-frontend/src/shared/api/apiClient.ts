import axios from "axios";
import { getAccessToken, setAccessToken } from "../../authProvider/authTokenProvider";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

/* ================= REQUEST INTERCEPTOR ================= */
apiClient.interceptors.request.use(
  (request) => {
    const token = getAccessToken();

    if (token) {
      request.headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("🚀 Request:", request.url, request.headers);

    return request;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          "/api/auth/refresh-token",
          {},
          {
            withCredentials: true,
          }
        );

        const newAccessToken = refreshResponse.data?.accessToken;

        if (newAccessToken) {
          setAccessToken(newAccessToken);

          // تحديث التوكن في axios default headers
          apiClient.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;

          originalRequest.headers["Authorization"] =
            `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh token failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || { message: "Network error" });
  }
);

export default apiClient;