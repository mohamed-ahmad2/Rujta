import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

//  Error Page فقط لمشاكل السيرفر
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Server error أو backend crashed
    if (!error.response || status >= 500) {
      if (window.location.pathname !== "/error") {
        window.location.replace("/error");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
