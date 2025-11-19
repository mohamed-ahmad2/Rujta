// src/hooks/useAuth.js
import { useState } from "react";
import { login, registerUser, refreshToken, logout } from "../api/authApi";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  // Login
  const handleLogin = async (email, password) => {
    const tokens = await login({ email, password });
    setUser({ email });
    return tokens;
  };

  // Register
  const handleRegister = async (dto) => {
    const data = await registerUser(dto);
    return data;
  };

  // Refresh token
  const handleRefresh = async (refreshTokenValue) => {
    const data = await refreshToken(refreshTokenValue);
    return data;
  };

  // Logout
  const handleLogout = async (refreshTokenValue) => {
    await logout(refreshTokenValue);
    setUser(null);
  };

  return {
    user,
    handleLogin,
    handleRegister,
    handleRefresh,
    handleLogout,
  };
};
