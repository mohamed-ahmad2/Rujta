let listeners = [];

export const subscribeTokenChange = (callback) => {
  listeners.push(callback);
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

export const setAccessToken = (token) => {
  localStorage.setItem("accessToken", token);
  // notify all subscribers
  listeners.forEach((cb) => cb(token));
};

export const removeAccessToken = () => {
  localStorage.removeItem("accessToken");
};