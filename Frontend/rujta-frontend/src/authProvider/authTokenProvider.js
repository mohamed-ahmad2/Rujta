let listeners = [];

export const subscribeTokenChange = (callback) => {
  listeners.push(callback);

  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

export const setAccessToken = (token) => {
  localStorage.setItem("accessToken", token);
  listeners.forEach((cb) => cb(token));
};

// ⭐ IMPORTANT FIX
export const removeAccessToken = async () => {
  localStorage.removeItem("accessToken");

  // wait ALL cleanup listeners
  await Promise.all(listeners.map((cb) => Promise.resolve(cb(null))));
};
