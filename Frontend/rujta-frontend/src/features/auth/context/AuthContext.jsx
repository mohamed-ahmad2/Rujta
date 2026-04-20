// src/features/auth/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  login, registerUser, registerStaff, logout,
  getCurrentUser, forgotPassword, resetPassword, socialLogin,
} from "../api/authApi";
import apiClient from "../../../shared/api/apiClient";
import { setAccessToken, removeAccessToken } from "../../../authProvider/authTokenProvider";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,     setUser]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tokenExp, setTokenExp] = useState(null);

  const applyToken = useCallback((token) => {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }, []);

  const updateTokenExp = useCallback((token) => {
    if (!token) return;
    try {
      // decode exp from JWT payload (no library needed)
      const payload = JSON.parse(atob(token.split(".")[1]));
      setTokenExp(payload.exp * 1000);
    } catch {
      console.error("Failed to decode token");
    }
  }, []);

  // ── Load user on app start ──────────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) applyToken(storedToken);

        const userData = await getCurrentUser();
        if (userData) {
          setUser({ email: userData.email, role: userData.role });
          if (storedToken) updateTokenExp(storedToken);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false); // ← ALWAYS runs, loading never stays true
      }
    };
    loadUser();
  }, [applyToken, updateTokenExp]);

  // ── Login ───────────────────────────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    const response = await login({ email, password });
    setUser({ email: response.email, role: response.role });
    if (response.accessToken) {
      setAccessToken(response.accessToken);
      applyToken(response.accessToken);
      updateTokenExp(response.accessToken);
      localStorage.setItem("token", response.accessToken);
    }
    return response;
  };

  // ── Register ────────────────────────────────────────────────────────────────
  const handleRegister = async (dto) => {
    try {
      await registerUser(dto);
      const res = await login({ email: dto.email, password: dto.createPassword });
      const loggedUser = { email: res?.email ?? dto.email, role: res?.role ?? "User" };
      setUser(loggedUser);
      if (res.accessToken) {
        setAccessToken(res.accessToken);
        applyToken(res.accessToken);
        updateTokenExp(res.accessToken);
        localStorage.setItem("token", res.accessToken);
      }
      return loggedUser;
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      throw err;
    }
  };

  // ── Register staff ──────────────────────────────────────────────────────────
  const handleRegisterStaff = async (dto) => {
    try {
      return await registerStaff(dto);
    } catch (err) {
      console.error("Register staff failed:", err.response?.data || err.message);
      throw err;
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try {
      setUser(null);
      setTokenExp(null);
      await logout();
      applyToken(null);
      await removeAccessToken();
      localStorage.removeItem("token");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }, [applyToken]);

  // ── Google login ────────────────────────────────────────────────────────────
  const handleGoogleLogin = useCallback(async (IdToken) => {
    try {
      const response = await socialLogin({ IdToken });
      if (response) {
        const { accessToken, email, role } = response;
        setUser({ email, role });
        if (accessToken) {
          setAccessToken(accessToken);
          applyToken(accessToken);
          updateTokenExp(accessToken);
          localStorage.setItem("token", accessToken);
        }
      }
      return response;
    } catch (err) {
      console.error("Google login failed:", err.response?.data || err.message);
      throw err;
    }
  }, [applyToken, updateTokenExp]);

  // ── Proactive token refresh ─────────────────────────────────────────────────
  const refreshToken = useCallback(async () => {
    try {
      const res = await apiClient.post("/auth/refresh-token", null, { withCredentials: true });
      if (res.data?.accessToken) {
        applyToken(res.data.accessToken);
        updateTokenExp(res.data.accessToken);
        localStorage.setItem("token", res.data.accessToken);
      }
    } catch (err) {
      console.error("Token refresh failed", err);
      handleLogout();
    }
  }, [applyToken, updateTokenExp, handleLogout]);

  useEffect(() => {
    if (!tokenExp || !user) return;
    const interval = setInterval(() => {
      if (tokenExp - Date.now() < 3 * 60 * 1000) refreshToken();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [tokenExp, user, refreshToken]);

  // ── Password ────────────────────────────────────────────────────────────────
  const handleForgotPassword = (email) => forgotPassword(email);
  const handleResetPassword  = (dto)   => resetPassword(dto);

  const value = {
    user, loading,
    handleLogin, handleRegister, handleLogout,
    handleGoogleLogin, handleRegisterStaff,
    handleForgotPassword, handleResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── useAuth hook — everyone shares the same state ──────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>. Wrap your app in main.jsx.");
  return ctx;
};
