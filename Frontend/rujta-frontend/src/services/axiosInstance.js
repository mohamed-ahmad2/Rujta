import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // ❗ Server errors only
    if (!error.response || status >= 500) {
      if (window.location.pathname !== "/error") {
        window.location.href = "/error";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
