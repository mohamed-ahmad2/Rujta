import { useEffect, useState } from "react";
import { login, registerUser, logout, getCurrentUser } from "../api/authApi";
import jwt_decode from "jwt-decode";
import apiClient from "../../../shared/api/apiClient";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExp, setTokenExp] = useState(null);

  // Load current user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser({ email: userData.email, role: userData.role });
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Standard login
  const handleLogin = async (email, password) => {
    const response = await login({ email, password });
    setUser({ email: response.email, role: response.role });
    return response;
  };

  // Standard registration
  const handleRegister = async (dto) => {
    try {
      await registerUser(dto);
      const loginResponse = await login({ email: dto.email, password: dto.createPassword });
      const user = { email: loginResponse?.email ?? dto.email, role: loginResponse?.role ?? "User" };
      setUser(user);
      return user;
    } catch (error) {
      console.error("Registration or login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setTokenExp(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Refresh token periodically
  const refreshToken = async () => {
    try {
      const response = await apiClient.post("/auth/refresh-token", null, { withCredentials: true });
      if (response.data.accessToken) {
        const decoded = jwt_decode(response.data.accessToken);
        setTokenExp(decoded.exp * 1000);
      }
    } catch (err) {
      console.error("Proactive refresh failed", err);
      handleLogout();
    }
  };

  useEffect(() => {
    if (!tokenExp || !user) return;
    const interval = setInterval(() => {
      if (tokenExp - Date.now() < 3 * 60 * 1000) {
        refreshToken();
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [tokenExp, user]);

  // Forgot password
  const forgotPassword = async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  };

  // Reset password
  const resetPassword = async ({ email, otp, newPassword }) => {
    const response = await apiClient.post("/auth/reset-password", { email, otp, newPassword });
    return response.data;
  };
const handleSocialLogin = async (dto) => {
  try {
    const response = await apiClient.post("/auth/social-login", dto);
    const decoded = jwt_decode(response.accessToken);
    setUser({ email: decoded.email, role: decoded.role });
    setTokenExp(decoded.exp * 1000);
    return response;
  } catch (error) {
    console.error("Social login failed:", error.response?.data || error.message);
    throw error;
  }
};

  

  return {
    user,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
     handleSocialLogin, 
    forgotPassword,
    resetPassword,
  
  };
};
