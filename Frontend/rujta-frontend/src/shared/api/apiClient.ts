import axios from "axios";
export const apiClient = axios.create({
baseURL: "/api",
withCredentials: true,
});
apiClient.interceptors.request.use(request => {
console.log("Outgoing request headers:", request.headers);
return request;
});
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
failedQueue.forEach(prom => {
if (error) {
prom.reject(error);
} else {
prom.resolve(token);
}
});
failedQueue = [];
};
apiClient.interceptors.response.use(
response => response,
async error => {
const originalRequest = error.config;
if (error.response?.status === 401 && !originalRequest._retry) {
if (isRefreshing) {
return new Promise(function(resolve, reject) {
failedQueue.push({ resolve, reject });
})
.then(token => {
originalRequest.headers['Authorization'] = 'Bearer ' + token;
return apiClient(originalRequest);
})
.catch(err => {
return Promise.reject(err);
});
}
originalRequest._retry = true;
isRefreshing = true;
return new Promise(function (resolve, reject) {
axios.post("/api/auth/refresh-token", null, { withCredentials: true })
.then(({ data }) => {
apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
processQueue(null, data.accessToken);
resolve(apiClient(originalRequest));
})
.catch(err => {
processQueue(err, null);
reject(err);
})
.finally(() => {
isRefreshing = false;
});
});
}
const customError = error.response?.data || { message: "Network error" };
return Promise.reject(customError);
}
);
export default apiClient;