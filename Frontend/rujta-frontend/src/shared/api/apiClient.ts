import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

apiClient.interceptors.request.use(request => {
  console.log("Outgoing request headers:", request.headers);
  return request;
});

apiClient.interceptors.response.use(
  
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post("/api/auth/refresh-token", null, { withCredentials: true });
        const newAccessToken = refreshResponse.data?.accessToken;

        if (newAccessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        return Promise.reject(refreshError);
      }
    }

    const customError = error.response?.data || { message: "Network error" };
    return Promise.reject(customError);

    console.log("Outgoing request headers:", request.headers);
  }
);


export default apiClient;