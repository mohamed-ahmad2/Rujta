import axios from "axios";
import { setAccessToken } from "../../authProvider/authTokenProvider";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

/* ================= REQUEST INTERCEPTOR ================= */
apiClient.interceptors.request.use(
  (request) => {
    console.log("Outgoing request headers:", request.headers);
    return request;
  },
  (error) => Promise.reject(error),
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
            headers: { "Content-Type": "application/json" },
          },
        );

        const newAccessToken = refreshResponse.data?.accessToken;

        if (newAccessToken) {
          setAccessToken(newAccessToken);

          apiClient.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;

          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || { message: "Network error" });
  },
);

export default apiClient;
