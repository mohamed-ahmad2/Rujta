import React, { createContext, useEffect, useState, useCallback } from "react";

import {
  login,
  registerUser,
  registerStaff,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  socialLogin,
  changePassword,
} from "../api/authApi";

import apiClient from "../../../shared/api/apiClient";
import {
  setAccessToken,
  removeAccessToken,
} from "../../../authProvider/authTokenProvider";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext(null);

/* ================= Helpers ================= */

const applyToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

const applyAndStoreToken = (token, setTokenExp) => {
  if (!token) return;
  localStorage.setItem("token", token);
  setAccessToken(token);
  applyToken(token);
  const decoded = decodeToken(token);
  if (decoded?.exp) setTokenExp(decoded.exp * 1000);
};

/* ================= Provider ================= */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExp, setTokenExp] = useState(null);

  /* ================= Init ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          applyToken(token);
          const decoded = decodeToken(token);
          if (decoded?.exp) {
            setTokenExp(decoded.exp * 1000);
          }
        }

        const userData = await getCurrentUser();

        if (userData) {
          setUser({
            email: userData.email,
            role: userData.role,
            isFirstLogin: userData.isFirstLogin ?? false,
          });
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* ================= Login ================= */
  const handleLogin = async (email, password, rememberMe = false) => {
    const res = await login({ email, password, rememberMe });

    const token = res.accessToken;

    const newUser = {
      email: res.email,
      role: res.role,
      isFirstLogin: res.isFirstLogin ?? false,
    };

    setUser(newUser);
    applyAndStoreToken(token, setTokenExp);

    return newUser;
  };

  /* ================= Register ================= */
  const handleRegister = async (dto) => {
    const res = await registerUser(dto);

    const token = res.accessToken;

    const newUser = {
      email: res.email,
      role: res.role ?? "User",
      isFirstLogin: false,
    };

    setUser(newUser);
    applyAndStoreToken(token, setTokenExp);

    return newUser;
  };

  /* ================= Staff ================= */
  const handleRegisterStaff = async (dto) => {
    return await registerStaff(dto);
  };

  /* ================= Logout ================= */
  const handleLogout = useCallback(async () => {
    try {
      setUser(null);
      setTokenExp(null);

      await logout();

      localStorage.removeItem("token");
      await removeAccessToken();
      applyToken(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, []);

  /* ================= Google Login ================= */
  const handleGoogleLogin = useCallback(async (IdToken) => {
    const res = await socialLogin({ IdToken });

    const token = res.accessToken;

    applyAndStoreToken(token, setTokenExp);

    const userData = await getCurrentUser();

    const newUser = {
      email: userData?.email ?? "",
      role: userData?.role ?? "User",
      isFirstLogin: userData?.isFirstLogin ?? false,
    };

    setUser(newUser);

    return { accessToken: token, user: newUser };
  }, []);

  /* ================= Refresh ================= */
  const refreshToken = useCallback(async () => {
    try {
      const res = await apiClient.post("/auth/refresh-token", null, {
        withCredentials: true,
      });

      const token = res.data?.accessToken;

      if (token) {
        applyAndStoreToken(token, setTokenExp);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
      handleLogout();
    }
  }, [handleLogout]);

  /* ================= Auto Refresh ================= */
  useEffect(() => {
    if (!tokenExp || !user) return;

    const interval = setInterval(() => {
      if (tokenExp - Date.now() < 3 * 60 * 1000) {
        refreshToken();
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [tokenExp, user, refreshToken]);

  /* ================= Password ================= */
  const handleForgotPassword = (email) => forgotPassword(email);

  const handleResetPassword = (dto) => resetPassword(dto);

  const handleChangePassword = async (dto) => {
    const res = await changePassword(dto);

    setUser((prev) => ({
      ...prev,
      isFirstLogin: false,
    }));

    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout,
        handleGoogleLogin,
        handleRegisterStaff,
        handleForgotPassword,
        handleResetPassword,
        handleChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
