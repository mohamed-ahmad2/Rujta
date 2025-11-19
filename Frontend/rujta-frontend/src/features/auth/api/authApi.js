// src/api/authApi.js
import { apiClient } from "../../../shared/api/apiClient";

// Login
export const login = async ({ email, password }) => {
  try {
    const res = await apiClient.post("/auth/login", { email, password });
    return res.data; // { accessToken, refreshToken, ... }
  } catch (error) {
    throw error;
  }
};

// Register
export const registerUser = async ({ name, email, phone, location, createPassword, confirmPassword }) => {
  try {
    const res = await apiClient.post("/auth/register", {
      name,
      email,
      phone,
      location,
      createPassword,
      confirmPassword,
    });
    return res.data; // { userId, tokens }
  } catch (error) {
    throw error;
  }
};

// Refresh Token
export const refreshToken = async (refreshToken) => {
  try {
    const res = await apiClient.post("/auth/refresh-token", { refreshToken });
    return res.data; // { accessToken, refreshToken, ... }
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = async (refreshToken) => {
  try {
    await apiClient.post("/auth/logout", { refreshToken });
  } catch (error) {
    throw error;
  }
};
