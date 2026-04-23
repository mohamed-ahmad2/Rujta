import { useEffect, useState, useCallback } from "react";
import {
  login,
  registerUser,
  registerStaff,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  socialLogin, // updated
  changePassword, // 👈 ADD THIS
} from "../api/authApi";
import apiClient from "../../../shared/api/apiClient";
import jwt_decode from "jwt-decode";

import {
  setAccessToken,
  removeAccessToken,
} from "../../../authProvider/authTokenProvider";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExp, setTokenExp] = useState(null);

  // Load current user on mount
  useEffect(() => {
  const token = localStorage.getItem("token");
  const isFirstLogin = localStorage.getItem("IsFirstLogin") === "true";
  if (token) {
    try {
      const decoded = jwt_decode(token);
      setUser({
        email: decoded.email,
        role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        IsFirstLogin: isFirstLogin,
      });
      updateTokenExp(token);
    } catch {
      setUser(null);
    }
  }
  setLoading(false);
}, []); // 👈 same empty array []
  // Standard login
  const handleLogin = async (email, password) => {
  const response = await login({ email, password });

  // 👇 Save IsFirstLogin to localStorage
  localStorage.setItem("IsFirstLogin", response.isFirstLogin ?? false);

  setUser({
    email: response.email,
    role: response.role,
    IsFirstLogin: response.isFirstLogin ?? false,
  });

  if (response.accessToken) {
    setAccessToken(response.accessToken);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.accessToken}`;
    updateTokenExp(response.accessToken);
    localStorage.setItem("token", response.accessToken);
  }

  setTimeout(() => {
    window.location.reload();
  }, 60);

  return response;
};
  // Standard registration
  const handleRegister = async (dto) => {
    try {
      await registerUser(dto);
      const loginResponse = await login({
        email: dto.email,
        password: dto.createPassword,
      });
      const loggedUser = {
        email: loginResponse?.email ?? dto.email,
        role: loginResponse?.role ?? "User",
      };
      setUser(loggedUser);

      if (loginResponse.accessToken) {
        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${loginResponse.accessToken}`;
        updateTokenExp(loginResponse.accessToken);
      }
      return loggedUser;
    } catch (error) {
      console.error(
        "Registration or login failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  };

  // Register pharmacy staff (Pharmacist) - Admin only
  const handleRegisterStaff = async (dto) => {
    try {
      const response = await registerStaff(dto);
      return response;
    } catch (error) {
      console.error(
        "Register staff failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  };

  // Logout
  const handleLogout = async () => {
  try {
    setUser(null);
    setTokenExp(null);

    await logout();

    delete apiClient.defaults.headers.common["Authorization"];

    await removeAccessToken();

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
          apiClient.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
          updateTokenExp(accessToken);
        }
      }
      setTimeout(() => {
        window.location.reload();
      }, 50);
      return response;
    } catch (error) {
      console.error(
        "Google login failed:",
        error.response?.data || error.message,
      );
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
      const response = await apiClient.post("/auth/refresh-token", null, {
        withCredentials: true,
      });
      if (response.data?.accessToken) {
        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.accessToken}`;
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
  const handleChangePassword = async ({ newPassword, email, password }) => {
  const response = await changePassword({ newPassword });
  
  // ✅ Clear IsFirstLogin immediately
  localStorage.setItem("IsFirstLogin", "false");
  setUser((prev) => ({ ...prev, IsFirstLogin: false }));
  
  return response;
};

  return {
    user,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGoogleLogin,
    handleRegisterStaff,
    handleForgotPassword,
    handleResetPassword,
    handleChangePassword, // 👈 ADD THIS
  };
};
// src/features/auth/hooks/useAuth.js
// Re-exports from context so every existing import still works unchanged.
export { useAuth } from "../context/AuthContext";
