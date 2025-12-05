import { useEffect, useState, useCallback } from "react";
import {
  login,
  registerUser,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  socialLogin, // updated
} from "../api/authApi";
import apiClient from "../../../shared/api/apiClient";
import jwt_decode from "jwt-decode";

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
    if (response.accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
      updateTokenExp(response.accessToken);
    }
    return response;
  };

  // Standard registration
  const handleRegister = async (dto) => {
    try {
      await registerUser(dto);
      const loginResponse = await login({ email: dto.email, password: dto.createPassword });
      const loggedUser = {
        email: loginResponse?.email ?? dto.email,
        role: loginResponse?.role ?? "User",
      };
      setUser(loggedUser);

      if (loginResponse.accessToken) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.accessToken}`;
        updateTokenExp(loginResponse.accessToken);
      }
      return loggedUser;
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
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Google login
  const handleGoogleLogin = useCallback(async (IdToken) => {
    try {
      // note: sending { IdToken } to match C# DTO
      const response = await socialLogin({ IdToken });
      if (response) {
        const { accessToken, email, role } = response;
        setUser({ email, role });
        if (accessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          updateTokenExp(accessToken);
        }

      }
      return response;
    } catch (error) {
      console.error("Google login failed:", error.response?.data || error.message);
      throw error;
    }
  }, []);

  // Update access token expiration
  const updateTokenExp = (accessToken) => {
    if (!accessToken) return;
    const decoded = jwt_decode(accessToken);
    setTokenExp(decoded.exp * 1000);
  };

  // Refresh access token periodically
  const refreshToken = useCallback(async () => {
    try {
      const response = await apiClient.post("/auth/refresh-token", null, { withCredentials: true });
      if (response.data?.accessToken) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        updateTokenExp(response.data.accessToken);
      }

    } catch (err) {
      console.error("Proactive refresh failed", err);
      handleLogout();
    }
  }, []);

  useEffect(() => {
    if (!tokenExp || !user) return;
    const interval = setInterval(() => {
      if (tokenExp - Date.now() < 3 * 60 * 1000) {
        refreshToken();
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [tokenExp, user, refreshToken]);

  // Forgot password
  const handleForgotPassword = async (email) => {
    const response = await forgotPassword(email);
    return response;
  };

  // Reset password
  const handleResetPassword = async ({ email, otp, newPassword }) => {
    const response = await resetPassword({ email, otp, newPassword });
    return response;
  };

  return {
    user,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGoogleLogin, // updated
    handleForgotPassword,
    handleResetPassword,
  };
};
