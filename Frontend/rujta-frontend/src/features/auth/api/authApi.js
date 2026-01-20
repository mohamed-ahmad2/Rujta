// src/features/auth/api/authApi.js
import apiClient from "../../../shared/api/apiClient";

export const login = async ({ email, password }) => {
  const res = await apiClient.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (dto) => {
  const res = await apiClient.post("/auth/register", dto);
  return res.data;
};

export const logout = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (err) {
    console.error("Logout failed", err);
    throw err;
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await apiClient.get("/auth/me");
    return res.data;
  } catch {
    return null;
  }
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await apiClient.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return response.data;
};

export const socialLogin = async ({ IdToken }) => {
  const response = await apiClient.post(
    "/auth/google-login",
    { IdToken },
    { withCredentials: true }
  );
  return response.data;
};

export const registerStaff = async (dto) => {
  const res = await apiClient.post("/auth/register/staff", dto);
  return res.data;
};