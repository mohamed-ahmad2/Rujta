import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = error.response?.data || { message: "Network error" };
    return Promise.reject(customError);
  }
);
